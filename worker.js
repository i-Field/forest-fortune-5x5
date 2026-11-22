const MAX_BET_LIMIT = 10000;
const MAX_WHEEL_BASE = 2500;
const MAX_STICKY_WILDS = 5;
const MAX_FS_CAP = 20;
const MAX_RISK_STREAK = 5;
const JACKPOT_FLUSH_MS = 60000;
const TOP_FLUSH_MS = 45000;
const TOP_READ_TTL_MS = 30000;
const LINE_PRESETS = new Set([1, 3, 5, 9, 15, 21]);
const CHANNEL_USERNAME = '@iField_studio';

const SYMBOLS = [
  'gem.png','wild.png','mushroom.png','ufo.png','weed_cross.png','tech_face.png',
  'man.png','man2.png','hutor.png','firebird.png','rabbit.png','real_hedgehog.png',
  'bear.png','fox.png','deer.png','owl.png','squirrel.png','squirrel1.png',
  'raccoon.png','hedgehog.png','pinecone.png','acorn.png','leaf.png','coin.png'
];

const WEIGHTS = {
  'gem.png': 13, 'wild.png': 10, 'mushroom.png': 10, 'ufo.png': 6, 'weed_cross.png': 6,
  'tech_face.png': 8, 'man.png': 8, 'man2.png': 10, 'hutor.png': 12, 'firebird.png': 14,
  'rabbit.png': 17, 'real_hedgehog.png': 19, 'bear.png': 22, 'fox.png': 24, 'deer.png': 24,
  'owl.png': 26, 'squirrel.png': 27, 'squirrel1.png': 27, 'raccoon.png': 28, 'hedgehog.png': 28,
  'pinecone.png': 30, 'acorn.png': 30, 'leaf.png': 30, 'coin.png': 32
};

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
  { type: 'jackpot', val: 50000, weight: 1 },
  { type: 'fs', val: 20, weight: 5 },
  { type: 'mult', val: 50, weight: 2 },
  { type: 'mult', val: 2, weight: 36 },
  { type: 'mult', val: 5, weight: 22 },
  { type: 'fs', val: 10, weight: 10 },
  { type: 'mult', val: 10, weight: 8 },
  { type: 'mult', val: 3, weight: 26 }
];

const STAR_PACKAGES = {
  p100: { coins: 1000, stars: 50, title: '1 000 Монет · Forest Fortune' },
  p500: { coins: 5000, stars: 200, title: '5 000 Монет · Forest Fortune' },
  p2000: { coins: 20000, stars: 650, title: '20 000 Монет · Выгода +30%' },
  p10000: { coins: 100000, stars: 2500, title: '100 000 Монет · Вегас VIP' },
  p10k_stars: { coins: 450000, stars: 10000, title: '450 000 Монет · Хайроллер VIP' },
  p100000: { coins: 5000000, stars: 100000, title: '5 000 000 Монет · Король Вегаса' }
};

const TOTAL_SYMBOL_WEIGHT = SYMBOLS.reduce((acc, s) => acc + WEIGHTS[s], 0);

const mem = {
  busy: new Set(),
  jackpot: null,
  jackpotDirty: false,
  jackpotFlushAt: 0,
  top: null,
  topReadAt: 0,
  topDirty: false,
  topFlushAt: 0
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

function htmlResp(markup, status = 200) {
  return new Response(markup, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

function escHtml(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getKv(env) {
  return env.KV_BINDING || env.empire_DB || env.KV || env.USERS_KV;
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function cryptoRand() {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] / 4294967296;
}

function randInt(min, max) {
  return min + Math.floor(cryptoRand() * (max - min + 1));
}

function pickSymbol() {
  let r = cryptoRand() * TOTAL_SYMBOL_WEIGHT;
  for (const s of SYMBOLS) {
    r -= WEIGHTS[s];
    if (r <= 0) return s;
  }
  return 'coin.png';
}

async function hmacSha256(keyBytes, message) {
  const k = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', k, new TextEncoder().encode(message));
}

function toHex(buf) {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function verifyTelegramInitData(initData, botToken) {
  if (!initData || !botToken) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');
  const entries = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b));
  const checkStr = entries.map(([k, v]) => `${k}=${v}`).join('\n');
  const secretKey = await hmacSha256(new TextEncoder().encode('WebAppData'), botToken);
  const computed = toHex(await hmacSha256(secretKey, checkStr));
  if (computed.toLowerCase() !== hash.toLowerCase()) return null;
  try {
    const user = JSON.parse(params.get('user') || '{}');
    return user && user.id ? user : null;
  } catch {
    return null;
  }
}

async function getWebhookSecret(env) {
  if (env.TELEGRAM_WEBHOOK_SECRET) return env.TELEGRAM_WEBHOOK_SECRET;
  const sig = await hmacSha256(new TextEncoder().encode('forest-fortune-webhook-v4'), env.BOT_TOKEN);
  return toHex(sig).slice(0, 32);
}

async function getStatsKey(env) {
  if (env.STATS_KEY) return env.STATS_KEY;
  if (!env.BOT_TOKEN) return '';
  const sig = await hmacSha256(new TextEncoder().encode('forest-fortune-stats-v1'), env.BOT_TOKEN);
  return toHex(sig).slice(0, 24);
}

async function tgApi(botToken, method, payload) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

async function withUserLock(uid, fn) {
  if (mem.busy.has(uid)) {
    return json({ ok: false, error: 'Подождите завершения предыдущего действия' }, 429);
  }
  mem.busy.add(uid);
  try {
    return await fn();
  } finally {
    mem.busy.delete(uid);
  }
}

function defaultUser(uid, name, username) {
  return {
    uid,
    name: name || `Player_${uid.slice(-4)}`,
    username: username || '',
    balance: 1000,
    lastWin: 0,
    lastBet: 10,
    lastLines: 21,
    lastBetPerLine: 1,
    fsLines: 0,
    fsBet: 0,
    freeSpins: 0,
    wheelSpins: 1,
    stickyWilds: {},
    lastDailyDate: '',
    lastShareBoostDate: '',
    lastWheelDate: todayUtc(),
    referralsCount: 0,
    referredBy: null,
    starsSpent: 0,
    walletBeta: '',
    risk: null,
    tasks: {
      spins: 0, wins: 0, wheel: 0,
      spinsDone: false, winsDone: false, wheelDone: false,
      inviteDone: false, storyDone: false, storyClaimed: false,
      starsDone: false, channelDone: false, channelClaimed: false
    }
  };
}

function sanitizeStickyWilds(raw) {
  const clean = {};
  if (!raw || typeof raw !== 'object') return clean;
  let count = 0;
  for (const [k, v] of Object.entries(raw)) {
    if (count >= MAX_STICKY_WILDS) break;
    if (/^[0-4]_[0-4]$/.test(k) && v === 'wild.png') {
      clean[k] = 'wild.png';
      count++;
    }
  }
  return clean;
}

async function loadUser(kv, uid, name, username) {
  const raw = await kv.get(`u:${uid}`, 'json');
  if (!raw) return { user: defaultUser(uid, name, username), isNew: true, metaChanged: true };
  const def = defaultUser(uid, name, username);
  const user = { ...def, ...raw, tasks: { ...def.tasks, ...(raw.tasks || {}) } };
  user.balance = Math.max(0, Math.floor(Number(user.balance) || 0));
  user.freeSpins = Math.max(0, Math.floor(Number(user.freeSpins) || 0));
  user.wheelSpins = Math.max(0, Math.floor(Number(user.wheelSpins) || 0));
  let metaChanged = false;
  if (name && user.name !== name) {
    user.name = name;
    metaChanged = true;
  }
  if (username !== undefined && user.username !== username) {
    user.username = username;
    metaChanged = true;
  }
  return { user, isNew: false, metaChanged };
}

async function getJackpot(kv) {
  if (mem.jackpot !== null) return mem.jackpot;
  const val = Number((await kv.get('meta:jackpot')) || 500000);
  mem.jackpot = Number.isFinite(val) && val >= 50000 ? Math.floor(val) : 500000;
  mem.jackpotFlushAt = Date.now();
  return mem.jackpot;
}

async function setJackpot(kv, nextVal, forceFlush = false) {
  mem.jackpot = Math.max(50000, Math.floor(Number(nextVal) || 50000));
  mem.jackpotDirty = true;
  const now = Date.now();
  if (forceFlush || now - mem.jackpotFlushAt >= JACKPOT_FLUSH_MS) {
    await kv.put('meta:jackpot', String(mem.jackpot));
    mem.jackpotDirty = false;
    mem.jackpotFlushAt = now;
  }
}

async function getLeaderboard(kv) {
  const now = Date.now();
  if (mem.top && now - mem.topReadAt < TOP_READ_TTL_MS) {
    return mem.top;
  }
  const top = (await kv.get('meta:leaderboard', 'json')) || [];
  mem.top = Array.isArray(top) ? top : [];
  mem.topReadAt = now;
  return mem.top;
}

async function saveUser(kv, u, forceTopFlush = false) {
  await kv.put(`u:${u.uid}`, JSON.stringify(u));
  const top = (await getLeaderboard(kv)).slice();
  const prevTopUids = top.map((x) => x.uid).join(',');
  const idx = top.findIndex((x) => x.uid === u.uid);
  const entry = { uid: u.uid, name: u.name || 'Player', balance: u.balance };
  if (idx >= 0) top[idx] = entry;
  else top.push(entry);
  top.sort((a, b) => b.balance - a.balance);
  const nextTop = top.slice(0, 25);
  const nextTopUids = nextTop.map((x) => x.uid).join(',');
  mem.top = nextTop;
  mem.topReadAt = Date.now();
  mem.topDirty = true;
  const now = Date.now();
  if (forceTopFlush || prevTopUids !== nextTopUids || now - mem.topFlushAt >= TOP_FLUSH_MS) {
    await kv.put('meta:leaderboard', JSON.stringify(nextTop));
    mem.topDirty = false;
    mem.topFlushAt = now;
  }
}

function serializeClientState(u, jackpot) {
  const today = todayUtc();
  return {
    uid: u.uid,
    balance: u.balance,
    jackpot,
    freeSpins: u.freeSpins,
    wheelSpins: u.wheelSpins,
    canDaily: u.lastDailyDate !== today,
    canShareBoost: u.lastShareBoostDate !== today,
    referralsCount: u.referralsCount,
    starsSpent: u.starsSpent,
    walletBeta: u.walletBeta || '',
    tasks: u.tasks
  };
}

function evaluateGrid(grid, linesCount, betPerLine, fsMult) {
  const winningLines = [];
  const winCellMap = new Map();
  let stepWin = 0;

  for (let li = 0; li < linesCount; li++) {
    const line = PAYLINES[li];
    const lineSyms = line.map(([c, r]) => grid[c][r]);
    let baseSym = null;
    for (const s of lineSyms) {
      if (s !== 'gem.png' && s !== 'wild.png') { baseSym = s; break; }
    }
    if (!baseSym) baseSym = 'wild.png';
    if (baseSym === 'mushroom.png') continue;

    let count = 0;
    let wildCount = 0;
    for (const s of lineSyms) {
      if (s === baseSym || s === 'gem.png' || s === 'wild.png') {
        count++;
        if (s === 'wild.png') wildCount++;
      } else break;
    }

    if (count >= 3) {
      const mult = (PAYTABLE[baseSym] || [2, 5, 20])[count - 3];
      const wMult = wildCount >= 2 ? 3 : (wildCount === 1 ? 2 : 1);
      const lineWin = mult * betPerLine * wMult * fsMult;
      stepWin += lineWin;
      winningLines.push({ lineIndex: li, count, win: lineWin });
      for (let i = 0; i < count; i++) {
        const [wc, wr] = line[i];
        winCellMap.set(`${wc}_${wr}`, [wc, wr]);
      }
    }
  }

  return { stepWin, winningLines, winningCells: Array.from(winCellMap.values()) };
}

function tumbleGrid(grid, winningCells, stickyWilds) {
  const removeSet = new Set(winningCells.map(([c, r]) => `${c}_${r}`));
  const next = Array.from({ length: 5 }, () => new Array(5));
  for (let c = 0; c < 5; c++) {
    const kept = [];
    for (let r = 4; r >= 0; r--) {
      const k = `${c}_${r}`;
      if (stickyWilds[k] || !removeSet.has(k)) kept.push(stickyWilds[k] || grid[c][r]);
    }
    let idx = 0;
    for (let r = 4; r >= 0; r--) {
      const k = `${c}_${r}`;
      if (stickyWilds[k]) next[c][r] = stickyWilds[k];
      else if (idx < kept.length) next[c][r] = kept[idx++];
      else next[c][r] = pickSymbol();
    }
  }
  return next;
}

async function handleBalance(request, env, kv) {
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', env.BOT_TOKEN);
  if (!tgUser) return json({ ok: false, error: 'Unauthorized' }, 401);

  const uid = String(tgUser.id);
  return withUserLock(uid, async () => {
    const name = tgUser.first_name || tgUser.username || `Player_${uid.slice(-4)}`;
    const { user: u, isNew, metaChanged } = await loadUser(kv, uid, name, tgUser.username || '');
    let dirty = isNew || metaChanged;

    const today = todayUtc();
    if (u.lastWheelDate !== today) {
      if (u.wheelSpins < 1) u.wheelSpins = 1;
      u.lastWheelDate = today;
      dirty = true;
    }

    if (isNew && typeof body.startParam === 'string' && body.startParam.startsWith('ref_')) {
      const inviterId = body.startParam.slice(4).trim();
      if (/^\d+$/.test(inviterId) && inviterId !== uid && !u.referredBy) {
        const invRaw = await kv.get(`u:${inviterId}`, 'json');
        if (invRaw) {
          const { user: inv } = await loadUser(kv, inviterId);
          u.referredBy = inviterId;
          inv.balance += 5000;
          inv.referralsCount = (inv.referralsCount || 0) + 1;
          await saveUser(kv, inv, true);
          dirty = true;
        }
      }
    }

    if (dirty) await saveUser(kv, u, isNew);
    const jackpot = await getJackpot(kv);
    return json({ ok: true, ...serializeClientState(u, jackpot) });
  });
}

async function handleSpin(request, env, kv) {
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', env.BOT_TOKEN);
  if (!tgUser) return json({ ok: false, error: 'Unauthorized' }, 401);

  const uid = String(tgUser.id);
  return withUserLock(uid, async () => {
    const { user: u } = await loadUser(kv, uid);
    const isFreeSpin = u.freeSpins > 0;

    let lines;
    let bet;
    if (isFreeSpin) {
      lines = LINE_PRESETS.has(Number(u.fsLines))
        ? Number(u.fsLines)
        : (LINE_PRESETS.has(Number(u.lastLines)) ? Number(u.lastLines) : 21);
      const lockedBet = Number(u.fsBet) > 0
        ? Number(u.fsBet)
        : Math.max(1, Math.min(100, Number(u.lastBetPerLine) || Math.floor((Number(u.lastBet) || 21) / lines) || 10));
      bet = Math.max(1, Math.min(MAX_BET_LIMIT, Math.floor(lockedBet)));
      u.stickyWilds = sanitizeStickyWilds(u.stickyWilds);
    } else {
      lines = LINE_PRESETS.has(Number(body.lines)) ? Number(body.lines) : 21;
      bet = Math.max(1, Math.min(MAX_BET_LIMIT, Math.floor(Number(body.bet) || 1)));
      u.lastLines = lines;
      u.lastBetPerLine = bet;
      u.fsLines = 0;
      u.fsBet = 0;
      u.stickyWilds = {};
    }

    const cost = isFreeSpin ? 0 : lines * bet;
    if (!isFreeSpin && u.balance < cost) {
      return json({ ok: false, error: 'Недостаточно монет' }, 400);
    }

    let jackpot = await getJackpot(kv);
    let jackpotChanged = false;
    let jackpotForceFlush = false;

    if (isFreeSpin) {
      u.freeSpins -= 1;
    } else {
      u.balance -= cost;
      jackpot += Math.max(1, Math.floor(cost * 0.015));
      jackpotChanged = true;
    }

    let grid = Array.from({ length: 5 }, (_, c) =>
      Array.from({ length: 5 }, (_, r) => u.stickyWilds[`${c}_${r}`] || pickSymbol())
    );

    let scatterCount = 0;
    for (let c = 0; c < 5; c++) {
      for (let r = 0; r < 5; r++) {
        if (grid[c][r] === 'mushroom.png') scatterCount++;
      }
    }

    const fsMult = isFreeSpin ? 2 : 1;
    const steps = [];
    let totalWin = 0;

    for (let s = 0; s < 6; s++) {
      const ev = evaluateGrid(grid, lines, bet, fsMult);
      steps.push({ grid: grid.map((col) => col.slice()), ...ev });
      if (ev.stepWin <= 0) break;
      totalWin += ev.stepWin;
      grid = tumbleGrid(grid, ev.winningCells, isFreeSpin ? u.stickyWilds : {});
    }

    let jackpotWon = false;
    if (cost >= 20 && cryptoRand() < 0.00015) {
      jackpotWon = true;
      totalWin += jackpot;
      jackpot = 50000;
      jackpotChanged = true;
      jackpotForceFlush = true;
    }

    let scatterBonusSpin = false;
    let awardedFreeSpins = 0;
    if (scatterCount >= 3) {
      const rawAward = isFreeSpin
        ? (scatterCount === 3 ? 2 : (scatterCount === 4 ? 3 : 5))
        : (scatterCount === 3 ? 5 : (scatterCount === 4 ? 8 : 12));
      const room = Math.max(0, MAX_FS_CAP - u.freeSpins);
      awardedFreeSpins = Math.min(room, rawAward);
      if (awardedFreeSpins > 0) {
        u.freeSpins += awardedFreeSpins;
      }
      if (!isFreeSpin) {
        u.fsLines = lines;
        u.fsBet = bet;
        u.wheelSpins += 1;
        scatterBonusSpin = true;
      } else if (awardedFreeSpins > 0) {
        scatterBonusSpin = true;
      }
    }

    if (u.freeSpins > 0) {
      let stickyCount = Object.keys(u.stickyWilds).length;
      for (let c = 0; c < 5 && stickyCount < MAX_STICKY_WILDS; c++) {
        for (let r = 0; r < 5 && stickyCount < MAX_STICKY_WILDS; r++) {
          const k = `${c}_${r}`;
          if (grid[c][r] === 'wild.png' && !u.stickyWilds[k]) {
            u.stickyWilds[k] = 'wild.png';
            stickyCount++;
          }
        }
      }
    } else {
      u.stickyWilds = {};
      u.fsLines = 0;
      u.fsBet = 0;
    }

    u.balance += totalWin;
    u.lastWin = totalWin;
    u.lastBet = lines * bet;
    u.risk = null;
    u.tasks.spins += 1;
    if (totalWin > 0) u.tasks.wins += 1;

    if (jackpotChanged) await setJackpot(kv, jackpot, jackpotForceFlush);
    await saveUser(kv, u, jackpotWon);

    return json({
      ok: true,
      steps,
      finalGrid: grid,
      totalWin,
      jackpotWon,
      scatterBonusSpin,
      scatterCount,
      awardedFreeSpins,
      stickyWilds: u.stickyWilds,
      ...serializeClientState(u, jackpot)
    });
  });
}

async function handleWheel(request, env, kv) {
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', env.BOT_TOKEN);
  if (!tgUser) return json({ ok: false, error: 'Unauthorized' }, 401);

  const uid = String(tgUser.id);
  return withUserLock(uid, async () => {
    const { user: u } = await loadUser(kv, uid);
    if (u.wheelSpins <= 0) return json({ ok: false, error: 'Нет доступных прокрутов колеса!' }, 400);

    u.wheelSpins -= 1;
    u.tasks.wheel += 1;

    const totalW = WHEEL_PRIZES.reduce((acc, p) => acc + p.weight, 0);
    let r = cryptoRand() * totalW;
    let prizeIndex = 3;
    for (let i = 0; i < WHEEL_PRIZES.length; i++) {
      r -= WHEEL_PRIZES[i].weight;
      if (r <= 0) { prizeIndex = i; break; }
    }

    const prize = WHEEL_PRIZES[prizeIndex];
    let winAmount = 0;
    if (prize.type === 'jackpot') {
      winAmount = prize.val;
      u.balance += winAmount;
    } else if (prize.type === 'fs') {
      if (u.freeSpins === 0) {
        const lines = LINE_PRESETS.has(Number(u.lastLines)) ? Number(u.lastLines) : 21;
        u.fsLines = lines;
        const perLine = Number(u.lastBetPerLine) || Math.floor((Number(u.lastBet) || 21) / lines) || 10;
        u.fsBet = Math.max(1, Math.min(100, Math.floor(perLine)));
      }
      const room = Math.max(0, MAX_FS_CAP - u.freeSpins);
      u.freeSpins += Math.min(room, prize.val);
    } else {
      const base = Math.max(50, Math.min(MAX_WHEEL_BASE, u.lastBet || 100));
      winAmount = base * prize.val;
      u.balance += winAmount;
    }

    await saveUser(kv, u);
    const jackpot = await getJackpot(kv);
    return json({ ok: true, prizeIndex, winAmount, ...serializeClientState(u, jackpot) });
  });
}

async function handleRisk(request, env, kv) {
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', env.BOT_TOKEN);
  if (!tgUser) return json({ ok: false, error: 'Unauthorized' }, 401);

  const uid = String(tgUser.id);
  return withUserLock(uid, async () => {
    const { user: u } = await loadUser(kv, uid);
    const jackpot = await getJackpot(kv);

    if (body.action === 'deal') {
      if (u.risk && u.risk.active) {
        return json({ ok: true, leftCard: u.risk.leftCard, stake: u.risk.stake });
      }
      if (u.lastWin <= 0 || u.lastWin < (u.lastBet || 1) * 2) {
        return json({ ok: false, error: 'Сначала выиграйте минимум 2x от ставки!' }, 400);
      }
      const stake = u.lastWin;
      if (u.balance < stake) return json({ ok: false, error: 'Недостаточно монет' }, 400);
      u.balance -= stake;
      u.lastWin = 0;
      const leftCard = randInt(4, 12);
      u.risk = { active: true, stake, leftCard, streak: 0 };
      await saveUser(kv, u);
      return json({ ok: true, leftCard, stake });
    }

    if (body.action === 'guess') {
      if (!u.risk || !u.risk.active) return json({ ok: false, error: 'Риск-раунд не активен' }, 400);
      const streak = Number(u.risk.streak || 0);
      if (streak >= MAX_RISK_STREAK) {
        return json({ ok: false, error: `Максимум ${MAX_RISK_STREAK} шагов удвоения! Нажмите «Забрать».` }, 400);
      }
      let rightCard = randInt(2, 14);
      while (rightCard === u.risk.leftCard) rightCard = randInt(2, 14);
      const won = body.choice === 'higher' ? rightCard > u.risk.leftCard : rightCard < u.risk.leftCard;
      if (won) {
        u.risk.stake *= 2;
        u.risk.streak = streak + 1;
        const nextLeft = randInt(4, 12);
        u.risk.leftCard = nextLeft;
        await saveUser(kv, u);
        return json({ ok: true, won: true, rightCard, nextLeftCard: nextLeft, stake: u.risk.stake });
      } else {
        u.risk = null;
        await saveUser(kv, u);
        return json({ ok: true, won: false, rightCard, stake: 0, ...serializeClientState(u, jackpot) });
      }
    }

    if (body.action === 'take') {
      if (!u.risk || !u.risk.active) return json({ ok: false, error: 'Нечего забирать' }, 400);
      const takeAmt = u.risk.stake;
      u.balance += takeAmt;
      u.lastWin = takeAmt;
      u.risk = null;
      await saveUser(kv, u);
      return json({ ok: true, stake: takeAmt, ...serializeClientState(u, jackpot) });
    }

    return json({ ok: false, error: 'Invalid action' }, 400);
  });
}

async function handleDailyBonus(request, env, kv) {
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', env.BOT_TOKEN);
  if (!tgUser) return json({ ok: false, error: 'Unauthorized' }, 401);

  const uid = String(tgUser.id);
  return withUserLock(uid, async () => {
    const { user: u } = await loadUser(kv, uid);
    const today = todayUtc();
    const action = body.action === 'share_boost' ? 'share_boost' : 'daily';

    if (action === 'daily') {
      if (u.lastDailyDate === today) return json({ ok: false, error: 'Ежедневный кран уже получен сегодня!' }, 400);
      u.lastDailyDate = today;
      u.balance += 100;
    } else {
      if (u.lastShareBoostDate === today) return json({ ok: false, error: 'Кран за репост уже получен сегодня!' }, 400);
      u.lastShareBoostDate = today;
      u.balance += 250;
    }

    await saveUser(kv, u);
    const jackpot = await getJackpot(kv);
    return json({ ok: true, ...serializeClientState(u, jackpot) });
  });
}

async function handleTaskClaim(request, env, kv) {
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', env.BOT_TOKEN);
  if (!tgUser) return json({ ok: false, error: 'Unauthorized' }, 401);

  const uid = String(tgUser.id);
  return withUserLock(uid, async () => {
    const { user: u } = await loadUser(kv, uid);
    const jackpot = await getJackpot(kv);
    const taskId = String(body.taskId || '');
    const action = body.action === 'mark' ? 'mark' : 'claim';

    if (action === 'mark') {
      let dirty = false;
      if (taskId === 'story' && !u.tasks.storyDone) { u.tasks.storyDone = true; dirty = true; }
      if (taskId === 'channel' && !u.tasks.channelDone) { u.tasks.channelDone = true; dirty = true; }
      if (dirty) await saveUser(kv, u);
      return json({ ok: true, ...serializeClientState(u, jackpot) });
    }

    let reward = 0;
    if (taskId === 'spins' && u.tasks.spins >= 20 && !u.tasks.spinsDone) {
      u.tasks.spinsDone = true; reward = 250;
    } else if (taskId === 'wins' && u.tasks.wins >= 5 && !u.tasks.winsDone) {
      u.tasks.winsDone = true; reward = 300;
    } else if (taskId === 'wheel' && u.tasks.wheel >= 1 && !u.tasks.wheelDone) {
      u.tasks.wheelDone = true; reward = 150;
    } else if (taskId === 'invite' && u.referralsCount >= 1 && !u.tasks.inviteDone) {
      u.tasks.inviteDone = true; reward = 1000;
    } else if (taskId === 'story' && u.tasks.storyDone && !u.tasks.storyClaimed) {
      u.tasks.storyClaimed = true; reward = 500;
    } else if (taskId === 'stars' && u.starsSpent > 0 && !u.tasks.starsDone) {
      u.tasks.starsDone = true; reward = 2000;
    } else if (taskId === 'channel' && !u.tasks.channelClaimed) {
      const check = await tgApi(env.BOT_TOKEN, 'getChatMember', {
        chat_id: CHANNEL_USERNAME,
        user_id: tgUser.id
      }).catch(() => ({ ok: false }));
      if (check.ok && check.result && (check.result.status === 'left' || check.result.status === 'kicked')) {
        return json({ ok: false, error: `Сначала подпишитесь на ${CHANNEL_USERNAME}!` }, 400);
      }
      if (!check.ok && !u.tasks.channelDone) {
        return json({ ok: false, error: `Нажмите «Открыть» и подпишитесь на ${CHANNEL_USERNAME}!` }, 400);
      }
      u.tasks.channelDone = true;
      u.tasks.channelClaimed = true;
      reward = 1000;
    } else {
      return json({ ok: false, error: 'Задание ещё не выполнено или уже забрано' }, 400);
    }

    u.balance += reward;
    await saveUser(kv, u);
    return json({ ok: true, reward, ...serializeClientState(u, jackpot) });
  });
}

async function handleInvoice(request, env) {
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', env.BOT_TOKEN);
  if (!tgUser) return json({ ok: false, error: 'Unauthorized' }, 401);

  const pkgId = String(body.packageId || '');
  const pkg = STAR_PACKAGES[pkgId];
  if (!pkg) return json({ ok: false, error: 'Пакет не найден' }, 400);

  const tgRes = await tgApi(env.BOT_TOKEN, 'createInvoiceLink', {
    title: pkg.title,
    description: `Мгновенное пополнение +${pkg.coins} монет для Forest Fortune 5x5`,
    payload: JSON.stringify({ uid: String(tgUser.id), pkg: pkgId }),
    provider_token: '',
    currency: 'XTR',
    prices: [{ label: pkg.title, amount: pkg.stars }]
  });

  if (!tgRes.ok || !tgRes.result) {
    return json({ ok: false, error: tgRes.description || 'Ошибка создания счёта Stars' }, 502);
  }
  return json({ ok: true, invoiceLink: tgRes.result });
}

async function handleProfile(request, env, kv) {
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', env.BOT_TOKEN);
  if (!tgUser) return json({ ok: false, error: 'Unauthorized' }, 401);

  const uid = String(tgUser.id);
  return withUserLock(uid, async () => {
    const { user: u } = await loadUser(kv, uid);
    let dirty = false;
    if (body.action === 'connect_wallet') {
      const nextW = String(body.walletAddress || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
      if (u.walletBeta !== nextW) { u.walletBeta = nextW; dirty = true; }
    } else if (body.action === 'disconnect_wallet') {
      if (u.walletBeta !== '') { u.walletBeta = ''; dirty = true; }
    }
    if (dirty) await saveUser(kv, u);
    const jackpot = await getJackpot(kv);
    return json({ ok: true, ...serializeClientState(u, jackpot) });
  });
}

async function handleStats(request, env, kv) {
  const statsKey = await getStatsKey(env);
  const url = new URL(request.url);
  if (!statsKey || url.searchParams.get('key') !== statsKey) {
    return json({ error: 'Forbidden' }, 403);
  }

  const users = [];
  let cursor;
  do {
    const list = await kv.list({ prefix: 'u:', cursor, limit: 1000 });
    const batch = await Promise.all(list.keys.map((k) => kv.get(k.name, 'json')));
    for (const item of batch) {
      if (item && item.uid) users.push(item);
    }
    cursor = list.list_complete ? undefined : list.cursor;
  } while (cursor);

  const sortMode = url.searchParams.get('sort') === 'balance' ? 'balance' : 'spins';
  users.sort((a, b) => {
    if (sortMode === 'balance') {
      return ((b.balance || 0) - (a.balance || 0)) || (((b.tasks && b.tasks.spins) || 0) - ((a.tasks && a.tasks.spins) || 0));
    }
    return (((b.tasks && b.tasks.spins) || 0) - ((a.tasks && a.tasks.spins) || 0)) || ((b.balance || 0) - (a.balance || 0));
  });

  const jackpot = await getJackpot(kv);
  const today = todayUtc();
  let totalSpins = 0;
  let totalWins = 0;
  let totalBalance = 0;
  let totalStars = 0;
  let activeToday = 0;

  for (const u of users) {
    totalSpins += (u.tasks && u.tasks.spins) || 0;
    totalWins += (u.tasks && u.tasks.wins) || 0;
    totalBalance += Number(u.balance) || 0;
    totalStars += Number(u.starsSpent) || 0;
    if (u.lastWheelDate === today || u.lastDailyDate === today || u.lastShareBoostDate === today) activeToday++;
  }

  const fmt = (n) => Math.floor(Number(n) || 0).toLocaleString('ru-RU');
  const rows = users.map((u, i) => {
    const spins = (u.tasks && u.tasks.spins) || 0;
    const wins = (u.tasks && u.tasks.wins) || 0;
    const stickyCount = u.stickyWilds ? Object.keys(u.stickyWilds).length : 0;
    const uname = u.username ? `@${u.username}` : 'без @';
    const isActiveToday = u.lastWheelDate === today || u.lastDailyDate === today;
    return `
      <div class="card">
        <div class="row-top">
          <div>
            <div class="name">${i + 1}. ${escHtml(u.name || 'Player')} ${isActiveToday ? '<span class="dot">● сегодня</span>' : ''}</div>
            <div class="sub">${escHtml(uname)} · ID ${escHtml(u.uid)}</div>
          </div>
          <div class="bal">${fmt(u.balance)} 🪙</div>
        </div>
        <div class="grid">
          <div><span>Спины</span><b>${fmt(spins)}</b></div>
          <div><span>Победы</span><b>${fmt(wins)}</b></div>
          <div><span>Фриспины</span><b>${fmt(u.freeSpins)}</b></div>
          <div><span>Колесо</span><b>${fmt(u.wheelSpins)}</b></div>
          <div><span>Sticky</span><b>${stickyCount}</b></div>
          <div><span>Stars</span><b>${fmt(u.starsSpent)}</b></div>
          <div><span>Реф.</span><b>${fmt(u.referralsCount)}</b></div>
          <div><span>Ставка</span><b>${fmt(u.lastBet)}</b></div>
        </div>
      </div>`;
  }).join('');

  const baseUrl = `${url.origin}${url.pathname}?key=${encodeURIComponent(statsKey)}`;
  return htmlResp(`<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Forest Fortune — Статистика</title>
<style>
  body{margin:0;padding:16px 14px 40px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#07120b;color:#eef7f0}
  .wrap{max-width:720px;margin:0 auto}
  h1{font-size:20px;margin:0 0 12px;color:#ffd86b}
  .kpi{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:14px}
  .k{background:#0f2116;border:1px solid #21452d;border-radius:12px;padding:10px 12px}
  .k span{display:block;font-size:11px;color:#8cb89a;margin-bottom:2px}
  .k b{font-size:17px;color:#fff}
  .bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
  .btn{display:inline-block;padding:8px 12px;border-radius:10px;background:#163321;color:#ffd86b;text-decoration:none;font-size:13px;font-weight:600;border:1px solid #2a593a}
  .btn.act{background:#ffd86b;color:#08140c}
  .card{background:#0f2116;border:1px solid #21452d;border-radius:14px;padding:12px;margin-bottom:10px}
  .row-top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:10px}
  .name{font-weight:700;font-size:15px}
  .dot{font-size:11px;color:#5ee887;font-weight:600;margin-left:4px}
  .sub{font-size:12px;color:#8cb89a;margin-top:2px;word-break:break-all}
  .bal{font-weight:800;font-size:15px;color:#ffd86b;white-space:nowrap}
  .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
  .grid div{background:#0a1810;border-radius:8px;padding:6px 8px}
  .grid span{display:block;font-size:10px;color:#7fa88c}
  .grid b{font-size:13px;color:#f3faf5}
</style>
</head>
<body>
<div class="wrap">
  <h1>🌲 Forest Fortune — Статистика</h1>
  <div class="kpi">
    <div class="k"><span>Игроков всего / сегодня</span><b>${users.length} / ${activeToday}</b></div>
    <div class="k"><span>Всего спинов / побед</span><b>${fmt(totalSpins)} / ${fmt(totalWins)}</b></div>
    <div class="k"><span>Джекпот в банке</span><b>${fmt(jackpot)} 🪙</b></div>
    <div class="k"><span>Баланс всех / Stars</span><b>${fmt(totalBalance)} / ${fmt(totalStars)} ⭐</b></div>
  </div>
  <div class="bar">
    <a class="btn ${sortMode === 'spins' ? 'act' : ''}" href="${baseUrl}&sort=spins">По спинам</a>
    <a class="btn ${sortMode === 'balance' ? 'act' : ''}" href="${baseUrl}&sort=balance">По балансу</a>
    <a class="btn" href="${baseUrl}&sort=${sortMode}">🔄 Обновить</a>
  </div>
  ${rows || '<div class="card">Пока нет игроков</div>'}
</div>
</body>
</html>`);
}

async function handleSetup(request, env) {
  if (!env.BOT_TOKEN) return json({ ok: false, error: 'BOT_TOKEN missing' }, 500);
  const origin = (env.WEBAPP_URL || new URL(request.url).origin).replace(/\/$/, '');
  const webhookUrl = `${origin}/api/telegram-webhook`;
  const secretToken = await getWebhookSecret(env);
  const statsKey = await getStatsKey(env);
  const statsUrl = `${origin}/api/stats?key=${statsKey}`;

  const wh = await tgApi(env.BOT_TOKEN, 'setWebhook', {
    url: webhookUrl,
    secret_token: secretToken,
    allowed_updates: ['message', 'pre_checkout_query'],
    drop_pending_updates: false
  });
  const menu = await tgApi(env.BOT_TOKEN, 'setChatMenuButton', {
    menu_button: { type: 'web_app', text: '🎰 Играть', web_app: { url: origin } }
  });
  await tgApi(env.BOT_TOKEN, 'setMyCommands', {
    commands: [{ command: 'start', description: '🎰 Открыть Forest Fortune 5x5' }]
  });

  return json({ ok: Boolean(wh.ok && menu.ok), webhookUrl, statsUrl, wh, menu });
}

async function handleWebhook(request, env, kv) {
  if (env.BOT_TOKEN) {
    const expected = await getWebhookSecret(env);
    if (request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== expected) {
      return json({ error: 'Forbidden' }, 403);
    }
  }

  const upd = await request.json().catch(() => ({}));

  if (upd.pre_checkout_query) {
    const q = upd.pre_checkout_query;
    let valid = false;
    try {
      const p = JSON.parse(q.invoice_payload);
      const pkg = STAR_PACKAGES[p.pkg];
      valid = Boolean(pkg && q.currency === 'XTR' && q.total_amount === pkg.stars);
    } catch {}
    await tgApi(env.BOT_TOKEN, 'answerPreCheckoutQuery', {
      pre_checkout_query_id: q.id,
      ok: valid,
      ...(valid ? {} : { error_message: 'Некорректный пакет или сумма Stars.' })
    });
    return json({ ok: true });
  }

  const pay = upd.message && upd.message.successful_payment;
  if (pay && upd.message.chat) {
    try {
      const p = JSON.parse(pay.invoice_payload);
      const pkg = STAR_PACKAGES[p.pkg];
      const uid = String(p.uid || (upd.message.from && upd.message.from.id) || '');
      const chargeId = pay.telegram_payment_charge_id;
      const amountOk = pay.currency === 'XTR' && pay.total_amount === (pkg && pkg.stars);
      if (pkg && amountOk && uid && chargeId) {
        await withUserLock(uid, async () => {
          if (await kv.get(`pay:${chargeId}`)) return;
          await kv.put(`pay:${chargeId}`, uid);
          const { user: u } = await loadUser(kv, uid, upd.message.from && upd.message.from.first_name);
          u.balance += pkg.coins;
          u.starsSpent += pkg.stars;
          await saveUser(kv, u, true);
          await tgApi(env.BOT_TOKEN, 'sendMessage', {
            chat_id: upd.message.chat.id,
            text: `✅ Оплата Stars прошла! Начислено +${pkg.coins.toLocaleString('ru-RU')} 🪙`
          });
        });
      }
    } catch {}
    return json({ ok: true });
  }

  const msg = upd.message;
  if (msg && msg.chat && msg.text && /^\/start/i.test(msg.text.trim())) {
    const origin = (env.WEBAPP_URL || new URL(request.url).origin).replace(/\/$/, '');
    const parts = msg.text.trim().split(/\s+/);
    const param = parts[1] || '';
    const appUrl = param ? `${origin}?startapp=${encodeURIComponent(param)}` : origin;
    await tgApi(env.BOT_TOKEN, 'sendMessage', {
      chat_id: msg.chat.id,
      text: '🌲 Добро пожаловать в Forest Fortune 5x5 — Las Vegas Edition!\nКрути барабаны, лови каскады, фриспины за 3+ Гриба, Колесо Фортуны и Джекпот 🏆',
      reply_markup: {
        inline_keyboard: [[{ text: '🎰 Играть в Forest Fortune', web_app: { url: appUrl } }]]
      }
    });
  }

  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return json({ ok: true });
    const url = new URL(request.url);
    const kv = getKv(env);

    try {
      if (url.pathname === '/api/balance' && request.method === 'POST') return await handleBalance(request, env, kv);
      if (url.pathname === '/api/spin' && request.method === 'POST') return await handleSpin(request, env, kv);
      if (url.pathname === '/api/wheel' && request.method === 'POST') return await handleWheel(request, env, kv);
      if (url.pathname === '/api/risk' && request.method === 'POST') return await handleRisk(request, env, kv);
      if (url.pathname === '/api/daily-bonus' && request.method === 'POST') return await handleDailyBonus(request, env, kv);
      if (url.pathname === '/api/task-claim' && request.method === 'POST') return await handleTaskClaim(request, env, kv);
      if (url.pathname === '/api/invoice' && request.method === 'POST') return await handleInvoice(request, env);
      if (url.pathname === '/api/profile' && request.method === 'POST') return await handleProfile(request, env, kv);
      if (url.pathname === '/api/leaderboard' && request.method === 'GET') {
        return json(await getLeaderboard(kv));
      }
      if (url.pathname === '/api/stats' && request.method === 'GET') {
        return await handleStats(request, env, kv);
      }
      if (url.pathname === '/api/setup' && (request.method === 'GET' || request.method === 'POST')) {
        return await handleSetup(request, env);
      }
      if (url.pathname === '/api/telegram-webhook' && request.method === 'POST') {
        return await handleWebhook(request, env, kv);
      }
      if (url.pathname.startsWith('/api/')) return json({ error: 'Not Found' }, 404);
    } catch (err) {
      return json({ ok: false, error: err.message || 'Server error' }, 500);
    }

    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response('Forest Fortune Worker Active', { status: 200 });
  }
};
