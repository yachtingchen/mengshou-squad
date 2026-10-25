/* Pure game rules; classic script for file:// and CommonJS for Node verification. */
(function (root) {
  'use strict';
  const monsters = Object.freeze([
    { letter: 'A', lower: 'a', word: 'apple', nameIPA: 'eɪ', soundIPA: 'æ', color: 'coral' },
    { letter: 'B', lower: 'b', word: 'ball', nameIPA: 'biː', soundIPA: 'b', color: 'blue' },
    { letter: 'C', lower: 'c', word: 'cat', nameIPA: 'siː', soundIPA: 'k', color: 'gold' },
    { letter: 'D', lower: 'd', word: 'dog', nameIPA: 'diː', soundIPA: 'd', color: 'peach' },
    { letter: 'E', lower: 'e', word: 'egg', nameIPA: 'iː', soundIPA: 'ɛ', color: 'sage' }
  ].map(Object.freeze));
  const stages = Object.freeze({
    1: Object.freeze({ title: '認識字母', cardCount: 2, showWord: true }),
    2: Object.freeze({ title: '聽音辨字', cardCount: 3, showWord: false })
  });
  function shuffle(items, random = Math.random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1))));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function create(stage = 1, random = Math.random) {
    if (!stages[stage]) throw new RangeError('階段必須為 1 或 2');
    const order = monsters.map(m => m.letter);
    return { stage: Number(stage), order: Number(stage) === 2 ? shuffle(order, random) : order,
      index: 0, defeated: 0, attempts: 0, phase: 'question' };
  }
  function current(state) { return monsters.find(m => m.letter === state.order[state.index]) || null; }
  function choices(state, random = Math.random) {
    if (state.phase !== 'question') return [];
    const target = current(state);
    const others = shuffle(monsters.filter(m => m.letter !== target.letter), random);
    return shuffle([target, ...others.slice(0, stages[state.stage].cardCount - 1)], random);
  }
  function answer(state, letter, offered) {
    // Ignore queued clicks, invalid input and cards not actually on the table.
    if (state.phase !== 'question' || !current(state) || !offered.includes(letter)) {
      return { state, result: 'ignored' };
    }
    const correct = letter === current(state).letter;
    return { state: { ...state, attempts: state.attempts + 1,
      defeated: state.defeated + (correct ? 1 : 0), phase: correct ? 'celebration' : 'question' },
    result: correct ? 'correct' : 'retry' };
  }
  function next(state) {
    if (state.phase !== 'celebration') return state;
    if (state.defeated === monsters.length) return { ...state, phase: 'complete' };
    return { ...state, index: state.index + 1, phase: 'question' };
  }
  const api = { monsters, stages, shuffle, create, current, choices, answer, next };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Game = api;
})(typeof window !== 'undefined' ? window : globalThis);
