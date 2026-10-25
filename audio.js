/* Local human recordings: no speech service, network request or IPA-to-TTS guessing. */
(function (root) {
  'use strict';
  class ForestAudio {
    constructor(onStatus = () => {}) {
      this.player = new Audio();
      this.player.preload = 'auto';
      this.player.src = 'assets/audio/word-apple.mp3';
      this.onStatus = onStatus;
      this.generation = 0;
      this.effects = true;
      this.context = null;
    }
    stop() {
      this.generation++;
      this.player.pause();
      if (this.finishClip) this.finishClip(false);
      this.onStatus('');
    }
    unlock() {
      const Context = root.AudioContext || root.webkitAudioContext;
      if (!Context) return;
      try {
        if (!this.context) this.context = new Context();
        if (this.context.state === 'suspended') this.context.resume().catch(() => {});
      } catch (_) { /* Speech recordings still work without Web Audio. */ }
    }
    clip(file, generation) {
      return new Promise(resolve => {
        if (generation !== this.generation) return resolve(false);
        let finished = false;
        const finish = ok => {
          if (finished) return;
          finished = true;
          clearTimeout(timeout);
          this.player.onended = this.player.onerror = null;
          this.finishClip = null;
          if (!ok) this.player.pause();
          resolve(ok);
        };
        this.finishClip = finish;
        const timeout = setTimeout(() => finish(false), 8000);
        this.player.onended = () => finish(true);
        this.player.onerror = () => finish(false);
        this.player.src = `assets/audio/${file}.mp3`;
        this.player.play().catch(() => finish(false));
      });
    }
    async say(parts) {
      this.stop();
      const generation = this.generation;
      for (const part of parts) {
        if (generation !== this.generation) return;
        this.onStatus(part.label);
        const ok = await this.clip(part.file, generation);
        if (generation !== this.generation) return;
        if (!ok) {
          this.onStatus('聲音暫時無法播放，請開啟裝置聲音，再點一次重聽。');
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 160));
      }
      if (generation === this.generation) this.onStatus('');
    }
    monster(m, revealWord) {
      const word = { file: `word-${m.word}`, label: revealWord ? `聽單字：${m.word}` : '聽聽怪物的英文名字' };
      const sound = { file: `phoneme-${m.lower}`, label: '聽開頭音，再聽一次' };
      return this.say([word, sound, sound, word]);
    }
    card(m) {
      return this.say([{ file: `name-${m.lower}`, label: `字母名：${m.letter} /${m.nameIPA}/` },
        { file: `phoneme-${m.lower}`, label: `開頭音：/${m.soundIPA}/` }]);
    }
    reward(m) {
      return this.say([
        { file: `name-${m.lower}`, label: `字母名：${m.letter} /${m.nameIPA}/` },
        { file: `name-${m.lower}`, label: `${m.letter} 的字母魔法！` },
        { file: 'says', label: '在這個單字裡發出…' },
        { file: `phoneme-${m.lower}`, label: `開頭音：/${m.soundIPA}/` },
        { file: 'in', label: '在這個單字裡…' },
        { file: `word-${m.word}`, label: `單字：${m.word}` }
      ]);
    }
    effect(type) {
      if (!this.effects || !this.context || this.context.state !== 'running') return;
      const patterns = {
        select: [[523, 0, .12], [784, .08, .16]],
        retry: [[392, 0, .13], [330, .13, .17]],
        hit: [[659, 0, .16], [988, .1, .2], [1319, .2, .28]],
        win: [[523, 0, .2], [659, .14, .2], [784, .28, .2], [1047, .42, .45]]
      };
      const now = this.context.currentTime;
      (patterns[type] || patterns.select).forEach(([frequency, delay, duration]) => {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(.065, now + delay + .015);
        gain.gain.exponentialRampToValueAtTime(.001, now + delay + duration);
        oscillator.connect(gain); gain.connect(this.context.destination);
        oscillator.start(now + delay); oscillator.stop(now + delay + duration + .02);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      });
    }
  }
  root.ForestAudio = ForestAudio;
})(typeof window !== 'undefined' ? window : globalThis);
