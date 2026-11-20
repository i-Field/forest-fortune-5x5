import indexHtml from './index.html';

const STAR_PACKAGES = {
  p100: {
    coins: 1000,
    stars: 50,
    title: '1 000 Монет · Forest Fortune',
    description: 'Стартовый пакет монет для игры Forest Fortune 5x5',
  },
  p500: {
    coins: 5000,
    stars: 200,
    title: '5 000 Монет · Forest Fortune',
    description: 'Популярный пакет монет для игры Forest Fortune 5x5',
  },
  p2000: {
    coins: 20000,
    stars: 650,
    title: '20 000 Монет · Forest Fortune',
    description: 'Выгодный пакет монет (+30%) для Forest Fortune 5x5',
  },
  p10000: {
    coins: 100000,
    stars: 2500,
    title: '100 000 Монет · Vegas VIP',
    description: 'VIP-пакет монет для игры Forest Fortune 5x5',
  },
};

const memUsers = new Map();
const memPayments = new Set();
let memJackpot = 500000;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function getBotToken(env) {
  return String(env.BOT_TOKEN || '').trim();
}

async function hmacSha256(keyBytes, message) {
  const rawKey = keyBytes instanceof Uint8Array ? keyBytes : new Uint8Array(keyBytes);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyTelegramInitData(initData, botToken) {
  if (!initData || !botToken) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;

  params.delete('hash');
  const entries = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');

  const secretKey = await hmacSha256(new TextEncoder().encode('WebAppData'), botToken);
  const computedHex = toHex(await hmacSha256(secretKey, dataCheckString));

  if (computedHex.toLowerCase() !== hash.toLowerCase()) {
    return null;
  }

  const userRaw = params.get('user');
  if (!userRaw) return null;

  try {
    const user = JSON.parse(userRaw);
    return user && user.id ? user : null;
  } catch {
    return null;
  }
}

async function callTelegramBotApi(botToken, method, payload = {}) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

async function getWebhookSecret(env) {
  if (env.TELEGRAM_WEBHOOK_SECRET) {
    return String(env.TELEGRAM_WEBHOOK_SECRET).trim();
  }
  const digest = await hmacSha256(
    new TextEncoder().encode('forest-fortune-webhook-secret'),
    getBotToken(env)
  );
  return toHex(digest).slice(0, 32);
}

function createStore(env) {
  const kv = env.KV_BINDING || env.KV || env.empire_DB || null;
  const db = env.DB || null;

  if (kv) {
    const updateLeaderboard = async (userId, name, balance) => {
      const raw = await kv.get('leaderboard', 'json');
      const list = Array.isArray(raw) ? raw : [];
      const idx = list.findIndex((item) => item.id === userId);
      const entry = { id: userId, name, balance };
      if (idx >= 0) {
        list[idx] = entry;
      } else {
        list.push(entry);
      }
      list.sort((a, b) => (b.balance || 0) - (a.balance || 0));
      await kv.put('leaderboard', JSON.stringify(list.slice(0, 50)));
    };

    return {
      async getOrCreateUser(userId, displayName, username, startParam) {
        const key = `user:${userId}`;
        let user = await kv.get(key, 'json');
        let creditedInviterId = null;

        if (!user) {
          let inviterId = null;
          if (startParam && startParam.startsWith('ref_')) {
            const candidate = startParam.slice(4).trim();
            if (candidate && candidate !== userId) {
              inviterId = candidate;
            }
          }

          user = {
            id: userId,
            name: displayName,
            username,
            balance: 1000,
            referred_by: inviterId,
            last_daily_date: '',
            updated_at: new Date().toISOString(),
          };
          await kv.put(key, JSON.stringify(user));
          await updateLeaderboard(userId, displayName, user.balance);

          if (inviterId) {
            const invKey = `user:${inviterId}`;
            const inviter = await kv.get(invKey, 'json');
            if (inviter) {
              inviter.balance = (Number(inviter.balance) || 0) + 5000;
              inviter.updated_at = new Date().toISOString();
              await kv.put(invKey, JSON.stringify(inviter));
              await updateLeaderboard(inviterId, inviter.name || `Player_${inviterId.slice(-4)}`, inviter.balance);
              creditedInviterId = inviterId;
            }
          }
        } else {
          user.name = displayName;
          user.username = username;
          user.updated_at = new Date().toISOString();
          await kv.put(key, JSON.stringify(user));
          await updateLeaderboard(userId, displayName, user.balance);
        }

        return { user, creditedInviterId };
      },

      async getUser(userId) {
        return kv.get(`user:${userId}`, 'json');
      },

      async saveUser(user) {
        user.updated_at = new Date().toISOString();
        await kv.put(`user:${user.id}`, JSON.stringify(user));
        await updateLeaderboard(user.id, user.name || `Player_${String(user.id).slice(-4)}`, user.balance);
      },

      async getJackpot() {
        const val = await kv.get('game:jackpot');
        const num = Number(val);
        return Number.isFinite(num) && num > 0 ? Math.floor(num) : 500000;
      },

      async setJackpot(val) {
        await kv.put('game:jackpot', String(Math.floor(val)));
      },

      async hasPayment(chargeId) {
        const val = await kv.get(`payment:${chargeId}`);
        return Boolean(val);
      },

      async recordPaymentAndCredit(chargeId, userId, packageId, starsAmount, coins) {
        await kv.put(
          `payment:${chargeId}`,
          JSON.stringify({ userId, packageId, starsAmount, coins, at: new Date().toISOString() })
        );
        const key = `user:${userId}`;
        const user = (await kv.get(key, 'json')) || {
          id: userId,
          name: `Player_${userId.slice(-4)}`,
          username: '',
          balance: 1000,
          last_daily_date: '',
        };
        user.balance = (Number(user.balance) || 0) + coins;
        user.updated_at = new Date().toISOString();
        await kv.put(key, JSON.stringify(user));
        await updateLeaderboard(userId, user.name, user.balance);
      },

      async getLeaderboard() {
        const raw = await kv.get('leaderboard', 'json');
        const list = Array.isArray(raw) ? raw : [];
        return list.slice(0, 20).map(({ name, balance }) => ({ name, balance }));
      },
    };
  }

  if (db) {
    return {
      async getOrCreateUser(userId, displayName, username, startParam) {
        let existing = await db
          .prepare('SELECT id, name, balance, last_daily_date FROM users WHERE id = ?')
          .bind(userId)
          .first();
        let creditedInviterId = null;

        if (!existing) {
          let inviterId = null;
          if (startParam && startParam.startsWith('ref_')) {
            const candidate = startParam.slice(4).trim();
            if (candidate && candidate !== userId) {
              inviterId = candidate;
            }
          }

          await db
            .prepare('INSERT INTO users (id, name, username, balance, referred_by) VALUES (?, ?, ?, ?, ?)')
            .bind(userId, displayName, username, 1000, inviterId)
            .run();

          if (inviterId) {
            await db
              .prepare("UPDATE users SET balance = balance + 5000, updated_at = datetime('now') WHERE id = ?")
              .bind(inviterId)
              .run();
            creditedInviterId = inviterId;
          }

          existing = { id: userId, name: displayName, balance: 1000, last_daily_date: '' };
        } else {
          await db
            .prepare("UPDATE users SET name = ?, username = ?, updated_at = datetime('now') WHERE id = ?")
            .bind(displayName, username, userId)
            .run();
        }
        return { user: existing, creditedInviterId };
      },

      async getUser(userId) {
        return db
          .prepare('SELECT id, name, balance, last_daily_date FROM users WHERE id = ?')
          .bind(userId)
          .first();
      },

      async saveUser(user) {
        await db
          .prepare("UPDATE users SET balance = ?, last_daily_date = ?, updated_at = datetime('now') WHERE id = ?")
          .bind(user.balance, user.last_daily_date || '', user.id)
          .run();
      },

      async getJackpot() {
        const row = await db
          .prepare('SELECT value_int FROM game_state WHERE key = ?')
          .bind('jackpot')
          .first();
        return row && row.value_int ? Number(row.value_int) : 500000;
      },

      async setJackpot(val) {
        await db
          .prepare(
            "INSERT INTO game_state (key, value_int, updated_at) VALUES ('jackpot', ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value_int = excluded.value_int, updated_at = excluded.updated_at"
          )
          .bind(Math.floor(val))
          .run();
      },

      async hasPayment(chargeId) {
        const row = await db
          .prepare('SELECT charge_id FROM payments WHERE charge_id = ?')
          .bind(chargeId)
          .first();
        return Boolean(row);
      },

      async recordPaymentAndCredit(chargeId, userId, packageId, starsAmount, coins) {
        await db
          .prepare(
            'INSERT INTO payments (charge_id, user_id, package_id, stars_amount, coins_credited) VALUES (?, ?, ?, ?, ?)'
          )
          .bind(chargeId, userId, packageId, starsAmount, coins)
          .run();

        await db
          .prepare("UPDATE users SET balance = balance + ?, updated_at = datetime('now') WHERE id = ?")
          .bind(coins, userId)
          .run();
      },

      async getLeaderboard() {
        const { results } = await db
          .prepare('SELECT name, balance FROM users ORDER BY balance DESC LIMIT 20')
          .all();
        return results || [];
      },
    };
  }

  return {
    async getOrCreateUser(userId, displayName, username, startParam) {
      let user = memUsers.get(userId);
      let creditedInviterId = null;
      if (!user) {
        user = { id: userId, name: displayName, username, balance: 1000, last_daily_date: '' };
        memUsers.set(userId, user);
        if (startParam && startParam.startsWith('ref_')) {
          const inviterId = startParam.slice(4).trim();
          const inviter = memUsers.get(inviterId);
          if (inviter && inviterId !== userId) {
            inviter.balance += 5000;
            creditedInviterId = inviterId;
          }
        }
      } else {
        user.name = displayName;
        user.username = username;
      }
      return { user, creditedInviterId };
    },
    async getUser(userId) {
      return memUsers.get(userId) || null;
    },
    async saveUser(user) {
      memUsers.set(user.id, user);
    },
    async getJackpot() {
      return memJackpot;
    },
    async setJackpot(val) {
      memJackpot = Math.floor(val);
    },
    async hasPayment(chargeId) {
      return memPayments.has(chargeId);
    },
    async recordPaymentAndCredit(chargeId, userId, _packageId, _starsAmount, coins) {
      memPayments.add(chargeId);
      const user = memUsers.get(userId) || { id: userId, name: `Player_${userId.slice(-4)}`, balance: 1000, last_daily_date: '' };
      user.balance += coins;
      memUsers.set(userId, user);
    },
    async getLeaderboard() {
      return Array.from(memUsers.values())
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 20)
        .map(({ name, balance }) => ({ name, balance }));
    },
  };
}

async function handleBalance(request, env, store) {
  const botToken = getBotToken(env);
  const body = await request.json().catch(() => ({}));
  const user = await verifyTelegramInitData(body.initData || '', botToken);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const userId = String(user.id);
  const displayName = user.first_name || user.username || `Player_${userId.slice(-4)}`;
  const username = user.username || '';

  const { user: saved, creditedInviterId } = await store.getOrCreateUser(
    userId,
    displayName,
    username,
    body.startParam || null
  );

  if (creditedInviterId && botToken) {
    try {
      await callTelegramBotApi(botToken, 'sendMessage', {
        chat_id: creditedInviterId,
        text: `🎉 По вашей ссылке присоединился игрок ${displayName}!\nВам начислено +5 000 монет 🪙`,
      });
    } catch {
      // Ignore if inviter blocked the bot
    }
  }

  const jackpot = await store.getJackpot();

  return json({
    balance: Number(saved.balance) || 0,
    jackpot,
  });
}

async function handleSpin(request, env, store) {
  const botToken = getBotToken(env);
  const body = await request.json().catch(() => ({}));
  const user = await verifyTelegramInitData(body.initData || '', botToken);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const userId = String(user.id);
  const betAmount = Math.max(0, Math.floor(Number(body.betAmount) || 0));
  let safeBalance = Math.max(0, Math.floor(Number(body.newBalance) || 0));

  let jackpot = await store.getJackpot();
  if (betAmount > 0) {
    jackpot += Math.max(1, Math.floor(betAmount * 0.01));
  }

  let jackpotWon = false;
  let winAmount = 0;
  if (betAmount >= 10 && Math.random() < 0.0001) {
    jackpotWon = true;
    winAmount = jackpot;
    safeBalance += winAmount;
    jackpot = 50000;
  }

  const existing = (await store.getUser(userId)) || {
    id: userId,
    name: user.first_name || user.username || `Player_${userId.slice(-4)}`,
    last_daily_date: '',
  };
  existing.balance = safeBalance;

  await store.saveUser(existing);
  await store.setJackpot(jackpot);

  return json({ jackpot, jackpotWon, winAmount, newBalance: safeBalance });
}

async function handleDailyBonus(request, env, store) {
  const botToken = getBotToken(env);
  const body = await request.json().catch(() => ({}));
  const user = await verifyTelegramInitData(body.initData || '', botToken);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const userId = String(user.id);
  const todayUtc = new Date().toISOString().slice(0, 10);

  const row = await store.getUser(userId);
  if (!row) return json({ ok: false, error: 'Пользователь не найден' }, 404);
  if (row.last_daily_date === todayUtc) {
    return json({ ok: false, error: 'Бонус уже получен сегодня!' }, 400);
  }

  row.balance = (Number(row.balance) || 0) + 100;
  row.last_daily_date = todayUtc;
  await store.saveUser(row);

  return json({ ok: true, balance: row.balance });
}

async function handleInvoice(request, env) {
  const botToken = getBotToken(env);
  const body = await request.json().catch(() => ({}));
  const user = await verifyTelegramInitData(body.initData || '', botToken);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const pkgId = body.packageId || '';
  const pkg = STAR_PACKAGES[pkgId];
  if (!pkg) return json({ error: 'Unknown package' }, 400);

  const tgRes = await callTelegramBotApi(botToken, 'createInvoiceLink', {
    title: pkg.title,
    description: pkg.description,
    payload: JSON.stringify({ uid: String(user.id), pkg: pkgId }),
    provider_token: '',
    currency: 'XTR',
    prices: [{ label: pkg.title, amount: pkg.stars }],
  });

  if (!tgRes.ok || typeof tgRes.result !== 'string') {
    return json({ error: tgRes.description || 'Failed to create Stars invoice' }, 502);
  }

  return json({ invoiceLink: tgRes.result });
}

async function handleLeaderboard(store) {
  const list = await store.getLeaderboard();
  return json(list);
}

async function handleSetup(request, env) {
  const botToken = getBotToken(env);
  if (!botToken) {
    return json({ ok: false, error: 'BOT_TOKEN secret is not configured in Cloudflare' }, 500);
  }

  const origin = (env.WEBAPP_URL || new URL(request.url).origin).replace(/\/$/, '');
  const webhookUrl = `${origin}/api/telegram-webhook`;
  const secretToken = await getWebhookSecret(env);

  const webhookRes = await callTelegramBotApi(botToken, 'setWebhook', {
    url: webhookUrl,
    secret_token: secretToken,
    allowed_updates: ['message', 'pre_checkout_query', 'callback_query'],
    drop_pending_updates: false,
  });

  const menuRes = await callTelegramBotApi(botToken, 'setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: '🎰 Играть',
      web_app: { url: origin },
    },
  });

  const cmdRes = await callTelegramBotApi(botToken, 'setMyCommands', {
    commands: [
      { command: 'start', description: '🎰 Запустить Forest Fortune' },
      { command: 'top', description: '🏆 Таблица лидеров' },
    ],
  });

  const infoRes = await callTelegramBotApi(botToken, 'getWebhookInfo');

  return json({
    ok: Boolean(webhookRes.ok && menuRes.ok),
    webhookUrl,
    webhook: Boolean(webhookRes.ok),
    menuButton: Boolean(menuRes.ok),
    commands: Boolean(cmdRes.ok),
    pendingUpdates: infoRes.result ? infoRes.result.pending_update_count : null,
    lastError: infoRes.result ? infoRes.result.last_error_message || null : null,
    description: webhookRes.description || menuRes.description || null,
  });
}

async function sendTopLeaderboard(botToken, chatId, appUrl, store) {
  const list = await store.getLeaderboard();
  const medals = ['🥇', '🥈', '🥉'];
  const lines = list.slice(0, 10).map((item, idx) => {
    const prefix = medals[idx] || `${idx + 1}.`;
    return `${prefix} ${item.name || 'Player'} — ${Number(item.balance || 0).toLocaleString('ru-RU')} 🪙`;
  });

  const text = lines.length
    ? `🏆 <b>ТОП-10 игроков Forest Fortune 5x5</b>\n\n${lines.join('\n')}`
    : '🏆 Пока в таблице лидеров никого нет. Стань первым!';

  await callTelegramBotApi(botToken, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{ text: '🎰 Играть сейчас', web_app: { url: appUrl } }]],
    },
  });
}

async function handleWebhook(request, env, store) {
  const botToken = getBotToken(env);
  if (botToken) {
    const expectedSecret = await getWebhookSecret(env);
    const secretHeader = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (secretHeader !== expectedSecret) {
      return json({ error: 'Forbidden' }, 403);
    }
  }

  const update = await request.json().catch(() => ({}));
  const origin = (env.WEBAPP_URL || new URL(request.url).origin).replace(/\/$/, '');

  if (update.pre_checkout_query) {
    const q = update.pre_checkout_query;
    let valid = false;
    try {
      const parsed = JSON.parse(q.invoice_payload);
      const pkg = parsed.pkg ? STAR_PACKAGES[parsed.pkg] : undefined;
      valid = Boolean(pkg && q.currency === 'XTR' && q.total_amount === pkg.stars);
    } catch {
      valid = false;
    }

    await callTelegramBotApi(botToken, 'answerPreCheckoutQuery', {
      pre_checkout_query_id: q.id,
      ok: valid,
      ...(valid ? {} : { error_message: 'Пакет не найден или сумма не совпадает.' }),
    });
    return json({ ok: true });
  }

  if (update.callback_query) {
    const cq = update.callback_query;
    await callTelegramBotApi(botToken, 'answerCallbackQuery', {
      callback_query_id: cq.id,
    });
    if (cq.data === 'leaderboard' && cq.message && cq.message.chat && cq.message.chat.id) {
      await sendTopLeaderboard(botToken, cq.message.chat.id, origin, store);
    }
    return json({ ok: true });
  }

  const payment = update.message && update.message.successful_payment;
  if (payment && update.message.chat && update.message.chat.id) {
    try {
      const parsed = JSON.parse(payment.invoice_payload);
      const pkg = parsed.pkg ? STAR_PACKAGES[parsed.pkg] : undefined;
      const userId = parsed.uid || String((update.message.from && update.message.from.id) || '');

      if (pkg && userId) {
        const exists = await store.hasPayment(payment.telegram_payment_charge_id);
        if (!exists) {
          await store.recordPaymentAndCredit(
            payment.telegram_payment_charge_id,
            userId,
            parsed.pkg,
            payment.total_amount,
            pkg.coins
          );

          await callTelegramBotApi(botToken, 'sendMessage', {
            chat_id: update.message.chat.id,
            text: `✅ Оплата прошла успешно! На ваш баланс начислено +${pkg.coins.toLocaleString('ru-RU')} монет 🪙`,
          });
        }
      }
    } catch {
      // Ignore malformed payload
    }
    return json({ ok: true });
  }

  const msg = update.message;
  if (msg && msg.chat && msg.chat.id && msg.text) {
    const text = msg.text.trim();
    if (text.startsWith('/start')) {
      const parts = text.split(/\s+/);
      const startParam = parts[1] || '';
      const appUrl = startParam ? `${origin}?startapp=${encodeURIComponent(startParam)}` : origin;
      const firstName = (msg.from && msg.from.first_name) ? `, ${msg.from.first_name}` : '';

      await callTelegramBotApi(botToken, 'sendMessage', {
        chat_id: msg.chat.id,
        text:
          `🌲 <b>Добро пожаловать в Forest Fortune 5x5${firstName}!</b>\n\n` +
          `🎰 21 линия выплат, каскадные победы, Sticky Wilds, Колесо Фортуны и прогрессивный джекпот ждут тебя.\n` +
          `🎁 Забирай ежедневный бонус, выполняй задания и приглашай друзей (+5 000 🪙 за каждого)!`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🎰 Играть / Play Now', web_app: { url: appUrl } }],
            [{ text: '🏆 Топ игроков', callback_data: 'leaderboard' }],
          ],
        },
      });
    } else if (text.startsWith('/top')) {
      await sendTopLeaderboard(botToken, msg.chat.id, origin, store);
    }
  }

  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const store = createStore(env);

    try {
      if (url.pathname === '/api/balance' && request.method === 'POST') {
        return await handleBalance(request, env, store);
      }
      if (url.pathname === '/api/spin' && request.method === 'POST') {
        return await handleSpin(request, env, store);
      }
      if (url.pathname === '/api/daily-bonus' && request.method === 'POST') {
        return await handleDailyBonus(request, env, store);
      }
      if (url.pathname === '/api/invoice' && request.method === 'POST') {
        return await handleInvoice(request, env);
      }
      if (url.pathname === '/api/leaderboard' && request.method === 'GET') {
        return await handleLeaderboard(store);
      }
      if (url.pathname === '/api/setup' && (request.method === 'GET' || request.method === 'POST')) {
        return await handleSetup(request, env);
      }
      if (url.pathname === '/api/telegram-webhook' && request.method === 'POST') {
        return await handleWebhook(request, env, store);
      }
      if (url.pathname.startsWith('/api/')) {
        return json({ error: 'Not Found' }, 404);
      }
    } catch (err) {
      return json({ error: (err && err.message) || 'Server error' }, 500);
    }

    return new Response(indexHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  },
};
