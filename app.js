const { monsters, cards, available, advantage, resolve, intent } = Game;
const app = document.getElementById('app');
let mode = 'family', picks = [0, 1], publicIntent = true, elements = false, level = 1, state;
const button = (text, action, cls = '') => `<button class="${cls}" data-action="${action}">${text}</button>`;
document.getElementById('help').onclick = () => document.getElementById('rules').showModal();
app.addEventListener('click', event => {
  const target = event.target.closest('[data-action]'); if (!target) return;
  const [action, value, extra] = target.dataset.action.split(':');
  if (action === 'mode') { mode = value; home(); }
  if (action === 'pick') { picks[Number(value)] = Number(extra); home(); }
  if (action === 'start') { level = 1; start(); }
  if (action === 'choose') choose(value);
  if (action === 'next') { state.round++; state.phase = 'parent'; state.actions = []; battle(); }
  if (action === 'home') home();
  if (action === 'retry') start();
  if (action === 'level') { level++; start(); }
});
app.addEventListener('change', event => {
  if (event.target.id === 'public') publicIntent = event.target.checked;
  if (event.target.id === 'elements') elements = event.target.checked;
});
function picker(index, label) {
  return `<section class="picker"><h3>${label}</h3><div class="monster-options">${monsters.map((m, n) => `<button class="monster-option ${m.color} ${picks[index] === n ? 'selected' : ''}" data-action="pick:${index}:${n}" aria-pressed="${picks[index] === n}"><span class="monster-emoji">${m.emoji}</span><b>${m.name}</b><small>${m.symbol} ${picks[index] === n ? '已選擇 ✓' : '選我'}</small></button>`).join('')}</div></section>`;
}
function home() {
  state = null;
  app.innerHTML = `<section class="intro"><div class="eyebrow">THE LITTLE THINKERS CLUB</div><h1>小小萌獸，<br>大大的好點子<span> ✦</span></h1><p>出一張牌，想一想。和你的隊友來場智慧對決！</p><div class="hero-friends">🦊 <span>✦</span> 🐻‍❄️ <span>✦</span> 🦌</div></section><section class="setup"><div class="section-title"><span class="step">1</span><h2>今天和誰一起玩？</h2></div><div class="mode-options">${button('👨‍👧 親子對戰 <small>同一台裝置，輪流出牌</small>', 'mode:family', mode === 'family' ? 'active' : '')}${button('🤖 對戰電腦 <small>觀察意圖，挑戰八關</small>', 'mode:computer', mode === 'computer' ? 'active' : '')}</div><div class="section-title"><span class="step">2</span><h2>選你的萌獸夥伴</h2></div><div class="pickers">${picker(0, mode === 'family' ? '👋 家長的夥伴' : '👋 你的夥伴')}${mode === 'family' ? picker(1, '🌼 孩子的夥伴') : '<div class="computer-note">🤖<h3>森林闖關之旅</h3><p>八個關卡，從簡單開始。<br>電腦會先告訴你想做什麼！</p></div>'}</div><div class="settings">${mode === 'family' ? `<label><input id="public" type="checkbox" ${publicIntent ? 'checked' : ''}> 👀 公開意圖 <small>讓孩子先看看家長的選擇</small></label><label><input id="elements" type="checkbox" ${elements ? 'checked' : ''}> 🌈 屬性相剋 <small>火 → 草 → 水 → 火</small></label>` : '<p>🌈 第 5 關起加入屬性相剋：火 → 草 → 水 → 火</p>'}</div>${button('一起出發！ <span>→</span>', 'start', 'primary start')}<p class="hint">♡ 輸贏都沒關係，每一場都有新發現。</p></section>`;
}
function start() {
  const opponent = mode === 'family' ? picks[1] : (level - 1) % 3;
  state = { round: 1, phase: 'parent', actions: [], players: [picks[0], opponent].map(n => ({ ...monsters[n], hp: 6, energy: 0 })), outcome: null, result: null };
  battle();
}
function names() { return mode === 'family' ? ['家長', '孩子'] : ['你', '電腦']; }
function elementOn() { return mode === 'family' ? elements : level >= 5; }
function fighter(p, i) {
  return `<section class="fighter ${p.color} ${p.hp === 0 ? 'fainted' : ''}"><div class="fighter-top"><span>${names()[i]}的夥伴</span><b>${p.symbol} ${p.name}</b></div><div class="avatar">${p.emoji}</div><div class="health" aria-label="生命 ${p.hp} / 6">${Array.from({length: 6}, (_, n) => `<span class="${n < p.hp ? '' : 'empty'}">♥</span>`).join('')}<b>${p.hp}/6</b></div><div class="energy" aria-label="能量 ${p.energy} / 3">${Array.from({length: 3}, (_, n) => `<span class="${n < p.energy ? 'filled' : ''}">⚡</span>`).join('')}<small>能量 ${p.energy}/3</small></div>${elementOn() && advantage(p.element, state.players[1-i].element) ? '<div class="advantage">屬性優勢 · 小攻擊 2 點</div>' : ''}</section>`;
}
function battle() {
  const done = state.phase === 'reveal';
  const active = mode === 'family' && state.phase === 'child' ? 1 : 0;
  const ai = mode === 'computer' ? intent(level, state.round) : null;
  let announcement = mode === 'computer' ? `🤖 電腦預告：${cards[ai].emoji} ${cards[ai].name}${cards[ai].damage ? ' · 傷害 ' + cards[ai].damage : ai === 'defend' ? ' · 抵擋 2' : ' · 不攻不防'}` : state.phase === 'child' ? publicIntent ? `👀 家長的意圖：${cards[state.actions[0]].emoji} ${cards[state.actions[0]].name}` : '🙈 家長已選好！選擇先保密。' : '👋 家長先選一張牌，再交給孩子';
  app.innerHTML = `<div class="battle-heading"><div><div class="eyebrow">${mode === 'family' ? 'FAMILY BATTLE · 親子對戰' : `FOREST ADVENTURE · 第 ${level} / 8 關`}</div><h1>第 ${state.round} 回合 <span class="round-leaf">🌿</span></h1></div>${button('⌂ 回到首頁', 'home', 'quiet')}</div><div class="arena">${fighter(state.players[0], 0)}<div class="versus">VS<small>${elementOn() ? '🌈 屬性開啟' : '公平出發'}</small></div>${fighter(state.players[1], 1)}</div>${done ? reveal() : `<div class="intent" role="status">${announcement}</div><section class="action-area"><h2>${mode === 'family' ? active === 0 ? '👋 家長，輪到你囉！' : '🌼 請把裝置交給孩子，輪到你囉！' : '💡 看看意圖，你想怎麼做？'}</h2><p>點一張就選好 · 不用急，慢慢想</p><div class="cards">${available(state.players[active].energy).map(key => `<button class="card ${key}" data-action="choose:${key}"><span class="card-icon">${cards[key].emoji}</span><h3>${cards[key].name}</h3><b>${key === 'attack' && elementOn() && advantage(state.players[active].element, state.players[1-active].element) ? '傷害 2 · 屬性優勢' : cards[key].detail}</b><small>${cards[key].energy}</small><span class="card-select">選這張 →</span></button>`).join('')}</div></section>`}`;
}
function choose(key) {
  if (!state || state.phase === 'reveal') return;
  const active = state.phase === 'child' ? 1 : 0;
  if (!available(state.players[active].energy).includes(key)) return;
  if (mode === 'family' && active === 0) { state.actions[0] = key; state.phase = 'child'; battle(); return; }
  if (mode === 'family') state.actions[1] = key;
  else state.actions = [key, intent(level, state.round)];
  state.outcome = resolve(state.players, state.actions, elementOn());
  state.players = state.outcome.players; state.result = state.outcome.result; state.phase = 'reveal'; battle();
}
function reveal() {
  const result = state.result;
  const title = result === null ? '一起揭曉！' : result === 'draw' ? '🤝 平手！兩位都好棒' : mode === 'family' ? `🎉 ${names()[result]}獲勝！` : result === 0 ? level === 8 ? '🏆 八關完成！智慧小達人！' : '🎉 挑戰成功！' : '🌱 再想一個好點子！';
  return `<section class="reveal" aria-live="polite"><h2>${title}</h2><div class="reveal-cards">${state.actions.map((a, i) => `<div><span>${cards[a].emoji}</span><b>${names()[i]}：${cards[a].name}</b><small>受到 ${state.outcome.damage[1-i]} 點傷害 · 生命 ${state.players[i].hp} · 能量 ${state.players[i].energy}</small></div>`).join('')}</div><p>${result === null ? '護盾已消失。看看現在的能量，再想想下一步！' : '謝謝你的好點子！每一次選擇，都是一次練習。'}</p><div class="result-buttons">${result === null ? button('下一回合 →', 'next', 'primary') : `${mode === 'computer' && result === 0 && level < 8 ? button('下一關 →', 'level', 'primary') : ''}${button('🔄 再玩一次', 'retry', 'primary')}${button('換個夥伴', 'home', 'quiet')}`}</div><details><summary>看看結算順序</summary><p>① 扣除絕招能量 → ② 計算傷害與屬性 → ③ 護盾抵擋最多 2 → ④ 同時扣生命 → ⑤ 增加能量，上限 3 → ⑥ 判斷勝負</p></details></section>`;
}
home();
