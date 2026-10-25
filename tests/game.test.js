const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const G = require('../game.js');
function seeded(seed) {
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
}

test('A～E 清楚對應五個單字，字母名與自然發音分開', () => {
  assert.deepEqual(G.monsters.map(m => [m.letter, m.word, m.soundIPA]), [
    ['A', 'apple', 'æ'], ['B', 'ball', 'b'], ['C', 'cat', 'k'], ['D', 'dog', 'd'], ['E', 'egg', 'ɛ']
  ]);
  for (const m of G.monsters) {
    assert.equal(m.word[0], m.lower);
    assert.notEqual(m.nameIPA, m.soundIPA);
  }
});
test('階段 1 保留單字音訊旗標兩選一；階段 2 聽音辨字三選一', () => {
  assert.equal(G.stages[1].showWord, true);
  assert.equal(G.stages[2].showWord, false);
  for (const stage of [1, 2]) {
    for (let seed = 0; seed < 100; seed++) {
      const state = G.create(stage, seeded(seed));
      const cards = G.choices(state, seeded(seed));
      assert.equal(cards.length, stage === 1 ? 2 : 3);
      assert.equal(new Set(cards.map(m => m.letter)).size, cards.length);
      assert.equal(cards.filter(m => m.letter === G.current(state).letter).length, 1);
      assert.ok(cards.every(m => 'ABCDE'.includes(m.letter)));
    }
  }
});
test('聽音階段打亂順序，但每隻 A～E 怪物恰好出現一次', () => {
  assert.deepEqual(G.create(1).order, ['A', 'B', 'C', 'D', 'E']);
  const shuffled = G.create(2, seeded(21)).order;
  assert.notDeepEqual(shuffled, ['A', 'B', 'C', 'D', 'E']);
  assert.deepEqual([...shuffled].sort(), ['A', 'B', 'C', 'D', 'E']);
  assert.throws(() => G.create(3), RangeError);
});
test('每張字母卡依怪物開頭判定；選錯不扣血、不換怪、不減進度', () => {
  for (const stage of [1, 2]) {
    let state = G.create(stage);
    for (let round = 0; round < 5; round++) {
      const target = G.current(state);
      const cards = G.choices(state).map(m => m.letter);
      const wrong = cards.find(letter => letter !== target.letter);
      for (let attempt = 0; attempt < 12; attempt++) {
        const before = structuredClone(state);
        const result = G.answer(state, wrong, cards);
        assert.equal(result.result, 'retry');
        assert.deepEqual(state, before, '規則不可改寫傳入的狀態');
        state = result.state;
        assert.equal(G.current(state), target);
        assert.equal(state.index, round);
        assert.equal(state.defeated, round);
        assert.equal(state.phase, 'question');
        assert.equal('hp' in state, false);
      }
      state = G.next(G.answer(state, target.letter, cards).state);
    }
    assert.equal(state.phase, 'complete');
  }
});
test('正解只加一次進度；慶祝時連點、無效字母與桌面外卡牌都忽略', () => {
  const initial = G.create(1);
  for (const letter of ['Z', 'a', '', 'B']) {
    assert.equal(G.answer(initial, letter, ['A', 'C']).state, initial);
  }
  assert.equal(G.next(initial), initial, '不能跳過問題');
  const right = G.answer(initial, 'A', ['A', 'C']);
  assert.equal(right.result, 'correct');
  assert.equal(right.state.defeated, 1);
  assert.equal(right.state.phase, 'celebration');
  const repeated = G.answer(right.state, 'A', ['A', 'C']);
  assert.equal(repeated.result, 'ignored');
  assert.equal(repeated.state.defeated, 1);
});
test('兩階段可通關；保留答對說明，按下一隻才前進，重玩回到 0/5', () => {
  for (const stage of [1, 2]) {
    for (let seed = 0; seed < 20; seed++) {
      let state = G.create(stage, seeded(seed));
      const seen = [];
      for (let index = 0; index < 5; index++) {
        const m = G.current(state); seen.push(m.letter);
        const cards = G.choices(state, seeded(seed + index)).map(m => m.letter);
        state = G.answer(state, m.letter, cards).state;
        assert.equal(state.phase, 'celebration');
        assert.equal(G.current(state), m);
        assert.equal(state.defeated, index + 1);
        state = G.next(state);
      }
      assert.equal(state.phase, 'complete');
      assert.equal(state.defeated, 5);
      assert.equal(new Set(seen).size, 5);
      assert.equal(G.next(state), state);
      assert.equal(G.answer(state, 'A', ['A', 'B']).result, 'ignored');
      const restarted = G.create(stage);
      assert.equal(restarted.defeated, 0);
      assert.equal(restarted.index, 0);
      assert.equal(restarted.phase, 'question');
    }
  }
});

function audioHarness() {
  class AudioMock {
    constructor() { this.src = ''; this.played = []; }
    pause() {}
    play() { this.played.push(this.src); return Promise.resolve(); }
  }
  const messages = [];
  const context = vm.createContext({ Audio: AudioMock, setTimeout, clearTimeout });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../audio.js'), 'utf8'), context);
  return { audio: new context.ForestAudio(message => messages.push(message)), messages };
}
test('出場口訣播放單字、音素、音素、單字；第二階段字幕不洩漏單字', () => {
  const { audio } = audioHarness();
  audio.say = parts => parts;
  for (const m of G.monsters) {
    const parts = audio.monster(m, false);
    assert.deepEqual(Array.from(parts, p => p.file), [`word-${m.word}`, `phoneme-${m.lower}`, `phoneme-${m.lower}`, `word-${m.word}`]);
    assert.ok(parts.every(p => !p.label.includes(m.word)));
    const card = audio.card(m);
    assert.deepEqual(Array.from(card, p => p.file), [`name-${m.lower}`, `phoneme-${m.lower}`]);
    assert.match(card[0].label, /字母名/);
    assert.match(card[1].label, /開頭音/);
  }
});
test('答對口訣使用獨立字母名與音素音檔，完整說出 A! A says /æ/ in apple', () => {
  const { audio } = audioHarness(); audio.say = parts => parts;
  assert.deepEqual(Array.from(audio.reward(G.monsters[0]), p => p.file), ['name-a', 'name-a', 'says', 'phoneme-a', 'in', 'word-apple']);
});
test('重新播放／切換關卡可中止舊口訣，不讓舊音訊接著播放', async () => {
  const { audio, messages } = audioHarness();
  const old = audio.monster(G.monsters[0], true);
  assert.match(audio.player.src, /word-apple/);
  const fresh = audio.card(G.monsters[1]);
  assert.match(audio.player.src, /name-b/);
  audio.stop();
  await Promise.all([old, fresh]);
  assert.equal(audio.player.played.length, 2);
  assert.equal(messages.at(-1), '');
});
test('音訊載入失敗可回報並讓使用者重試，不會卡死', async () => {
  const { audio, messages } = audioHarness();
  const speaking = audio.monster(G.monsters[0], true);
  audio.player.onerror();
  await speaking;
  assert.match(messages.at(-1), /聲音暫時無法播放/);
  const retry = audio.card(G.monsters[0]);
  assert.match(audio.player.src, /name-a/);
  audio.stop(); await retry;
});
test('所有教學音檔與原創插畫隨 repo 提供，包含不同的字母名及音素', () => {
  const root = path.join(__dirname, '..');
  for (const m of G.monsters) {
    for (const name of [`word-${m.word}`, `name-${m.lower}`, `phoneme-${m.lower}`]) {
      const data = fs.readFileSync(path.join(root, 'assets/audio', name + '.mp3'));
      assert.ok(data.length > 1000);
      assert.equal(data.toString('ascii', 0, 3), 'ID3');
    }
    assert.notDeepEqual(fs.readFileSync(path.join(root, 'assets/audio', `name-${m.lower}.mp3`)), fs.readFileSync(path.join(root, 'assets/audio', `phoneme-${m.lower}.mp3`)));
    assert.match(fs.readFileSync(path.join(root, 'assets/art', m.word + '.svg'), 'utf8'), /<svg/);
  }
  for (const file of ['in', 'says']) assert.ok(fs.existsSync(path.join(root, `assets/audio/${file}.mp3`)));
});
