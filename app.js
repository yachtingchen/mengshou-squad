/* No imports/fetch/build step: opening index.html works directly. */
(() => {
  'use strict';
  const app = document.getElementById('app');
  const audioStatus = document.getElementById('audio-status');
  const sound = new ForestAudio(message => { audioStatus.textContent = message; });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let state = Game.create(1);
  let offered = Game.choices(state);
  let busy = false;
  let timers = [];
  let scene = 0;
  const speaker = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 8q5 4 0 8m3-11q8 7 0 14"/></svg>';
  const star = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1Z"/></svg>';
  const later = (callback, delay) => {
    const id = scene;
    timers.push(setTimeout(() => { if (id === scene) callback(); }, delay));
  };
  function cancelScene() {
    scene++;
    timers.forEach(clearTimeout); timers = [];
    sound.stop(); busy = false;
  }
  function stageNav() {
    return `<nav class="stage-nav" aria-label="選擇遊戲階段">${[1, 2].map(n => `<button data-action="stage" data-value="${n}" aria-current="${state.stage === n ? 'step' : 'false'}"><span class="stage-number">0${n}</span><span>第 ${n} 階段<b>${Game.stages[n].title}</b></span><span class="stage-check" aria-hidden="true">${state.stage === n ? '●' : '→'}</span></button>`).join('')}</nav>`;
  }
  function heading() {
    return `<section class="page-heading"><div><div class="eyebrow"><span class="tiny-spark">✦</span> A LITTLE MAGIC, A LITTLE ENGLISH</div><h1>小小魔法師，出發！</h1><p>聽聽怪物的名字，用字母魔法讓森林閃閃發光。</p></div><div class="adventure-seal"><span>Aa</span><small>每天一點小魔法</small></div></section>${stageNav()}`;
  }
  function progress() {
    return `<div class="progress"><span>打敗怪物 <b>${state.defeated}<small> / 5</small></b></span><div class="progress-stars" aria-hidden="true">${Game.monsters.map((_, i) => `<span class="${i < state.defeated ? 'earned' : ''}">${star}</span>`).join('')}</div></div>`;
  }
  function card(m, index) {
    return `<div class="card-wrap ${m.color}" style="--card-index:${index}"><button class="letter-card" data-action="choose" data-value="${m.letter}" aria-label="施放 ${m.letter} 字母魔法"><span class="card-corner" aria-hidden="true">✧</span><span class="card-kind">字母魔法</span><span class="letter-shapes" lang="en">${m.letter}<span>${m.lower}</span></span><span class="card-name">字母名 <span lang="en">/${m.nameIPA}/</span></span><span class="cast-label">施放魔法 <span aria-hidden="true">↗</span></span></button><button class="listen-card" data-action="hear-card" data-value="${m.letter}" aria-label="聽 ${m.letter} 的字母名和開頭音">${speaker}<span>聽字母</span></button></div>`;
  }
  function monsterFigure(m) {
    return `<div class="monster-slot ${m.color}"><button class="monster" data-action="hear-monster" aria-label="重聽單字怪物的名字與開頭音"><img src="assets/art/${m.word}.svg" alt="可愛的單字怪物" width="360" height="340" draggable="false"></button><button class="victory-letter" data-action="hear-reward" aria-label="重聽 ${m.letter} 字母魔法口訣" hidden><span class="victory-spark spark-one" aria-hidden="true">✦</span><span class="victory-shapes" lang="en" aria-hidden="true">${m.letter}<span>${m.lower}</span></span><span class="victory-spark spark-two" aria-hidden="true">✧</span><span class="victory-caption" aria-hidden="true">字母魔法</span></button></div>`;
  }
  function render(focus = false) {
    if (state.phase === 'complete') return complete();
    const m = Game.current(state);
    const rule = Game.stages[state.stage];
    app.innerHTML = `${heading()}<section class="battle-shell" aria-label="字母森林戰鬥"><div class="battle-bar"><div><span class="location-dot" aria-hidden="true"></span><h2>第 1 關：字母森林</h2><span class="round-label">第 ${state.index + 1} 隻</span></div>${progress()}</div><div class="arena"><div class="arena-caption"><span>FOREST OF LETTERS</span><span class="stage-badge">${rule.showWord ? '聽開頭音 · 選卡牌' : '仔細聽 · 找字母'}</span></div><div class="monster-zone"><div class="monster-bubble">${rule.showWord ? '聽聽我的名字！' : '你聽得出來嗎？'}</div>${monsterFigure(m)}<div class="magic-ring" aria-hidden="true"></div><div class="monster-name"><span>神祕單字怪物</span></div><button class="replay" data-action="hear-monster">${speaker} 再聽一次</button></div><div class="forest-note"><span aria-hidden="true">✧</span> 點怪物也可以重聽喔</div><div class="spell-projectile" aria-hidden="true">✦</div><div class="hit-burst" aria-hidden="true"></div></div><section class="spell-table"><div id="feedback" class="instruction" role="status" aria-live="polite"><h2>哪張字母卡，能施放魔法？</h2><p>${rule.showWord ? '聽單字的開頭音，再選一張字母卡！' : '先聽單字與開頭音，再點一下大卡牌！'}</p></div><div class="cards cards-${rule.cardCount}">${offered.map(card).join('')}</div><div id="learning" class="learning" hidden></div><p class="gentle-note"><span aria-hidden="true">♡</span> 選錯也沒關係，再聽一次就好。</p></section></section><div class="journey-note"><span class="note-icon" aria-hidden="true">✦</span><span><b>今天的小任務</b>認識 A、B、C、D、E，讓 5 隻單字怪物變成亮亮星光。</span><button class="text-button" data-action="restart">重新開始 ↻</button></div>`;
    if (focus) app.querySelector('.monster').focus({ preventScroll: true });
  }
  function start(stage) {
    cancelScene(); state = Game.create(stage); offered = Game.choices(state);
    render(true); sound.unlock();
    // 單字音訊照常播放，出題時只隱藏答案字幕。
    sound.monster(Game.current(state), false);
  }
  function choose(letter, target) {
    if (busy || state.phase !== 'question') return;
    const outcome = Game.answer(state, letter, offered.map(m => m.letter));
    if (outcome.result === 'ignored') return;
    sound.stop(); state = outcome.state;
    const feedback = document.getElementById('feedback');
    if (outcome.result === 'retry') {
      busy = true;
      sound.effect('retry'); target.classList.add('try-again');
      feedback.innerHTML = '<h2>差一點點，再聽聽看！</h2><p>魔法還在，慢慢選就好。點怪物可以再聽一次。</p>';
      feedback.classList.add('retry-message');
      later(() => { target.classList.remove('try-again'); busy = false; }, reducedMotion.matches ? 100 : 450);
      return;
    }
    busy = true;
    const m = Game.current(state);
    sound.effect('select');
    target.classList.add('casting');
    app.querySelectorAll('.letter-card, .listen-card').forEach(button => { button.disabled = true; });
    app.querySelector('.arena').classList.add('spell-active');
    feedback.classList.remove('retry-message');
    feedback.innerHTML = '<h2>字母魔法，出發！</h2><p>閃閃發光的咒語飛向怪物了！</p>';
    later(() => {
      sound.effect('hit');
      const monster = app.querySelector('.monster');
      monster.classList.add('defeated');
      monster.disabled = true;
      monster.setAttribute('aria-hidden', 'true');
    }, reducedMotion.matches ? 50 : 360);
    later(() => {
      app.querySelector('.monster-slot').classList.add('revealed');
      app.querySelector('.victory-letter').hidden = false;
      app.querySelector('.monster-bubble').textContent = '魔法成功！';
    }, reducedMotion.matches ? 80 : 940);
    later(() => {
      busy = false;
      app.querySelector('.battle-bar .progress').outerHTML = progress();
      app.querySelector('.monster-name').innerHTML = '<span>字母魔法成功！</span>';
      app.querySelector('.replay').dataset.action = 'hear-reward';
      app.querySelector('.forest-note').innerHTML = '<span aria-hidden="true">✧</span> 點字母也可以重聽口訣喔';
      feedback.innerHTML = `<h2>答對了！${m.letter} 的魔法好厲害！</h2><p>你讓單字怪物變成星光了！</p>`;
      const learning = document.getElementById('learning');
      learning.hidden = false;
      learning.innerHTML = `<div class="connection"><span><small>字母外形</small><b lang="en">${m.letter}${m.lower}</b></span><span><small>字母名</small><b lang="en">/${m.nameIPA}/</b></span><span><small>開頭音</small><b lang="en">/${m.soundIPA}/</b></span><span><small>單字</small><b lang="en">${m.word}</b></span></div><div class="learning-actions"><button class="quiet" data-action="hear-reward">${speaker} 聽聽魔法口訣</button><button class="primary" data-action="next">${state.defeated === 5 ? '看看冒險成果' : '下一隻怪物'} <span aria-hidden="true">→</span></button></div>`;
      app.querySelector('.cards').hidden = true;
      app.querySelector('[data-action="next"]').focus({ preventScroll: true });
      sound.reward(m);
    }, reducedMotion.matches ? 120 : 1140);
  }
  function complete() {
    const nextStage = state.stage === 1 ? 2 : 1;
    app.innerHTML = `${heading()}<section class="completion"><div class="completion-stars" aria-hidden="true">✦ <span>✦</span> ✦</div><div class="eyebrow">FOREST ADVENTURE COMPLETE</div><h2 tabindex="-1">你讓整座森林亮起來了！</h2><p>第 ${state.stage} 階段完成 · 5 / 5 隻怪物都變成星光了。</p><div class="friends" aria-hidden="true">${Game.monsters.map(m => `<img src="assets/art/${m.word}.svg" alt="" width="150" height="142">`).join('')}</div><p class="completion-word" lang="en">A a · B b · C c · D d · E e</p><div class="complete-actions"><button class="primary" data-action="stage" data-value="${nextStage}">${state.stage === 1 ? '挑戰第 2 階段：聽音辨字' : '回到第 1 階段：認識字母'} <span aria-hidden="true">→</span></button><button class="quiet" data-action="restart">再玩一次 ↻</button></div><p class="gentle-note">每一次聆聽，都長出一點點新魔法。</p></section>`;
    app.querySelector('.completion h2').focus({ preventScroll: true });
    sound.effect('win');
  }
  app.addEventListener('click', event => {
    const target = event.target.closest('[data-action]');
    if (!target || target.disabled) return;
    sound.unlock();
    const action = target.dataset.action;
    if (action === 'stage') start(Number(target.dataset.value));
    if (action === 'restart') start(state.stage);
    if (action === 'hear-card') sound.card(Game.monsters.find(m => m.letter === target.dataset.value));
    if (action === 'hear-monster' && !busy) sound.monster(Game.current(state), state.phase !== 'question');
    if (action === 'hear-reward' && !busy && state.phase === 'celebration') sound.reward(Game.current(state));
    if (action === 'choose') choose(target.dataset.value, target);
    if (action === 'next' && !busy && state.phase === 'celebration') {
      cancelScene(); state = Game.next(state);
      offered = Game.choices(state); render(true);
      if (state.phase !== 'complete') sound.monster(Game.current(state), false);
    }
  });
  document.getElementById('effects').addEventListener('click', event => {
    sound.unlock(); sound.effects = !sound.effects;
    event.currentTarget.setAttribute('aria-pressed', String(sound.effects));
    event.currentTarget.textContent = `音效：${sound.effects ? '開' : '關'}`;
    if (sound.effects) sound.effect('select');
  });
  document.getElementById('help').addEventListener('click', () => {
    sound.stop(); document.getElementById('rules').showModal();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) sound.stop(); });
  window.addEventListener('pagehide', () => sound.stop());
  render();
})();
