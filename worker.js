import indexHtml from './index.html';

const REELS = 5;
const ROWS = 5;
const MAX_CASCADES = 8;
const MAX_TOTAL_BET = 1000;
const ALLOWED_LINES = new Set([1, 3, 5, 9, 15, 21]);
const INIT_DATA_MAX_AGE_SEC = 172800; // 48 hours

const BASE_WEIGHTS = {
  'gem.png': 10,
  'wild.png': 8,
  'mushroom.png': 12,
  'ufo.png': 4,
  'weed_cross.png': 4,
  'tech_face.png': 6,
  'man.png': 6,
  'man2.png': 8,
  'hutor.png': 10,
  'firebird.png': 12,
  'rabbit.png': 15,
  'real_hedgehog.png': 18,
  'bear.png': 20,
  'fox.png': 22,
  'deer.png': 22,
  'owl.png': 25,
  'squirrel.png': 28,
  'squirrel1.png': 28,
  'raccoon.png': 30,
  'hedgehog.png': 30,
  'pinecone.png': 35,
  'acorn.png': 35,
  'leaf.png': 35,
  'coin.png': 40,
};

const PAYTABLE = {
  'gem.png': [15, 60, 250],
  'wild.png': [30, 100, 500],
  'mushroom.png': [15, 50, 200],
  'ufo.png': [30, 200, 1500],
  'weed_cross.png': [30, 150, 1000],
  'tech_face.png': [25, 120, 800],
  'man.png': [25, 100, 600],
  'man2.png': [20, 100, 500],
  'hutor.png': [20, 90, 400],
  'firebird.png': [15, 70, 300],
  'rabbit.png': [15, 60, 250],
  'real_hedgehog.png': [10, 40, 200],
  'bear.png': [10, 30, 150],
  'fox.png': [8, 25, 100],
  'deer.png': [8, 25, 100],
  'owl.png': [5, 15, 80],
  'squirrel.png': [4, 12, 60],
  'squirrel1.png': [4, 12, 60],
  'raccoon.png': [3, 10, 50],
  'hedgehog.png': [3, 10, 50],
  'pinecone.png': [2, 8, 40],
  'acorn.png': [2, 8, 40],
  'leaf.png': [2, 8, 40],
  'coin.png': [2, 5, 30],
};

const PAYLINES = [
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
  [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]],
  [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]],
  [[0, 3], [1, 3], [2, 3], [3, 3], [4, 3]],
  [[0, 4], [1, 4], [2, 4], [3, 4], [4, 4]],
  [[0, 0], [1, 1], [2, 2], [3, 1], [4, 0]],
  [[0, 4], [1, 3], [2, 2], [3, 3], [4, 4]],
  [[0, 1], [1, 2], [2, 3], [3, 2], [4, 1]],
  [[0, 3], [1, 2], [2, 1], [3, 2], [4, 3]],
  [[0, 0], [1, 0], [2, 1], [3, 2], [4, 2]],
  [[0, 4], [1, 4], [2, 3], [3, 2], [4, 2]],
  [[0, 2], [1, 1], [2, 0], [3, 1], [4, 2]],
  [[0, 2], [1, 3], [2, 4], [3, 3], [4, 2]],
  [[0, 1], [1, 0], [2, 0], [3, 0], [4, 1]],
  [[0, 3], [1, 4], [2, 4], [3, 4], [4, 3]],
  [[0, 0], [1, 1], [2, 1], [3, 1], [4, 0]],
  [[0, 4], [1, 3], [2, 3], [3, 3], [4, 4]],
  [[0, 1], [1, 1], [2, 2], [3, 3], [4, 3]],
  [[0, 3], [1, 3], [2, 2], [3, 1], [4, 1]],
  [[0, 0], [1, 2], [2, 4], [3, 2], [4, 0]],
  [[0, 4], [1, 2], [2, 0], [3, 2], [4, 4]],
];

const LINE_COLORS = [
  '#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#00c7be',
  '#30b0ff', '#5856d6', '#af52de', '#ff2d95', '#ff6b6b',
  '#ffd93d', '#6bcf7f', '#4ecdc4', '#95e1d3', '#a8e6cf',
  '#c7ceea', '#e2a4d1', '#f6d365', '#b5eaea', '#e0aaff',
  '#ffb4a2',
];

const WHEEL_PRIZES = [
  { type: 'jackpot', val: 50000, label: 'JP' },
  { type: 'fs', val: 20, label: '20 FS' },
  { type: 'mult', val: 50, label: 'x50' },
  { type: 'mult', val: 2, label: 'x2' },
  { type: 'mult', val: 5, label: 'x5' },
  { type: 'fs', val: 10, label: '10 FS' },
  { type: 'mult', val: 10, label: 'x10' },
  { type: 'mult', val: 3, label: 'x3' },
];

const TASK_TARGETS = {
  spins: { target: 20, reward: 500 },
  wins: { target: 5, reward: 750 },
  wheel: { target: 1, reward: 1000 },
};

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
const memMeta = new Map();
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

function getOrigin(request, env) {
  const raw = (env.WEBAPP_URL || new URL(request.url).origin).trim().replace(/\/$/, '');
  return raw.replace(/^http:\/\//i, 'https://');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cryptoRandomInt(max) {
  if (max <= 1) return 0;
  const range = 0x100000000;
  const limit = range - (range % max);
  const buf = new Uint32Array(1);
  let val = 0;
  do {
    crypto.getRandomValues(buf);
    val = buf[0];
  } while (val >= limit);
  return val % max;
}

function timingSafeEqualStr(a, b) {
  const s1 = String(a || '');
  const s2 = String(b || '');
  if (s1.length !== s2.length) return false;
  let diff = 0;
  for (let i = 0; i < s1.length; i++) {
    diff |= s1.charCodeAt(i) ^ s2.charCodeAt(i);
  }
  return diff === 0;
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

  const authDate = Number(params.get('auth_date') || 0);
  const nowSec = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(authDate) || authDate <= 0 || nowSec - authDate > INIT_DATA_MAX_AGE_SEC) {
    return null;
  }

  params.delete('hash');
  const entries = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');

  const secretKey = await hmacSha256(new TextEncoder().encode('WebAppData'), botToken);
  const computedHex = toHex(await hmacSha256(secretKey, dataCheckString));

  if (!timingSafeEqualStr(computedHex.toLowerCase(), hash.toLowerCase())) {
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

function getTodayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeUserState(raw, userId, displayName, username) {
  const todayUtc = getTodayUtc();
  const baseTasks = {
    spins: { progress: 0, claimed: false },
    wins: { progress: 0, claimed: false },
    wheel: { progress: 0, claimed: false },
  };
  const sameTaskDay = raw && raw.tasksDate === todayUtc;
  const tasks = sameTaskDay && raw.tasks
    ? {
        spins: { progress: Number(raw.tasks.spins?.progress) || 0, claimed: Boolean(raw.tasks.spins?.claimed) },
        wins: { progress: Number(raw.tasks.wins?.progress) || 0, claimed: Boolean(raw.tasks.wins?.claimed) },
        wheel: { progress: Number(raw.tasks.wheel?.progress) || 0, claimed: Boolean(raw.tasks.wheel?.claimed) },
      }
    : baseTasks;

  return {
    id: String(userId),
    name: displayName || (raw && raw.name) || `Player_${String(userId).slice(-4)}`,
    username: username !== undefined ? username : (raw && raw.username) || '',
    balance: Math.max(0, Math.floor(Number(raw && raw.balance !== undefined ? raw.balance : 1000) || 0)),
    referred_by: (raw && raw.referred_by) || null,
    last_daily_date: (raw && raw.last_daily_date) || '',
    lastWheelDate: (raw && raw.lastWheelDate) || '',
    wheelBonusSpins: Math.max(0, Math.floor(Number(raw && raw.wheelBonusSpins) || 0)),
    freeSpins: Math.max(0, Math.floor(Number(raw && raw.freeSpins) || 0)),
    fsBetPerLine: Math.max(1, Math.floor(Number(raw && raw.fsBetPerLine) || 1)),
    fsLinesCount: ALLOWED_LINES.has(Number(raw && raw.fsLinesCount)) ? Number(raw.fsLinesCount) : 21,
    fsTotalWin: Math.max(0, Math.floor(Number(raw && raw.fsTotalWin) || 0)),
    stickyWilds: Array.isArray(raw && raw.stickyWilds) ? raw.stickyWilds : [],
    pendingRiskWin: Math.max(0, Math.floor(Number(raw && raw.pendingRiskWin) || 0)),
    riskRoundsLeft: Math.max(0, Math.floor(Number(raw && raw.riskRoundsLeft) || 0)),
    tasksDate: todayUtc,
    tasks,
    updated_at: new Date().toISOString(),
  };
}

function serializeClientState(user, jackpot, botUsername) {
  const todayUtc = getTodayUtc();
  const dailyWheelReady = user.lastWheelDate !== todayUtc;
  const dailyBonusReady = user.last_daily_date !== todayUtc;
  return {
    balance: user.balance,
    jackpot,
    freeSpins: user.freeSpins,
    fsBetPerLine: user.fsBetPerLine,
    fsLinesCount: user.fsLinesCount,
    fsTotalWin: user.fsTotalWin,
    stickyWilds: user.stickyWilds,
    dailyWheelReady,
    wheelBonusSpins: user.wheelBonusSpins,
    dailyBonusReady,
    pendingRiskWin: user.pendingRiskWin,
    riskRoundsLeft: user.riskRoundsLeft,
    tasks: user.tasks,
    botUsername: botUsername || '',
    serverSigned: true,
  };
}

function generatePool(totalBet) {
  const pool = [];
  let modifier = 1;
  if (totalBet > 100) modifier = 0.7;
  if (totalBet > 500) modifier = 0.4;
  const lowTier = ['coin.png', 'leaf.png', 'acorn.png', 'pinecone.png'];

  Object.entries(BASE_WEIGHTS).forEach(([sym, base]) => {
    const weight = lowTier.includes(sym)
      ? Math.floor(base * (totalBet > 100 ? 1.5 : 1.2))
      : Math.max(1, Math.floor(base * modifier));
    for (let i = 0; i < weight; i++) {
      pool.push(sym);
    }
  });
  return pool;
}

function pickRandomSymbol(pool) {
  if (!pool.length) return 'coin.png';
  return pool[cryptoRandomInt(pool.length)];
}

function generateGrid(pool, stickyWilds = []) {
  const grid = [];
  for (let r = 0; r < REELS; r++) {
    const col = [];
    for (let c = 0; c < ROWS; c++) {
      const sticky = stickyWilds.find((sw) => sw.r === r && sw.c === c);
      col.push(sticky ? sticky.type : pickRandomSymbol(pool));
    }
    grid.push(col);
  }
  return grid;
}

function evaluateGrid(grid, linesCount, betPerLine, isFreeSpin) {
  let totalWin = 0;
  const winCellMap = new Map();
  const winningLines = [];

  let scatterCount = 0;
  for (let r = 0; r < REELS; r++) {
    for (let c = 0; c < ROWS; c++) {
      if (grid[r][c] === 'mushroom.png') scatterCount++;
    }
  }

  PAYLINES.slice(0, linesCount).forEach((line, lineIndex) => {
    const syms = line.map(([r, c]) => grid[r][c]);
    const firstSym = syms[0];
    if (firstSym === 'mushroom.png') return;

    let targetSym = firstSym;
    if (targetSym === 'wild.png' || targetSym === 'gem.png') {
      for (let i = 1; i < REELS; i++) {
        if (syms[i] !== 'wild.png' && syms[i] !== 'gem.png' && syms[i] !== 'mushroom.png') {
          targetSym = syms[i];
          break;
        }
      }
    }

    let count = 0;
    let wildMultiplierCount = 0;
    for (let i = 0; i < REELS; i++) {
      if (syms[i] === targetSym || syms[i] === 'wild.png' || syms[i] === 'gem.png') {
        count++;
        if (syms[i] === 'wild.png') wildMultiplierCount++;
      } else {
        break;
      }
    }

    if (count >= 3) {
      const paySym = targetSym === 'wild.png' || targetSym === 'gem.png' ? 'wild.png' : targetSym;
      const payouts = PAYTABLE[paySym];
      if (!payouts) return;

      let lineWin = payouts[count - 3] * betPerLine;
      if (wildMultiplierCount === 1) lineWin *= 2;
      else if (wildMultiplierCount === 2) lineWin *= 4;
      else if (wildMultiplierCount >= 3) lineWin *= 8;
      if (isFreeSpin) lineWin *= 2;

      totalWin += lineWin;
      const points = [];
      for (let i = 0; i < count; i++) {
        const [r, c] = line[i];
        winCellMap.set(`${r}-${c}`, { r, c });
        points.push([r, c]);
      }

      winningLines.push({
        lineIndex,
        color: LINE_COLORS[lineIndex % LINE_COLORS.length],
        count,
        payout: lineWin,
        points,
      });
    }
  });

  return {
    totalWin,
    winCells: Array.from(winCellMap.values()),
    winningLines,
    scatterCount,
  };
}

function applyCascade(grid, winCells, stickyWilds, pool) {
  const winSet = new Set(winCells.map((cell) => `${cell.r}-${cell.c}`));
  const stickyMap = new Map(stickyWilds.map((sw) => [`${sw.r}-${sw.c}`, sw.type]));
  const nextGrid = [];

  for (let r = 0; r < REELS; r++) {
    const surviving = [];
    const nonStickyIndices = [];
    for (let c = 0; c < ROWS; c++) {
      const key = `${r}-${c}`;
      if (stickyMap.has(key)) continue;
      nonStickyIndices.push(c);
      if (!winSet.has(key)) surviving.push(grid[r][c]);
    }

    const neededNew = nonStickyIndices.length - surviving.length;
    const filledNonSticky = [
      ...Array.from({ length: neededNew }, () => pickRandomSymbol(pool)),
      ...surviving,
    ];

    const col = new Array(ROWS);
    let ptr = 0;
    for (let c = 0; c < ROWS; c++) {
      const key = `${r}-${c}`;
      const stickyType = stickyMap.get(key);
      col[c] = stickyType || filledNonSticky[ptr++];
    }
    nextGrid.push(col);
  }
  return nextGrid;
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
      if (idx >= 0) list[idx] = entry;
      else list.push(entry);
      list.sort((a, b) => (b.balance || 0) - (a.balance || 0));
      await kv.put('leaderboard', JSON.stringify(list.slice(0, 50)));
    };

    return {
      async getOrCreateUser(userId, displayName, username, startParam) {
        const key = `user:${userId}`;
        const raw = await kv.get(key, 'json');
        let creditedInviterId = null;
        let user;

        if (!raw) {
          let inviterId = null;
          if (startParam && startParam.startsWith('ref_')) {
            const candidate = startParam.slice(4).trim();
            if (candidate && candidate !== userId) inviterId = candidate;
          }
          user = normalizeUserState({ balance: 1000, referred_by: inviterId }, userId, displayName, username);
          await kv.put(key, JSON.stringify(user));
          await updateLeaderboard(userId, user.name, user.balance);

          if (inviterId) {
            const invKey = `user:${inviterId}`;
            const invRaw = await kv.get(invKey, 'json');
            if (invRaw) {
              const inviter = normalizeUserState(invRaw, inviterId);
              inviter.balance += 5000;
              await kv.put(invKey, JSON.stringify(inviter));
              await updateLeaderboard(inviterId, inviter.name, inviter.balance);
              creditedInviterId = inviterId;
            }
          }
        } else {
          user = normalizeUserState(raw, userId, displayName, username);
          await kv.put(key, JSON.stringify(user));
          await updateLeaderboard(userId, user.name, user.balance);
        }
        return { user, creditedInviterId };
      },

      async getUser(userId, displayName, username) {
        const raw = await kv.get(`user:${userId}`, 'json');
        return raw ? normalizeUserState(raw, userId, displayName, username) : null;
      },

      async saveUser(user) {
        user.updated_at = new Date().toISOString();
        await kv.put(`user:${user.id}`, JSON.stringify(user));
        await updateLeaderboard(user.id, user.name, user.balance);
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
        return Boolean(await kv.get(`payment:${chargeId}`));
      },

      async recordPaymentAndCredit(chargeId, userId, packageId, starsAmount, coins) {
        await kv.put(
          `payment:${chargeId}`,
          JSON.stringify({ userId, packageId, starsAmount, coins, at: new Date().toISOString() })
        );
        const key = `user:${userId}`;
        const raw = await kv.get(key, 'json');
        const user = normalizeUserState(raw || { balance: 1000 }, userId);
        user.balance += coins;
        await kv.put(key, JSON.stringify(user));
        await updateLeaderboard(userId, user.name, user.balance);
      },

      async getLeaderboard() {
        const raw = await kv.get('leaderboard', 'json');
        const list = Array.isArray(raw) ? raw : [];
        return list.slice(0, 20).map(({ name, balance }) => ({ name, balance }));
      },

      async getMeta(key) {
        return kv.get(`meta:${key}`);
      },

      async setMeta(key, val) {
        await kv.put(`meta:${key}`, String(val));
      },
    };
  }

  if (db) {
    return {
      async getOrCreateUser(userId, displayName, username, startParam) {
        let row = await db.prepare('SELECT id, name, balance, last_daily_date FROM users WHERE id = ?').bind(userId).first();
        let creditedInviterId = null;
        if (!row) {
          let inviterId = null;
          if (startParam && startParam.startsWith('ref_')) {
            const candidate = startParam.slice(4).trim();
            if (candidate && candidate !== userId) inviterId = candidate;
          }
          await db
            .prepare('INSERT INTO users (id, name, username, balance, referred_by) VALUES (?, ?, ?, ?, ?)')
            .bind(userId, displayName, username, 1000, inviterId)
            .run();
          if (inviterId) {
            await db.prepare("UPDATE users SET balance = balance + 5000, updated_at = datetime('now') WHERE id = ?").bind(inviterId).run();
            creditedInviterId = inviterId;
          }
          row = { id: userId, name: displayName, balance: 1000, last_daily_date: '' };
        } else {
          await db.prepare("UPDATE users SET name = ?, username = ?, updated_at = datetime('now') WHERE id = ?").bind(displayName, username, userId).run();
        }
        const metaRaw = await this.getMeta(`state:${userId}`);
        const extra = metaRaw ? JSON.parse(metaRaw) : {};
        return { user: normalizeUserState({ ...extra, ...row }, userId, displayName, username), creditedInviterId };
      },

      async getUser(userId, displayName, username) {
        const row = await db.prepare('SELECT id, name, balance, last_daily_date FROM users WHERE id = ?').bind(userId).first();
        if (!row) return null;
        const metaRaw = await this.getMeta(`state:${userId}`);
        const extra = metaRaw ? JSON.parse(metaRaw) : {};
        return normalizeUserState({ ...extra, ...row }, userId, displayName, username);
      },

      async saveUser(user) {
        await db
          .prepare("UPDATE users SET balance = ?, last_daily_date = ?, updated_at = datetime('now') WHERE id = ?")
          .bind(user.balance, user.last_daily_date || '', user.id)
          .run();
        await this.setMeta(`state:${user.id}`, JSON.stringify(user));
      },

      async getJackpot() {
        const row = await db.prepare('SELECT value_int FROM game_state WHERE key = ?').bind('jackpot').first();
        return row && row.value_int ? Number(row.value_int) : 500000;
      },

      async setJackpot(val) {
        await db
          .prepare("INSERT INTO game_state (key, value_int, updated_at) VALUES ('jackpot', ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value_int = excluded.value_int, updated_at = excluded.updated_at")
          .bind(Math.floor(val))
          .run();
      },

      async hasPayment(chargeId) {
        return Boolean(await db.prepare('SELECT charge_id FROM payments WHERE charge_id = ?').bind(chargeId).first());
      },

      async recordPaymentAndCredit(chargeId, userId, packageId, starsAmount, coins) {
        await db
          .prepare('INSERT INTO payments (charge_id, user_id, package_id, stars_amount, coins_credited) VALUES (?, ?, ?, ?, ?)')
          .bind(chargeId, userId, packageId, starsAmount, coins)
          .run();
        await db.prepare("UPDATE users SET balance = balance + ?, updated_at = datetime('now') WHERE id = ?").bind(coins, userId).run();
      },

      async getLeaderboard() {
        const { results } = await db.prepare('SELECT name, balance FROM users ORDER BY balance DESC LIMIT 20').all();
        return results || [];
      },

      async getMeta(key) {
        const row = await db.prepare('SELECT value_int FROM game_state WHERE key = ?').bind(`meta:${key}`).first().catch(() => null);
        return row ? String(row.value_int) : memMeta.get(key) || null;
      },

      async setMeta(key, val) {
        memMeta.set(key, String(val));
      },
    };
  }

  return {
    async getOrCreateUser(userId, displayName, username, startParam) {
      let user = memUsers.get(userId);
      let creditedInviterId = null;
      if (!user) {
        let inviterId = null;
        if (startParam && startParam.startsWith('ref_')) {
          const candidate = startParam.slice(4).trim();
          if (candidate && candidate !== userId) inviterId = candidate;
        }
        user = normalizeUserState({ balance: 1000, referred_by: inviterId }, userId, displayName, username);
        memUsers.set(userId, user);
        if (inviterId && memUsers.has(inviterId)) {
          memUsers.get(inviterId).balance += 5000;
          creditedInviterId = inviterId;
        }
      } else {
        user = normalizeUserState(user, userId, displayName, username);
        memUsers.set(userId, user);
      }
      return { user, creditedInviterId };
    },
    async getUser(userId, displayName, username) {
      const u = memUsers.get(userId);
      return u ? normalizeUserState(u, userId, displayName, username) : null;
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
    async recordPaymentAndCredit(chargeId, userId, _pkg, _stars, coins) {
      memPayments.add(chargeId);
      const user = normalizeUserState(memUsers.get(userId) || { balance: 1000 }, userId);
      user.balance += coins;
      memUsers.set(userId, user);
    },
    async getLeaderboard() {
      return Array.from(memUsers.values())
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 20)
        .map(({ name, balance }) => ({ name, balance }));
    },
    async getMeta(key) {
      return memMeta.get(key) || null;
    },
    async setMeta(key, val) {
      memMeta.set(key, String(val));
    },
  };
}

async function runTelegramSetup(origin, env, store) {
  const botToken = getBotToken(env);
  if (!botToken) {
    return { ok: false, error: 'BOT_TOKEN secret is not configured in Cloudflare' };
  }

  const webhookUrl = `${origin}/api/telegram-webhook`;
  const secretToken = await getWebhookSecret(env);

  const [meRes, webhookRes, menuRes, cmdRes] = await Promise.all([
    callTelegramBotApi(botToken, 'getMe'),
    callTelegramBotApi(botToken, 'setWebhook', {
      url: webhookUrl,
      secret_token: secretToken,
      allowed_updates: ['message', 'pre_checkout_query', 'callback_query'],
      drop_pending_updates: false,
    }),
    callTelegramBotApi(botToken, 'setChatMenuButton', {
      menu_button: {
        type: 'web_app',
        text: '🎰 Играть',
        web_app: { url: origin },
      },
    }),
    callTelegramBotApi(botToken, 'setMyCommands', {
      commands: [
        { command: 'start', description: '🎰 Запустить Forest Fortune' },
        { command: 'top', description: '🏆 Таблица лидеров' },
      ],
    }),
  ]);

  const botUsername = meRes && meRes.ok && meRes.result && meRes.result.username ? meRes.result.username : '';
  if (botUsername) {
    await store.setMeta('bot_username', botUsername);
  }
  if (webhookRes && webhookRes.ok) {
    await store.setMeta('setup_origin', origin);
  } else {
    await store.setMeta('last_setup_error', JSON.stringify(webhookRes));
  }

  const infoRes = await callTelegramBotApi(botToken, 'getWebhookInfo');
  const lastWebhookDebug = await store.getMeta('last_webhook_debug');

  return {
    ok: Boolean(webhookRes.ok && menuRes.ok),
    botUsername,
    webhookUrl,
    webhook: Boolean(webhookRes.ok),
    menuButton: Boolean(menuRes.ok),
    commands: Boolean(cmdRes.ok),
    pendingUpdates: infoRes.result ? infoRes.result.pending_update_count : null,
    lastError: infoRes.result ? infoRes.result.last_error_message || null : null,
    lastWebhookDebug: lastWebhookDebug ? JSON.parse(lastWebhookDebug) : null,
    description: webhookRes.description || menuRes.description || null,
  };
}

async function handleBalance(request, env, store, ctx) {
  const botToken = getBotToken(env);
  const body = await request.json().catch(() => ({}));
  const user = await verifyTelegramInitData(body.initData || '', botToken);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const origin = getOrigin(request, env);
  const setupOrigin = await store.getMeta('setup_origin');
  if (botToken && setupOrigin !== origin && ctx && typeof ctx.waitUntil === 'function') {
    ctx.waitUntil(runTelegramSetup(origin, env, store).catch(() => {}));
  }

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
    callTelegramBotApi(botToken, 'sendMessage', {
      chat_id: creditedInviterId,
      text: `🎉 По вашей ссылке присоединился игрок ${displayName}!\nВам начислено +5 000 монет 🪙`,
    }).catch(() => {});
  }

  const [jackpot, botUsername] = await Promise.all([
    store.getJackpot(),
    store.getMeta('bot_username'),
  ]);

  return json(serializeClientState(saved, jackpot, botUsername));
}

async function handleSpin(request, env, store) {
  const botToken = getBotToken(env);
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', botToken);
  if (!tgUser) return json({ error: 'Unauthorized' }, 401);

  const userId = String(tgUser.id);
  const displayName = tgUser.first_name || tgUser.username || `Player_${userId.slice(-4)}`;
  const username = tgUser.username || '';

  const user = await store.getUser(userId, displayName, username);
  if (!user) return json({ error: 'User not found' }, 404);

  const isFreeSpin = user.freeSpins > 0;
  let linesCount = Number(body.linesCount);
  let betPerLine = Math.floor(Number(body.betPerLine) || 1);

  if (isFreeSpin) {
    linesCount = user.fsLinesCount;
    betPerLine = user.fsBetPerLine;
  } else {
    if (!ALLOWED_LINES.has(linesCount)) return json({ error: 'Invalid linesCount' }, 400);
    if (betPerLine < 1 || betPerLine * linesCount > MAX_TOTAL_BET) {
      return json({ error: 'Invalid betPerLine' }, 400);
    }
  }

  const totalBet = linesCount * betPerLine;

  if (!isFreeSpin && user.balance < totalBet) {
    return json({ error: 'Недостаточно монет' }, 400);
  }

  user.pendingRiskWin = 0;
  user.riskRoundsLeft = 0;

  let jackpot = await store.getJackpot();
  if (isFreeSpin) {
    user.freeSpins -= 1;
  } else {
    user.balance -= totalBet;
    jackpot += Math.max(1, Math.floor(totalBet * 0.01));
  }

  const pool = generatePool(totalBet);
  let workingSticky = isFreeSpin ? [...user.stickyWilds] : [];
  let grid = generateGrid(pool, workingSticky);

  const cascades = [];
  let spinTotalWin = 0;
  let scatterBonusTriggered = false;

  for (let step = 0; step < MAX_CASCADES; step++) {
    const res = evaluateGrid(grid, linesCount, betPerLine, isFreeSpin);

    if (res.scatterCount >= 3 && !scatterBonusTriggered) {
      scatterBonusTriggered = true;
      user.wheelBonusSpins += 1;
    }

    if (isFreeSpin) {
      for (let r = 0; r < REELS; r++) {
        for (let c = 0; c < ROWS; c++) {
          const sym = grid[r][c];
          if ((sym === 'wild.png' || sym === 'gem.png') && !workingSticky.some((sw) => sw.r === r && sw.c === c)) {
            workingSticky.push({ r, c, type: sym });
          }
        }
      }
    }

    cascades.push({
      grid,
      winCells: res.winCells,
      winningLines: res.winningLines,
      cascadeWin: res.totalWin,
      scatterCount: res.scatterCount,
      stickyWilds: [...workingSticky],
    });

    if (res.totalWin <= 0) break;

    spinTotalWin += res.totalWin;
    grid = applyCascade(grid, res.winCells, workingSticky, pool);
  }

  let jackpotWon = false;
  let jackpotWinAmount = 0;
  if (totalBet >= 10 && cryptoRandomInt(10000) === 0) {
    jackpotWon = true;
    jackpotWinAmount = jackpot;
    jackpot = 50000;
  }

  const grandWin = spinTotalWin + jackpotWinAmount;
  user.balance += grandWin;
  user.tasks.spins.progress += 1;
  if (spinTotalWin > 0) {
    user.tasks.wins.progress += 1;
  }

  let fsFinishedSummary = null;
  if (isFreeSpin) {
    user.fsTotalWin += grandWin;
    user.stickyWilds = workingSticky;
    if (user.freeSpins === 0) {
      fsFinishedSummary = user.fsTotalWin;
      user.stickyWilds = [];
      user.fsTotalWin = 0;
    }
  } else {
    user.stickyWilds = [];
    if (spinTotalWin >= totalBet * 2) {
      user.pendingRiskWin = spinTotalWin;
      user.riskRoundsLeft = 5;
    }
  }

  await store.saveUser(user);
  await store.setJackpot(jackpot);

  return json({
    cascades,
    totalWin: spinTotalWin,
    jackpot,
    jackpotWon,
    jackpotWinAmount,
    scatterBonusTriggered,
    fsFinishedSummary,
    ...serializeClientState(user, jackpot),
  });
}

async function handleWheel(request, env, store) {
  const botToken = getBotToken(env);
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', botToken);
  if (!tgUser) return json({ error: 'Unauthorized' }, 401);

  const userId = String(tgUser.id);
  const user = await store.getUser(userId);
  if (!user) return json({ error: 'User not found' }, 404);

  const todayUtc = getTodayUtc();
  const dailyAvailable = user.lastWheelDate !== todayUtc;
  if (!dailyAvailable && user.wheelBonusSpins <= 0) {
    return json({ ok: false, error: 'Колесо доступно 1 раз в сутки!' }, 400);
  }

  if (dailyAvailable) {
    user.lastWheelDate = todayUtc;
  } else {
    user.wheelBonusSpins = Math.max(0, user.wheelBonusSpins - 1);
  }

  const prizeIndex = cryptoRandomInt(WHEEL_PRIZES.length);
  const prize = WHEEL_PRIZES[prizeIndex];
  const baseBet = Math.max(21, Math.min(MAX_TOTAL_BET, Math.floor(Number(body.baseBet) || 21)));

  let coinsWon = 0;
  let fsWon = 0;

  if (prize.type === 'mult') {
    coinsWon = prize.val * baseBet;
    user.balance += coinsWon;
  } else if (prize.type === 'jackpot') {
    coinsWon = prize.val;
    user.balance += coinsWon;
  } else if (prize.type === 'fs') {
    fsWon = prize.val;
    if (user.freeSpins === 0) {
      user.fsTotalWin = 0;
      user.stickyWilds = [];
      user.fsLinesCount = 21;
      user.fsBetPerLine = Math.max(1, Math.floor(baseBet / 21));
    }
    user.freeSpins += fsWon;
  }

  user.tasks.wheel.progress += 1;
  await store.saveUser(user);
  const jackpot = await store.getJackpot();

  return json({
    ok: true,
    prizeIndex,
    prize,
    coinsWon,
    fsWon,
    ...serializeClientState(user, jackpot),
  });
}

async function handleRisk(request, env, store) {
  const botToken = getBotToken(env);
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', botToken);
  if (!tgUser) return json({ error: 'Unauthorized' }, 401);

  const userId = String(tgUser.id);
  const user = await store.getUser(userId);
  if (!user) return json({ error: 'User not found' }, 404);

  if (body.choice === 'take') {
    user.pendingRiskWin = 0;
    user.riskRoundsLeft = 0;
    await store.saveUser(user);
    return json({ ok: true, took: true, balance: user.balance, pendingRiskWin: 0, riskRoundsLeft: 0 });
  }

  if (body.choice !== 'higher' && body.choice !== 'lower') {
    return json({ error: 'Invalid choice' }, 400);
  }

  if (user.pendingRiskWin <= 0 || user.riskRoundsLeft <= 0 || user.balance < user.pendingRiskWin) {
    return json({ ok: false, error: 'Риск-игра недоступна' }, 400);
  }

  const leftCard = cryptoRandomInt(13);
  let rightCard = cryptoRandomInt(13);
  while (rightCard === leftCard) {
    rightCard = cryptoRandomInt(13);
  }

  const won =
    (body.choice === 'higher' && rightCard > leftCard) ||
    (body.choice === 'lower' && rightCard < leftCard);

  if (won) {
    user.balance += user.pendingRiskWin;
    user.pendingRiskWin *= 2;
    user.riskRoundsLeft -= 1;
  } else {
    user.balance = Math.max(0, user.balance - user.pendingRiskWin);
    user.pendingRiskWin = 0;
    user.riskRoundsLeft = 0;
  }

  await store.saveUser(user);

  return json({
    ok: true,
    won,
    leftCard,
    rightCard,
    balance: user.balance,
    pendingRiskWin: user.pendingRiskWin,
    riskRoundsLeft: user.riskRoundsLeft,
  });
}

async function handleTaskClaim(request, env, store) {
  const botToken = getBotToken(env);
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', botToken);
  if (!tgUser) return json({ error: 'Unauthorized' }, 401);

  const taskId = body.taskId;
  const spec = TASK_TARGETS[taskId];
  if (!spec) return json({ error: 'Unknown task' }, 400);

  const user = await store.getUser(String(tgUser.id));
  if (!user) return json({ error: 'User not found' }, 404);

  const task = user.tasks[taskId];
  if (!task || task.claimed || task.progress < spec.target) {
    return json({ ok: false, error: 'Задание ещё не выполнено или уже получено' }, 400);
  }

  task.claimed = true;
  user.balance += spec.reward;
  await store.saveUser(user);
  const jackpot = await store.getJackpot();

  return json({
    ok: true,
    reward: spec.reward,
    ...serializeClientState(user, jackpot),
  });
}

async function handleDailyBonus(request, env, store) {
  const botToken = getBotToken(env);
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', botToken);
  if (!tgUser) return json({ error: 'Unauthorized' }, 401);

  const user = await store.getUser(String(tgUser.id));
  if (!user) return json({ ok: false, error: 'Пользователь не найден' }, 404);

  const todayUtc = getTodayUtc();
  if (user.last_daily_date === todayUtc) {
    return json({ ok: false, error: 'Бонус уже получен сегодня!' }, 400);
  }

  user.balance += 100;
  user.last_daily_date = todayUtc;
  await store.saveUser(user);

  return json({ ok: true, balance: user.balance, dailyBonusReady: false });
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
  return json(await store.getLeaderboard());
}

async function handleSetup(request, env, store) {
  const origin = getOrigin(request, env);
  const result = await runTelegramSetup(origin, env, store);
  return json(result, result.ok ? 200 : 500);
}

async function sendTopLeaderboard(botToken, chatId, appUrl, store) {
  const list = await store.getLeaderboard();
  const medals = ['🥇', '🥈', '🥉'];
  const lines = list.slice(0, 10).map((item, idx) => {
    const prefix = medals[idx] || `${idx + 1}.`;
    return `${prefix} ${escapeHtml(item.name || 'Player')} — ${Number(item.balance || 0).toLocaleString('ru-RU')} 🪙`;
  });

  const text = lines.length
    ? `🏆 <b>ТОП-10 игроков Forest Fortune 5x5</b>\n\n${lines.join('\n')}`
    : '🏆 Пока в таблице лидеров никого нет. Стань первым!';

  return callTelegramBotApi(botToken, 'sendMessage', {
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
    if (!timingSafeEqualStr(secretHeader || '', expectedSecret)) {
      await store.setMeta('last_webhook_debug', JSON.stringify({
        at: new Date().toISOString(),
        error: 'secret_mismatch',
        hasHeader: Boolean(secretHeader),
      }));
      return json({ error: 'Forbidden' }, 403);
    }
  }

  const update = await request.json().catch(() => ({}));
  const origin = getOrigin(request, env);

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
      const firstName = msg.from && msg.from.first_name ? `, ${escapeHtml(msg.from.first_name)}` : '';

      const sendRes = await callTelegramBotApi(botToken, 'sendMessage', {
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
      if (!sendRes.ok) {
        await store.setMeta('last_webhook_debug', JSON.stringify({
          at: new Date().toISOString(),
          error: 'sendMessage_failed',
          sendRes,
          appUrl,
        }));
      }
    } else if (text.startsWith('/top')) {
      await sendTopLeaderboard(botToken, msg.chat.id, origin, store);
    }
  }

  return json({ ok: true });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const store = createStore(env);

    try {
      if (url.pathname === '/api/balance' && request.method === 'POST') {
        return await handleBalance(request, env, store, ctx);
      }
      if (url.pathname === '/api/spin' && request.method === 'POST') {
        return await handleSpin(request, env, store);
      }
      if (url.pathname === '/api/wheel' && request.method === 'POST') {
        return await handleWheel(request, env, store);
      }
      if (url.pathname === '/api/risk' && request.method === 'POST') {
        return await handleRisk(request, env, store);
      }
      if (url.pathname === '/api/task-claim' && request.method === 'POST') {
        return await handleTaskClaim(request, env, store);
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
        return await handleSetup(request, env, store);
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
