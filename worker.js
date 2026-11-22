const MAX_BET_LIMIT = 10000;
const LINE_PRESETS = new Set([1, 3, 5, 9, 15, 21]);
const CHANNEL_USERNAME = '@iField_studio';

const SYMBOLS = [
  'gem.png','wild.png','mushroom.png','ufo.png','weed_cross.png','tech_face.png',
  'man.png','man2.png','hutor.png','firebird.png','rabbit.png','real_hedgehog.png',
  'bear.png','fox.png','deer.png','owl.png','squirrel.png','squirrel1.png',
  'raccoon.png','hedgehog.png','pinecone.png','acorn.png','leaf.png','coin.png'
];

const WEIGHTS = {
  'gem.png': 14, 'wild.png': 11, 'mushroom.png': 14, 'ufo.png': 6, 'weed_cross.png': 6,
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
  { type: 'jackpot', val: 50000, weight: 2 },
  { type: 'fs', val: 20, weight: 8 },
  { type: 'mult', val: 50, weight: 4 },
  { type: 'mult', val: 2, weight: 30 },
  { type: 'mult', val: 5, weight: 20 },
  { type: 'fs', val: 10, weight: 14 },
  { type: 'mult', val: 10, weight: 10 },
  { type: 'mult', val: 3, weight: 22 }
];

const STAR_PACKAGES = {
  p100: { coins: 1000, stars: 50, title: '1 000 Монет · Forest Fortune' },
  p500: { coins: 5000, stars: 200, title: '5 000 Монет · Forest Fortune' },
  p2000: { coins: 20000, stars: 650, title: '20 000 Монет · Выгода +30%' },
  p10000: { coins: 100000, stars: 2500, title: '100 000 Монет · Вегас VIP' },
  p10k_stars: { coins: 450000, stars: 10000, title: '450 000 Монет · Хайроллер VIP' },
  p100000: { coins: 5000000, stars: 100000, title: '5 000 000 Монет · Король Вегаса' }
};

const mem = {
  jackpot: null,
  jackpotSavedAt: 0,
  leaderboard: null,
  lbSavedAt: 0
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

function pickSymbol(boostWild = false) {
  let total = 0;
  for (const s of SYMBOLS) total += WEIGHTS[s] * (boostWild && (s === 'gem.png' || s === 'wild.png') ? 1.3 : 1);
  let r = cryptoRand() * total;
  for (const s of SYMBOLS) {
    r -= WEIGHTS[s] * (boostWild && (s === 'gem.png' || s === 'wild.png') ? 1.3 : 1);
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

async function getAdminKey(env) {
  if (env.ADMIN_KEY) return env.ADMIN_KEY;
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

async function getJackpot(kv) {
  if (mem.jackpot === null) {
    mem.jackpot = Number((await kv.get('meta:jackpot')) || 500000);
    mem.jackpotSavedAt = Date.now();
  }
  return mem.jackpot;
}

async function saveJackpot(kv, val, force = false) {
  mem.jackpot = val;
  const now = Date.now();
  if (force || now - mem.jackpotSavedAt >= 60000) {
    mem.jackpotSavedAt = now;
    await kv.put('meta:jackpot', String(val));
  }
}

async function getLeaderboard(kv) {
  if (!mem.leaderboard) {
    mem.leaderboard = (await kv.get('meta:leaderboard', 'json')) || [];
    mem.lbSavedAt = Date.now();
  }
  return mem.leaderboard;
}

function defaultUser(uid, name, username) {
  return {
    uid,
    name: name || `Player_${uid.slice(-4)}`,
    username: username || '',
    balance: 1000,
    lastWin: 0,
    lastBet: 10,
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
    lastSeenAt: new Date().toISOString(),
    tasks: {
      spins: 0, wins: 0, wheel: 0,
      spinsDone: false, winsDone: false, wheelDone: false,
      inviteDone: false, storyDone: false, storyClaimed: false,
      starsDone: false, channelDone: false, channelClaimed: false
    }
  };
}

async function loadUser(kv, uid, name, username) {
  const raw = await kv.get(`u:${uid}`, 'json');
  if (!raw) return { user: defaultUser(uid, name, username), isNew: true, profileChanged: true };
  const def = defaultUser(uid, name, username);
  const user = { ...def, ...raw, tasks: { ...def.tasks, ...(raw.tasks || {}) } };
  let profileChanged = false;
  if (name && raw.name !== name) { user.name = name; profileChanged = true; }
  if (username !== undefined && raw.username !== username) { user.username = username; profileChanged = true; }
  return { user, isNew: false, profileChanged };
}

async function saveUser(kv, u, forceLeaderboard = false) {
  u.lastSeenAt = new Date().toISOString();
  await kv.put(`u:${u.uid}`, JSON.stringify(u));

  const top = await getLeaderboard(kv);
  const idx = top.findIndex((x) => x.uid === u.uid);
  const entry = { uid: u.uid, name: u.name || 'Player', balance: u.balance };
  if (idx >= 0) top[idx] = entry;
  else top.push(entry);
  top.sort((a, b) => b.balance - a.balance);
  mem.leaderboard = top.slice(0, 25);

  const now = Date.now();
  if (forceLeaderboard || now - mem.lbSavedAt >= 60000) {
    mem.lbSavedAt = now;
    await kv.put('meta:leaderboard', JSON.stringify(mem.leaderboard));
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
    let wildX2 = 0;
    for (const s of lineSyms) {
      if (s === baseSym || s === 'gem.png' || s === 'wild.png') {
        count++;
        if (s === 'wild.png') wildX2++;
      } else break;
    }

    if (count >= 3) {
      const mult = (PAYTABLE[baseSym] || [2, 5, 20])[count - 3];
      const wMult = wildX2 > 0 ? Math.min(8, Math.pow(2, wildX2)) : 1;
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

function tumbleGrid(grid, winningCells, stickyWilds, boostWild) {
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
      else next[c][r] = pickSymbol(boostWild);
    }
  }
  return next;
}

async function handleBalance(request, env, kv) {
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', env.BOT_TOKEN);
  if (!tgUser) return json({ ok: false, error: 'Unauthorized' }, 401);

  const uid = String(tgUser.id);
  const name = tgUser.first_name || tgUser.username || `Player_${uid.slice(-4)}`;
  const { user: u, isNew, profileChanged } = await loadUser(kv, uid, name, tgUser.username || '');

  let dirty = isNew || profileChanged;
  const today = todayUtc();
  if (u.lastWheelDate !== today) {
    u.wheelSpins = Math.max(1, u.wheelSpins);
    u.lastWheelDate = today;
    dirty = true;
  }

  if (isNew && typeof body.startParam === 'string' && body.startParam.startsWith('ref_')) {
    const inviterId = body.startParam.slice(4).trim();
    if (inviterId && inviterId !== uid && !u.referredBy) {
      u.referredBy = inviterId;
      dirty = true;
      const inv = await kv.get(`u:${inviterId}`, 'json');
      if (inv) {
        inv.balance = (inv.balance || 0) + 5000;
        inv.referralsCount = (inv.referralsCount || 0) + 1;
        await saveUser(kv, inv, true);
      }
    }
  }

  if (dirty) await saveUser(kv, u, isNew);
  const jackpot = await getJackpot(kv);
  return json({ ok: true, ...serializeClientState(u, jackpot) });
}

async function handleSpin(request, env, kv) {
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', env.BOT_TOKEN);
  if (!tgUser) return json({ ok: false, error: 'Unauthorized' }, 401);

  const uid = String(tgUser.id);
  const { user: u } = await loadUser(kv, uid);

  const lines = LINE_PRESETS.has(Number(body.lines)) ? Number(body.lines) : 21;
  const bet = Math.max(1, Math.min(MAX_BET_LIMIT, Math.floor(Number(body.bet) || 1)));
  const isFreeSpin = u.freeSpins > 0;
  const cost = isFreeSpin ? 0 : lines * bet;

  if (!isFreeSpin && u.balance < cost) {
    return json({ ok: false, error: 'Недостаточно монет' }, 400);
  }

  let jackpot = await getJackpot(kv);
  if (isFreeSpin) {
    u.freeSpins -= 1;
  } else {
    u.balance -= cost;
    u.stickyWilds = {};
    jackpot += Math.max(1, Math.floor(cost * 0.015));
  }

  let grid = Array.from({ length: 5 }, (_, c) =>
    Array.from({ length: 5 }, (_, r) => u.stickyWilds[`${c}_${r}`] || pickSymbol(isFreeSpin))
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
    grid = tumbleGrid(grid, ev.winningCells, isFreeSpin ? u.stickyWilds : {}, isFreeSpin);
  }

  let jackpotWon = false;
  if (cost >= 20 && cryptoRand() < 0.00015) {
    jackpotWon = true;
    totalWin += jackpot;
    jackpot = 50000;
  }

  let scatterBonusSpin = false;
  let awardedFreeSpins = 0;
  if (scatterCount >= 3) {
    scatterBonusSpin = true;
    u.wheelSpins += 1;
    awardedFreeSpins = scatterCount === 3 ? 5 : (scatterCount === 4 ? 10 : 15);
    u.freeSpins += awardedFreeSpins;
  }

  if (u.freeSpins > 0) {
    for (let c = 0; c < 5; c++) {
      for (let r = 0; r < 5; r++) {
        if (grid[c][r] === 'gem.png' || grid[c][r] === 'wild.png') {
          u.stickyWilds[`${c}_${r}`] = grid[c][r];
        }
      }
    }
  } else {
    u.stickyWilds = {};
  }

  u.balance += totalWin;
  u.lastWin = totalWin;
  u.lastBet = lines * bet;
  u.risk = null;
  u.tasks.spins += 1;
  if (totalWin > 0) u.tasks.wins += 1;

  await saveJackpot(kv, jackpot, jackpotWon);
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
}

async function handleWheel(request, env, kv) {
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', env.BOT_TOKEN);
  if (!tgUser) return json({ ok: false, error: 'Unauthorized' }, 401);

  const { user: u } = await loadUser(kv, String(tgUser.id));
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
    u.freeSpins += prize.val;
  } else {
    const base = Math.max(50, u.lastBet || 100);
    winAmount = base * prize.val;
    u.balance += winAmount;
  }

  await saveUser(kv, u);
  const jackpot = await getJackpot(kv);
  return json({ ok: true, prizeIndex, winAmount, ...serializeClientState(u, jackpot) });
}

async function handleRisk(request, env, kv) {
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', env.BOT_TOKEN);
  if (!tgUser) return json({ ok: false, error: 'Unauthorized' }, 401);

  const { user: u } = await loadUser(kv, String(tgUser.id));
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
    const leftCard = randInt(2, 14);
    u.risk = { active: true, stake, leftCard };
    await saveUser(kv, u);
    return json({ ok: true, leftCard, stake });
  }

  if (body.action === 'guess') {
    if (!u.risk || !u.risk.active) return json({ ok: false, error: 'Риск-раунд не активен' }, 400);
    let rightCard = randInt(2, 14);
    while (rightCard === u.risk.leftCard) rightCard = randInt(2, 14);
    const won = body.choice === 'higher' ? rightCard > u.risk.leftCard : rightCard < u.risk.leftCard;
    if (won) {
      u.risk.stake *= 2;
      u.risk.leftCard = rightCard;
      await saveUser(kv, u);
      return json({ ok: true, won: true, rightCard, nextLeftCard: rightCard, stake: u.risk.stake });
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
}

async function handleDailyBonus(request, env, kv) {
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', env.BOT_TOKEN);
  if (!tgUser) return json({ ok: false, error: 'Unauthorized' }, 401);

  const { user: u } = await loadUser(kv, String(tgUser.id));
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
}

async function handleTaskClaim(request, env, kv) {
  const body = await request.json().catch(() => ({}));
  const tgUser = await verifyTelegramInitData(body.initData || '', env.BOT_TOKEN);
  if (!tgUser) return json({ ok: false, error: 'Unauthorized' }, 401);

  const { user: u } = await loadUser(kv, String(tgUser.id));
  const jackpot = await getJackpot(kv);
  const taskId = String(body.taskId || '');
  const action = body.action === 'mark' ? 'mark' : 'claim';

  if (action === 'mark') {
    if (taskId === 'story') u.tasks.storyDone = true;
    if (taskId === 'channel') u.tasks.channelDone = true;
    await saveUser(kv, u);
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

  const { user: u } = await loadUser(kv, String(tgUser.id));
  if (body.action === 'connect_wallet') {
    u.walletBeta = String(body.walletAddress || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  } else if (body.action === 'disconnect_wallet') {
    u.walletBeta = '';
  }
  await saveUser(kv, u);
  const jackpot = await getJackpot(kv);
  return json({ ok: true, ...serializeClientState(u, jackpot) });
}

async function handleSetup(request, env) {
  if (!env.BOT_TOKEN) return json({ ok: false, error: 'BOT_TOKEN missing' }, 500);
  const origin = (env.WEBAPP_URL || new URL(request.url).origin).replace(/\/$/, '');
  const webhookUrl = `${origin}/api/telegram-webhook`;
  const secretToken = await getWebhookSecret(env);
  const adminKey = await getAdminKey(env);

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

  return json({
    ok: Boolean(wh.ok && menu.ok),
    webhookUrl,
    statsUrl: `${origin}/api/stats?key=${adminKey}`,
    wh,
    menu
  });
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
      if (pkg && uid && chargeId && !(await kv.get(`pay:${chargeId}`))) {
        await kv.put(`pay:${chargeId}`, uid);
        const { user: u } = await loadUser(kv, uid, upd.message.from && upd.message.from.first_name);
        u.balance += pkg.coins;
        u.starsSpent += pkg.stars;
        await saveUser(kv, u, true);
        await tgApi(env.BOT_TOKEN, 'sendMessage', {
          chat_id: upd.message.chat.id,
          text: `✅ Оплата Stars прошла! Начислено +${pkg.coins.toLocaleString('ru-RU')} 🪙`
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

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function handleStats(env, kv, url) {
  const expected = await getAdminKey(env);
  if (!expected || url.searchParams.get('key') !== expected) {
    return json({ ok: false, error: 'Forbidden' }, 403);
  }

  const list = await kv.list({ prefix: 'u:', limit: 100 });
  const players = (await Promise.all(list.keys.map((k) => kv.get(k.name, 'json')))).filter(Boolean);
  players.sort((a, b) => (b.tasks?.spins || 0) - (a.tasks?.spins || 0));

  let totalSpins = 0;
  let totalStars = 0;
  for (const p of players) {
    totalSpins += p.tasks?.spins || 0;
    totalStars += p.starsSpent || 0;
  }
  const jackpot = await getJackpot(kv);

  const rows = players.map((p) => {
    const tag = p.username ? `@${esc(p.username)}` : '—';
    const seen = (p.lastSeenAt || p.lastWheelDate || '—').replace('T', ' ').slice(0, 16);
    const t = p.tasks || {};
    return `<tr>
      <td><b>${esc(p.name)}</b><br><span class="mut">${tag} · ${esc(p.uid)}</span></td>
      <td>${Number(p.balance || 0).toLocaleString('ru-RU')}</td>
      <td>${t.spins || 0} / ${t.wins || 0} / 🎡${t.wheel || 0}</td>
      <td>${p.starsSpent || 0}⭐ · FS:${p.freeSpins || 0}</td>
      <td>${esc(seen)}</td>
    </tr>`;
  }).join('');

  const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Forest Fortune · Статистика</title>
  <style>
    body{margin:0;padding:12px;background:#07140d;color:#eefaf1;font-family:-apple-system,system-ui,sans-serif;font-size:13px}
    h1{font-size:17px;margin:0 0 10px;color:#facc15}
    .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px}
    .card{background:#0d2217;border:1px solid #1f4b33;border-radius:10px;padding:9px}
    .lbl{font-size:11px;color:#8eb89d}.val{font-size:17px;font-weight:700;margin-top:2px}
    .wrap{overflow-x:auto;border-radius:10px}
    table{width:100%;border-collapse:collapse;background:#0d2217}
    th,td{padding:8px 6px;border-bottom:1px solid #183a27;text-align:left;vertical-align:top;font-size:12px}
    th{background:#112c1d;color:#facc15}
    .mut{color:#8eb89d;font-size:11px}
  </style></head><body>
  <h1>🎰 Forest Fortune · Игроки (${players.length})</h1>
  <div class="grid">
    <div class="card"><div class="lbl">Всего игроков</div><div class="val">${players.length}</div></div>
    <div class="card"><div class="lbl">Всего спинов</div><div class="val">${totalSpins.toLocaleString('ru-RU')}</div></div>
    <div class="card"><div class="lbl">Stars</div><div class="val">${totalStars} ⭐</div></div>
    <div class="card"><div class="lbl">Джекпот</div><div class="val">${jackpot.toLocaleString('ru-RU')}</div></div>
  </div>
  <div class="wrap"><table>
    <thead><tr><th>Игрок</th><th>Баланс</th><th>Спины/Победы/Колесо</th><th>Stars/FS</th><th>Активность</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="5">Пока пусто</td></tr>'}</tbody>
  </table></div></body></html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
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
        return await handleStats(env, kv, url);
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
