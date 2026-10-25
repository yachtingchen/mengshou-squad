/* Shared, deterministic rules. Also exported for Node verification. */
(function (root) {
  const monsters = [
    { name: '火尾球', emoji: '🦊', element: 'fire', symbol: '🔥', color: 'coral', note: '暖暖勇氣，準備出發！' },
    { name: '泡泡熊', emoji: '🐻‍❄️', element: 'water', symbol: '💧', color: 'blue', note: '深呼吸，想個好點子。' },
    { name: '芽芽鹿', emoji: '🦌', element: 'grass', symbol: '🌿', color: 'green', note: '小小一步，也會長大！' }
  ];
  const cards = {
    attack: { name: '小攻擊', emoji: '🐾', detail: '傷害 1', energy: '能量 +1', gain: 1 },
    shield: { name: '防護罩', emoji: '🛡️', detail: '抵擋 2', energy: '能量 +1', gain: 1 },
    charge: { name: '集氣', emoji: '✨', detail: '不攻擊、不防守', energy: '能量 +2', gain: 2 },
    special: { name: '超級絕招', emoji: '🌟', detail: '傷害 3', energy: '消耗 2 能量', gain: 0 },
    normal: { name: '普通攻擊', emoji: '🐾', damage: 2, gain: 0 },
    strong: { name: '強力攻擊', emoji: '💥', damage: 3, gain: 0 },
    defend: { name: '防守', emoji: '🛡️', damage: 0, gain: 0 },
    rest: { name: '休息', emoji: '💤', damage: 0, gain: 0 }
  };
  const available = energy => ['attack', 'shield', energy >= 2 ? 'special' : 'charge'];
  const advantage = (a, b) => ({ fire: 'grass', grass: 'water', water: 'fire' })[a] === b;
  function resolve(players, actions, elements) {
    const next = players.map(p => ({ ...p }));
    actions.forEach((a, i) => {
      if (!cards[a]) throw new Error('未知卡牌');
      if (a === 'special') { if (next[i].energy < 2) throw new Error('能量不足'); next[i].energy -= 2; }
    });
    const raw = actions.map((a, i) => a === 'attack' ? (elements && advantage(next[i].element, next[1-i].element) ? 2 : 1) : a === 'special' ? 3 : (cards[a].damage || 0));
    const damage = raw.map((d, i) => Math.max(0, d - (['shield', 'defend'].includes(actions[1-i]) ? 2 : 0)));
    next.forEach((p, i) => { p.hp = Math.max(0, p.hp - damage[1-i]); });
    next.forEach((p, i) => { p.energy = Math.min(3, p.energy + cards[actions[i]].gain); });
    const result = next.every(p => p.hp === 0) ? 'draw' : next[0].hp === 0 ? 1 : next[1].hp === 0 ? 0 : null;
    return { players: next, damage, raw, result };
  }
  function intent(level, round) {
    const patterns = [['normal','rest','defend','rest'], ['normal','defend','normal','rest'], ['normal','strong','rest','defend'], ['strong','normal','defend','rest'], ['normal','strong','defend','normal','rest'], ['strong','defend','normal','strong','rest'], ['strong','normal','strong','defend','rest'], ['strong','normal','defend','strong','rest','rest']];
    const pattern = patterns[level - 1]; return pattern[(round - 1) % pattern.length];
  }
  const api = { monsters, cards, available, advantage, resolve, intent };
  if (typeof module !== 'undefined') module.exports = api;
  else root.Game = api;
})(typeof window !== 'undefined' ? window : globalThis);
