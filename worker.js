import indexHtml from './index.html';

const LINE_PRESETS = [1, 3, 5, 9, 15, 21];
const SYMBOLS = [
  'gem.png', 'wild.png', 'mushroom.png', 'ufo.png', 'weed_cross.png', 'tech_face.png',
  'man.png', 'man2.png', 'hutor.png', 'firebird.png', 'rabbit.png', 'real_hedgehog.png',
  'bear.png', 'fox.png', 'deer.png', 'owl.png', 'squirrel.png', 'squirrel1.png',
  'raccoon.png', 'hedgehog.png', 'pinecone.png', 'acorn.png', 'leaf.png', 'coin.png'
];
const BASE_WEIGHTS = {
  'gem.png': 10, 'wild.png': 8, 'mushroom.png': 12, 'ufo.png': 4, 'weed_cross.png': 4, 'tech_face.png': 6,
  'man.png': 6, 'man2.png': 8, 'hutor.png': 10, 'firebird.png': 12, 'rabbit.png': 15, 'real_hedgehog.png': 18,
  'bear.png': 20, 'fox.png': 22, 'deer.png': 22, 'owl.png': 25, 'squirrel.png': 28, 'squirrel1.png': 28,
  'raccoon.png': 30, 'hedgehog.png': 30, 'pinecone.png': 35, 'acorn.png': 35, 'leaf.png': 35, 'coin.png': 40
};
const TOTAL_WEIGHT = SYMBOLS.reduce((acc, s) => acc + BASE_WEIGHTS[s], 0);
const PAYTABLE = {
  'gem.png': [15, 60, 250], 'wild.png': [30, 100, 500], 'mushroom.png': [15, 50, 200], 'ufo.png': [30, 200, 1500],
  'weed_cross.png': [30, 150, 1000], 'tech_face.png': [25, 120, 800], 'man.png': [25, 100, 600], 'man2.png': [20, 100, 500],
  'hutor.png': [20, 90, 400], 'firebird.png': [15, 70, 300], 'rabbit.png': [15, 60, 250], 'real_hedgehog.png': [10, 40, 200],
  'bear.png': [10, 30, 150], 'fox.png': [8, 25, 100], 'deer.png': [8, 25, 100], 'owl.png': [5, 15, 80],
  'squirrel.png': [4, 12, 60], 'squirrel1.png': [4, 12, 60], 'raccoon.png': [3, 10, 50], 'hedgehog.png': [3, 10, 50],
  'pinecone.png': [2, 8, 40], 'acorn.png': [2, 8, 40], 'leaf.png': [2, 8, 40], 'coin.png': [2, 5, 30]
};
const PAYLINES = [
  [[0,0],[1,0],[2,0],[3,0],[4,0]], [[0,1],[1,1],[2,1],[3,1],[4,1]], [[0,2],[1,2],[2,2],[3,2],[4,2]],
  [[0,3],[1,3],[2,3],[3,3],[4,3]], [[0,4],[1,4],[2,4],[3,4],[4,4]], [[0,0],[1,1],[2,2],[3,1],[4,0]],
  [[0,4],[1,3],[2,2],[3,3],[4,4]], [[0,1],[1,2],[2,3],[3,2],[4,1]], [[0,3],[1,2],[2,1],[3,2],[4,3]],
  [[0,0],[1,0],[2,1],[3,2],[4,2]], [[0,4],[1,4],[2,3],[3,2],[4,2]], [[0,2],[1,1],[2,0],[3,1],[4,2]],
  [[0,2],[1,3],[2,4],[3,3],[4,2]], [[0,1],[1,0],[2,0],[3,0],[4,1]], [[0,3],[1,4],[2,4],[3,4],[4,3]],
  [[0,0],[1,1],[2,1],[3,1],[4,0]], [[0,4],[1,3],[2,3],[3,3],[4,4]], [[0,1],[1,1],[2,2],[3,3],[4,3]],
  [[0,3],[1,3],[2,2],[3,1],[4,1]], [[0,0],[1,2],[2,4],[3,2],[4,0]], [[0,4],[1,2],[2,0],[3,2],[4,4]]
];
const WHEEL_PRIZES = [
  { type: 'jackpot', val: 50000, label: 'JP' },
  { type: 'fs', val: 20, label: '20 FS' },
  { type: 'mult', val: 50, label: 'x50' },
  { type: 'mult', val: 2, label: 'x2' },
  { type: 'mult', val: 5, label: 'x5' },
  { type: 'fs', val: 10, label: '10 FS' },
  { type: 'mult', val: 10, label: 'x10' },
  { type: 'mult', val: 3, label: 'x3' }
];
const STAR_PACKAGES = {
  p100: { coins: 1000, stars: 50, title: '1 000 Монет · Starter', description: 'Стартовый пакет монет Forest Fortune 5x5' },
  p500: { coins: 5000, stars: 200, title: '5 000 Монет · Popular', description: 'Популярный пакет монет Forest Fortune 5x5' },
  p2000: { coins: 20000, stars: 650, title: '20 000 Монет · +30%', description: 'Выгодный пакет монет Forest Fortune 5x5' },
  p10000: { coins: 100000, stars: 2500, title: '100 000 Монет · Vegas VIP', description: 'VIP-пакет монет Forest Fortune 5x5' },
  p100000: { coins: 5000000, stars: 100000, title: '5 000 000 Монет · Emperor VIP', description: 'Императорский пакет монет Forest Fortune 5x5' }
};

function getKv(env) {
  return env.KV_BINDING || env.empire_DB || env.DB;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

function cryptoRandInt(max) {
  if (max <= 1) return 0;
  const limit = 0x100000000 - (0x100000000 % max);
  const buf = new Uint32Array(1);
  while (true) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) return buf[0] % max;
  }
}

function pickWeightedSymbol() {
  let r = cryptoRandInt(TOTAL_WEIGHT);
  for (const sym of SYMBOLS) {
    r -= BASE_WEIGHTS[sym];
    if (r < 0) return sym;
  }
  return 'coin.png';
}

function timingSafeEqualHex(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function hmacSha256(key, message) {
  const rawKey = typeof key === 'string' ? new TextEncoder().encode(key) : new Uint8Array(key);
  const cryptoKey = await crypto.subtle.importKey('raw', rawKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function verifyTelegramInitData(initData, botToken) {
  if (!initData || !botToken) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;

  const authDate = Number(params.get('auth_date') || 0);
  const nowSec = Math.floor(Date.now() / 1000);
  if (!authDate || Math.abs(nowSec - authDate) > 172800) return null;

  params.delete('hash');
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = await hmacSha256('WebAppData', botToken);
  const computedHex = toHex(await hmacSha256(secretKey, dataCheckString));
  if (!timingSafeEqualHex(computedHex.toLowerCase(), hash.toLowerCase())) return null;

  try {
    const user = JSON.parse(params.get('user') || 'null');
    return user && user.id ? user : null;
  } catch {
    return null;
  }
}

async function callTelegramBotApi(botToken, method, payload) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {})
  });
  return res.json();
}

async function getWebhookSecret(env) {
  if (env.TELEGRAM_WEBHOOK_SECRET) return env.TELEGRAM_WEBHOOK_SECRET;
  const digest = await hmacSha256('forest-fortune-webhook-secret', env.BOT_TOKEN || 'fallback');
  return toHex(digest).slice(0, 32);
}

async function getBotUsername(env, kv) {
  let cached = kv ? await kv.get('sys:bot_username') : null;
  if (cached) return cached;
  if (!env.BOT_TOKEN) return 'ForestFortuneVegasBot';
  try {
    const me = await callTelegramBotApi(env.BOT_TOKEN, 'getMe', {});
    if (me.ok && me.result && me.result.username) {
      if (kv) await kv.put('sys:bot_username', me.result.username, { expirationTtl: 86400 });
      return me.result.username;
    }
  } catch {}
  return 'ForestFortuneVegasBot';
}

async function ensureBotConfigured(requestUrl, env) {
  if (!env.BOT_TOKEN) return;
  const kv = getKv(env);
  const origin = (env.WEBAPP_URL || new URL(requestUrl).origin).replace(/\/$/, '');
  const markerKey = 'sys:configured_origin';
  if (kv) {
    const prev = await kv.get(markerKey);
    if (prev === origin) return;
  }
  const secretToken = await getWebhookSecret(env);
  await callTelegramBotApi(env.BOT_TOKEN, 'setWebhook', {
    url: `${origin}/api/telegram-webhook`,
    secret_token: secretToken,
    allowed_updates: ['message', 'pre_checkout_query']
  }).catch(() => {});
  await callTelegramBotApi(env.BOT_TOKEN, 'setChatMenuButton', {
    menu_button: { type: 'web_app', text: '🎰 Играть', web_app: { url: origin } }
  }).catch(() => {});
  await getBotUsername(env, kv);
  if (kv) await kv.put(markerKey, origin, { expirationTtl: 3600 });
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeUserState(raw, tgUser) {
  const day = todayUtc();
  const base = raw || {};
  const tasks = base.tasks && base.tasks.date === day
    ? base.tasks
    : { date: day, spins: 0, wins: 0, wheel: 0, claimedSpins: false, claimedWins: false, claimedWheel: false };
  const name = tgUser
    ? ([tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ').trim() || tgUser.username || `Player_${String(tgUser.id).slice(-4)}`)
    : (base.name || 'Player');
  return {
    id: String(tgUser ? tgUser.id : base.id),
    name,
    username: tgUser && tgUser.username ? tgUser.username : (base.username || ''),
    balance: Number.isFinite(base.balance) ? Math.max(0, Math.floor(base.balance)) : 1000,
    freeSpinsLeft: Math.max(0, Math.floor(base.freeSpinsLeft || 0)),
    freeSpinsTotalWin: Math.max(0, Math.floor(base.freeSpinsTotalWin || 0)),
    stickyWilds: base.stickyWilds && typeof base.stickyWilds === 'object' ? base.stickyWilds : {},
    wheelCooldownUntil: Number(base.wheelCooldownUntil || 0),
    wheelExtraSpins: Math.max(0, Math.floor(base.wheelExtraSpins || 0)),
    lastDailyDate: base.lastDailyDate || '',
    riskPending: Math.max(0, Math.floor(base.riskPending || 0)),
    riskLeftCard: base.riskLeftCard || null,
    referralsCount: Math.max(0, Math.floor(base.referralsCount || 0)),
    referredBy: base.referredBy || null,
    totalSpins: Math.max(0, Math.floor(base.totalSpins || 0)),
    totalWins: Math.max(0, Math.floor(base.totalWins || 0)),
    walletAddress: typeof base.walletAddress === 'string' ? base.walletAddress : '',
    walletProvider: typeof base.walletProvider === 'string' ? base.walletProvider : '',
    tasks
  };
}

function serializeClientState(u, jackpot, botUsername) {
  return {
    balance: u.balance,
    jackpot,
    freeSpinsLeft: u.freeSpinsLeft,
    freeSpinsTotalWin: u.freeSpinsTotalWin,
    stickyWilds: u.stickyWilds,
    wheelExtraSpins: u.wheelExtraSpins,
    wheelCooldownUntil: u.wheelCooldownUntil,
    canDailyBonus: u.lastDailyDate !== todayUtc(),
    riskPending: u.riskPending,
    tasks: u.tasks,
    referralsCount: u.referralsCount,
    totalSpins: u.totalSpins,
    totalWins: u.totalWins,
    walletAddress: u.walletAddress,
    walletProvider: u.walletProvider,
    botUsername
  };
}

async function getJackpot(kv) {
  const raw = await kv.get('game:jackpot');
  const n = Number(raw);
  return Number.isFinite(n) && n >= 50000 ? Math.floor(n) : 500000;
}

async function saveUserAndLeaderboard(kv, u) {
  await kv.put(`user:${u.id}`, JSON.stringify(u));
  const rawTop = await kv.get('top:leaderboard', 'json').catch(() => null);
  const list = Array.isArray(rawTop) ? rawTop.filter((x) => x && String(x.id) !== u.id) : [];
  list.push({ id: u.id, name: u.name, balance: u.balance });
  list.sort((a, b) => b.balance - a.balance);
  await kv.put('top:leaderboard', JSON.stringify(list.slice(0, 25)));
}

function evaluateMatrix(matrix, activeLines, bet, isFS) {
  let totalWin = 0;
  const winLines = [];
  const winCells = new Set();
  for (let li = 0; li < activeLines; li++) {
    const line = PAYLINES[li];
    const syms = line.map(([c, r]) => matrix[c][r]);
    let target = syms.find((s) => s !== 'wild.png' && s !== 'gem.png') || syms[0];
    if (target === 'mushroom.png') continue;
    let count = 0;
    let wildMult = 1;
    for (let j = 0; j < 5; j++) {
      const s = syms[j];
      if (s === target || s === 'wild.png' || s === 'gem.png') {
        count++;
        if (s === 'wild.png') wildMult *= 2;
      } else break;
    }
    if (count >= 3) {
      const base = (PAYTABLE[target] || [2, 5, 20])[count - 3];
      const lineWin = base * bet * wildMult * (isFS ? 2 : 1);
      totalWin += lineWin;
      winLines.push({ lineIdx: li, count, win: lineWin });
      for (let p = 0; p < count; p++) winCells.add(`${line[p][0]}:${line[p][1]}`);
    }
  }
  return { totalWin, winLines, winCells: Array.from(winCells) };
}

async function handleBalance(request, env) {
  const kv = getKv(env);
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', env.BOT_TOKEN);
  if (!tgUser) return json({ ok: false, error: 'Unauthorized' }, 401);

  const key = `user:${tgUser.id}`;
  const existing = await kv.get(key, 'json').catch(() => null);
  const u = normalizeUserState(existing, tgUser);

  if (!existing && typeof body.startParam === 'string' && body.startParam.startsWith('ref_')) {
    const inviterId = body.startParam.slice(4).trim();
    if (inviterId && inviterId !== u.id) {
      u.referredBy = inviterId;
      const invRaw = await kv.get(`user:${inviterId}`, 'json').catch(() => null);
      if (invRaw) {
        const inv = normalizeUserState(invRaw, null);
        inv.balance += 5000;
        inv.referralsCount += 1;
        await saveUserAndLeaderboard(kv, inv);
      }
    }
  }

  await saveUserAndLeaderboard(kv, u);
  const jackpot = await getJackpot(kv);
  const botUsername = await getBotUsername(env, kv);
  return json({ ok: true, ...serializeClientState(u, jackpot, botUsername) });
}

async function handleSpin(request, env) {
  const kv = getKv(env);
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', env.BOT_TOKEN);
  if (!tgUser) return json({ ok: false, error: 'Unauthorized' }, 401);

  const u = normalizeUserState(await kv.get(`user:${tgUser.id}`, 'json').catch(() => null), tgUser);
  const lines = LINE_PRESETS.includes(Number(body.lines)) ? Number(body.lines) : 15;
  const bet = Math.max(1, Math.min(1000, Math.floor(Number(body.bet) || 1)));
  const isFS = Boolean(body.isFreeSpin) && u.freeSpinsLeft > 0;
  const totalBet = lines * bet;

  if (!isFS && u.balance < totalBet) {
    return json({ ok: false, error: 'Недостаточно монет' }, 400);
  }
  if (!isFS) u.balance -= totalBet;
  else u.freeSpinsLeft = Math.max(0, u.freeSpinsLeft - 1);

  if (!isFS) u.stickyWilds = {};

  const matrix = [];
  for (let c = 0; c < 5; c++) {
    matrix[c] = [];
    for (let r = 0; r < 5; r++) {
      const k = `${c}:${r}`;
      matrix[c][r] = (isFS && u.stickyWilds[k]) ? u.stickyWilds[k] : pickWeightedSymbol();
    }
  }

  let scatterCount = 0;
  for (let c = 0; c < 5; c++) {
    for (let r = 0; r < 5; r++) {
      if (matrix[c][r] === 'mushroom.png') scatterCount++;
      if (isFS && (matrix[c][r] === 'wild.png' || matrix[c][r] === 'gem.png')) {
        u.stickyWilds[`${c}:${r}`] = matrix[c][r];
      }
    }
  }

  const cascades = [];
  const work = matrix.map((col) => col.slice());
  let totalWin = 0;
  let step = 0;
  while (step < 8) {
    const ev = evaluateMatrix(work, lines, bet, isFS);
    if (ev.totalWin <= 0) break;
    step++;
    totalWin += ev.totalWin;
    cascades.push({ matrix: work.map((col) => col.slice()), win: ev.totalWin, winLines: ev.winLines, winCells: ev.winCells });
    const rm = new Set(ev.winCells);
    for (let c = 0; c < 5; c++) {
      const kept = [];
      for (let r = 0; r < 5; r++) {
        if (!rm.has(`${c}:${r}`) || (isFS && u.stickyWilds[`${c}:${r}`])) kept.push(work[c][r]);
      }
      while (kept.length < 5) kept.unshift(pickWeightedSymbol());
      work[c] = kept;
    }
  }

  let jackpot = await getJackpot(kv);
  jackpot += Math.max(1, Math.floor(totalBet * 0.01));
  let jackpotWon = false;
  let jackpotWin = 0;
  if (totalBet >= 10 && cryptoRandInt(10000) === 0) {
    jackpotWon = true;
    jackpotWin = jackpot;
    jackpot = 50000;
  }
  await kv.put('game:jackpot', String(jackpot));

  const wheelExtraAwarded = scatterCount >= 3 ? 1 : 0;
  if (wheelExtraAwarded > 0) u.wheelExtraSpins += wheelExtraAwarded;

  u.balance += totalWin + jackpotWin;
  u.totalSpins += 1;
  if (totalWin + jackpotWin > 0) u.totalWins += 1;
  u.tasks.spins = Math.min(20, (u.tasks.spins || 0) + 1);
  if (totalWin > 0) u.tasks.wins = Math.min(5, (u.tasks.wins || 0) + 1);
  u.riskPending = totalWin >= totalBet * 2 ? totalWin : 0;
  u.riskLeftCard = null;

  let freeSpinsFinished = false;
  let freeSpinsSeriesTotal = 0;
  if (isFS) {
    u.freeSpinsTotalWin += totalWin;
    if (u.freeSpinsLeft === 0) {
      freeSpinsFinished = true;
      freeSpinsSeriesTotal = u.freeSpinsTotalWin;
      u.freeSpinsTotalWin = 0;
      u.stickyWilds = {};
    }
  }

  await saveUserAndLeaderboard(kv, u);
  const botUsername = await getBotUsername(env, kv);
  return json({
    ok: true,
    matrix,
    settledMatrix: work,
    cascades,
    totalWin,
    scatterCount,
    wheelExtraAwarded,
    jackpotWon,
    jackpotWin,
    freeSpinsFinished,
    freeSpinsSeriesTotal,
    ...serializeClientState(u, jackpot, botUsername)
  });
}

async function handleWheel(request, env) {
  const kv = getKv(env);
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', env.BOT_TOKEN);
  if (!tgUser) return json({ ok: false, error: 'Unauthorized' }, 401);

  const u = normalizeUserState(await kv.get(`user:${tgUser.id}`, 'json').catch(() => null), tgUser);
  const now = Date.now();
  if (u.wheelExtraSpins > 0) {
    u.wheelExtraSpins -= 1;
  } else if (now >= u.wheelCooldownUntil) {
    u.wheelCooldownUntil = now + 86400000;
  } else {
    return json({ ok: false, error: 'Колесо доступно 1 раз в сутки' }, 400);
  }

  const weights = [1, 8, 4, 28, 20, 12, 10, 17];
  const totalW = weights.reduce((a, b) => a + b, 0);
  let r = cryptoRandInt(totalW);
  let prizeIndex = 3;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r < 0) { prizeIndex = i; break; }
  }
  const prize = WHEEL_PRIZES[prizeIndex];
  let jackpot = await getJackpot(kv);
  let winAmount = 0;
  let freeSpinsAwarded = 0;

  if (prize.type === 'jackpot') {
    winAmount = jackpot;
    u.balance += winAmount;
    jackpot = 50000;
    await kv.put('game:jackpot', String(jackpot));
  } else if (prize.type === 'fs') {
    freeSpinsAwarded = prize.val;
    u.freeSpinsLeft += prize.val;
    u.freeSpinsTotalWin = 0;
  } else {
    winAmount = 15 * prize.val;
    u.balance += winAmount;
  }

  u.tasks.wheel = 1;
  await saveUserAndLeaderboard(kv, u);
  const botUsername = await getBotUsername(env, kv);
  return json({ ok: true, prizeIndex, prize, winAmount, freeSpinsAwarded, ...serializeClientState(u, jackpot, botUsername) });
}

function drawCard(excludeRank = -1, minIdx = 0, maxIdx = 12) {
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  let idx = minIdx + cryptoRandInt(maxIdx - minIdx + 1);
  if (idx + 2 === excludeRank) {
    idx = idx < maxIdx ? idx + 1 : idx - 1;
  }
  return { rank: idx + 2, label: ranks[idx], suit: suits[cryptoRandInt(4)] };
}

async function handleRisk(request, env) {
  const kv = getKv(env);
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', env.BOT_TOKEN);
  if (!tgUser) return json({ ok: false, error: 'Unauthorized' }, 401);

  const u = normalizeUserState(await kv.get(`user:${tgUser.id}`, 'json').catch(() => null), tgUser);
  const action = body.action || 'deal';

  if (action === 'take') {
    u.riskPending = 0;
    u.riskLeftCard = null;
    await saveUserAndLeaderboard(kv, u);
    return json({ ok: true, riskPending: 0, balance: u.balance });
  }

  if (u.riskPending <= 0) return json({ ok: false, error: 'Нет активного выигрыша для риска' }, 400);

  if (action === 'deal') {
    if (!u.riskLeftCard) u.riskLeftCard = drawCard(-1, 2, 10);
    await saveUserAndLeaderboard(kv, u);
    return json({ ok: true, leftCard: u.riskLeftCard, riskPending: u.riskPending, balance: u.balance });
  }

  if (action === 'guess') {
    const left = u.riskLeftCard || drawCard(-1, 2, 10);
    const nextCard = drawCard(left.rank, 0, 12);
    const won = body.choice === 'higher' ? nextCard.rank > left.rank : nextCard.rank < left.rank;
    if (won) {
      u.balance += u.riskPending;
      u.riskPending *= 2;
      u.riskLeftCard = nextCard;
    } else {
      u.balance = Math.max(0, u.balance - u.riskPending);
      u.riskPending = 0;
      u.riskLeftCard = null;
    }
    await saveUserAndLeaderboard(kv, u);
    return json({ ok: true, nextCard, won, riskPending: u.riskPending, balance: u.balance });
  }

  return json({ ok: false, error: 'Unknown action' }, 400);
}

async function handleDailyBonus(request, env) {
  const kv = getKv(env);
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', env.BOT_TOKEN);
  if (!tgUser) return json({ ok: false, error: 'Unauthorized' }, 401);

  const u = normalizeUserState(await kv.get(`user:${tgUser.id}`, 'json').catch(() => null), tgUser);
  const day = todayUtc();
  if (u.lastDailyDate === day) return json({ ok: false, error: 'Бонус уже получен сегодня!' }, 400);

  u.balance += 100;
  u.lastDailyDate = day;
  await saveUserAndLeaderboard(kv, u);
  const jackpot = await getJackpot(kv);
  const botUsername = await getBotUsername(env, kv);
  return json({ ok: true, added: 100, ...serializeClientState(u, jackpot, botUsername) });
}

async function handleTaskClaim(request, env) {
  const kv = getKv(env);
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', env.BOT_TOKEN);
  if (!tgUser) return json({ ok: false, error: 'Unauthorized' }, 401);

  const u = normalizeUserState(await kv.get(`user:${tgUser.id}`, 'json').catch(() => null), tgUser);
  const tid = body.taskId;
  let reward = 0;
  if (tid === 'spins' && !u.tasks.claimedSpins && u.tasks.spins >= 20) { u.tasks.claimedSpins = true; reward = 250; }
  else if (tid === 'wins' && !u.tasks.claimedWins && u.tasks.wins >= 5) { u.tasks.claimedWins = true; reward = 300; }
  else if (tid === 'wheel' && !u.tasks.claimedWheel && u.tasks.wheel >= 1) { u.tasks.claimedWheel = true; reward = 150; }
  else return json({ ok: false, error: 'Задание не готово' }, 400);

  u.balance += reward;
  await saveUserAndLeaderboard(kv, u);
  const jackpot = await getJackpot(kv);
  const botUsername = await getBotUsername(env, kv);
  return json({ ok: true, reward, ...serializeClientState(u, jackpot, botUsername) });
}

async function handleProfile(request, env) {
  const kv = getKv(env);
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', env.BOT_TOKEN);
  if (!tgUser) return json({ ok: false, error: 'Unauthorized' }, 401);

  const u = normalizeUserState(await kv.get(`user:${tgUser.id}`, 'json').catch(() => null), tgUser);
  if (body.action === 'connect_wallet') {
    const prov = String(body.provider || 'Telegram Wallet').slice(0, 40);
    const addr = String(body.address || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
    if (!addr) return json({ ok: false, error: 'Invalid wallet address' }, 400);
    u.walletProvider = prov;
    u.walletAddress = addr;
  } else if (body.action === 'disconnect_wallet') {
    u.walletProvider = '';
    u.walletAddress = '';
  }

  await saveUserAndLeaderboard(kv, u);
  const jackpot = await getJackpot(kv);
  const botUsername = await getBotUsername(env, kv);
  return json({ ok: true, ...serializeClientState(u, jackpot, botUsername) });
}

async function handleInvoice(request, env) {
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', env.BOT_TOKEN);
  if (!tgUser) return json({ ok: false, error: 'Unauthorized' }, 401);

  const pkgId = body.packageId || '';
  const pkg = STAR_PACKAGES[pkgId];
  if (!pkg) return json({ ok: false, error: 'Unknown package' }, 400);

  const tgRes = await callTelegramBotApi(env.BOT_TOKEN, 'createInvoiceLink', {
    title: pkg.title,
    description: pkg.description,
    payload: JSON.stringify({ uid: String(tgUser.id), pkg: pkgId }),
    provider_token: '',
    currency: 'XTR',
    prices: [{ label: pkg.title, amount: pkg.stars }]
  });

  if (!tgRes.ok || typeof tgRes.result !== 'string') {
    return json({ ok: false, error: tgRes.description || 'Failed to create Stars invoice' }, 502);
  }
  return json({ ok: true, invoiceLink: tgRes.result });
}

async function handleLeaderboard(env) {
  const kv = getKv(env);
  const top = await kv.get('top:leaderboard', 'json').catch(() => null);
  return json(Array.isArray(top) ? top.slice(0, 20) : []);
}

async function handleWebhook(request, env) {
  if (env.BOT_TOKEN) {
    const expected = await getWebhookSecret(env);
    const got = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (got && got !== expected) return json({ error: 'Forbidden' }, 403);
  }

  const kv = getKv(env);
  const update = await request.json().catch(() => ({}));

  if (update.pre_checkout_query) {
    const q = update.pre_checkout_query;
    let valid = false;
    try {
      const parsed = JSON.parse(q.invoice_payload || '{}');
      const pkg = STAR_PACKAGES[parsed.pkg];
      valid = Boolean(pkg && q.currency === 'XTR' && q.total_amount === pkg.stars);
    } catch {}
    await callTelegramBotApi(env.BOT_TOKEN, 'answerPreCheckoutQuery', {
      pre_checkout_query_id: q.id,
      ok: valid,
      ...(valid ? {} : { error_message: 'Неверный пакет оплаты.' })
    });
    return json({ ok: true });
  }

  const pay = update.message && update.message.successful_payment;
  if (pay && update.message.chat && update.message.chat.id) {
    try {
      const parsed = JSON.parse(pay.invoice_payload || '{}');
      const pkg = STAR_PACKAGES[parsed.pkg];
      const uid = parsed.uid || String(update.message.from && update.message.from.id || '');
      const chargeKey = `pay:${pay.telegram_payment_charge_id}`;
      if (pkg && uid && !(await kv.get(chargeKey))) {
        await kv.put(chargeKey, '1');
        const u = normalizeUserState(await kv.get(`user:${uid}`, 'json').catch(() => null), update.message.from || { id: uid });
        u.balance += pkg.coins;
        await saveUserAndLeaderboard(kv, u);
        await callTelegramBotApi(env.BOT_TOKEN, 'sendMessage', {
          chat_id: update.message.chat.id,
          text: `✅ Оплата Stars прошла успешно! Начислено +${pkg.coins.toLocaleString('ru-RU')} 🪙`
        });
      }
    } catch {}
    return json({ ok: true });
  }

  const msg = update.message;
  if (msg && msg.chat && msg.chat.id && typeof msg.text === 'string') {
    const origin = (env.WEBAPP_URL || new URL(request.url).origin).replace(/\/$/, '');
    if (msg.text.startsWith('/start')) {
      const parts = msg.text.trim().split(/\s+/);
      const sp = parts[1] || '';
      const appUrl = sp ? `${origin}?startapp=${encodeURIComponent(sp)}` : origin;
      await callTelegramBotApi(env.BOT_TOKEN, 'sendMessage', {
        chat_id: msg.chat.id,
        text: '🌲 Добро пожаловать в Forest Fortune 5x5 — Las Vegas Edition!\nКрути барабаны, лови каскады, Колесо Фортуны и джекпот 🏆',
        reply_markup: {
          inline_keyboard: [[{ text: '🎰 Играть в Forest Fortune', web_app: { url: appUrl } }]]
        }
      });
    } else if (msg.text.startsWith('/top')) {
      const top = await kv.get('top:leaderboard', 'json').catch(() => []);
      const lines = (Array.isArray(top) ? top.slice(0, 10) : []).map((r, i) => `${i + 1}. ${r.name} — ${Number(r.balance).toLocaleString('ru-RU')} 🪙`);
      await callTelegramBotApi(env.BOT_TOKEN, 'sendMessage', {
        chat_id: msg.chat.id,
        text: lines.length ? `🏆 Топ игроков:\n\n${lines.join('\n')}` : '🏆 Таблица лидеров пока пуста!'
      });
    }
  }

  return json({ ok: true });
}

export default {
  async fetch(request, env, ctx) {
    if (ctx && typeof ctx.waitUntil === 'function') {
      ctx.waitUntil(ensureBotConfigured(request.url, env));
    }
    const url = new URL(request.url);
    try {
      if (url.pathname === '/api/balance' && request.method === 'POST') return await handleBalance(request, env);
      if (url.pathname === '/api/spin' && request.method === 'POST') return await handleSpin(request, env);
      if (url.pathname === '/api/wheel' && request.method === 'POST') return await handleWheel(request, env);
      if (url.pathname === '/api/risk' && request.method === 'POST') return await handleRisk(request, env);
      if (url.pathname === '/api/daily-bonus' && request.method === 'POST') return await handleDailyBonus(request, env);
      if (url.pathname === '/api/task-claim' && request.method === 'POST') return await handleTaskClaim(request, env);
      if (url.pathname === '/api/profile' && request.method === 'POST') return await handleProfile(request, env);
      if (url.pathname === '/api/invoice' && request.method === 'POST') return await handleInvoice(request, env);
      if (url.pathname === '/api/leaderboard' && request.method === 'GET') return await handleLeaderboard(env);
      if (url.pathname === '/api/telegram-webhook' && request.method === 'POST') return await handleWebhook(request, env);
      if (url.pathname === '/api/setup' && (request.method === 'GET' || request.method === 'POST')) {
        await ensureBotConfigured(request.url, env);
        return json({ ok: true });
      }
      if (url.pathname.startsWith('/api/')) return json({ ok: false, error: 'Not Found' }, 404);
    } catch (err) {
      return json({ ok: false, error: err && err.message ? err.message : 'Server error' }, 500);
    }

    return new Response(indexHtml, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }
};
