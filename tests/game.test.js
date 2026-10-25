const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../game.js');
const pair = (a = {}, b = {}) => [{hp:6,energy:0,element:'fire',...a},{hp:6,energy:0,element:'grass',...b}];
test('只提供三張牌，能量 2 時替換第三張', () => {
  assert.deepEqual(G.available(0), ['attack','shield','charge']);
  assert.deepEqual(G.available(2), ['attack','shield','special']);
});
test('絕招先花費能量，盾抵擋 2，隨後增加能量', () => {
  const r = G.resolve(pair({energy:3},{energy:3}), ['special','shield'], false);
  assert.deepEqual(r.players.map(p=>[p.hp,p.energy]), [[6,1],[5,3]]);
  assert.throws(()=>G.resolve(pair(),['special','attack'],false));
});
test('屬性僅強化有優勢的小攻擊，不削弱對方或強化絕招', () => {
  for (const [a,b] of [['fire','grass'],['grass','water'],['water','fire']]) {
    const r=G.resolve(pair({element:a},{element:b}),['attack','attack'],true);
    assert.deepEqual(r.damage,[2,1]);
  }
  assert.deepEqual(G.resolve(pair(),['attack','attack'],false).damage,[1,1]);
  assert.equal(G.resolve(pair({energy:2}),['special','charge'],true).damage[0],3);
});
test('同時死亡平手，集氣能量有上限，護盾不延續', () => {
  assert.equal(G.resolve(pair({hp:1},{hp:1}),['attack','attack'],false).result,'draw');
  const first=G.resolve(pair({energy:1}),['charge','shield'],false);
  assert.equal(first.players[0].energy,3);
  const second=G.resolve(first.players,['attack','charge'],false);
  assert.equal(second.players[1].hp,5);
});
test('親子完整六回合可分出勝負', () => {
  let players=pair(), result;
  for(let round=1;round<=6;round++) {
    const r=G.resolve(players,['attack','charge'],false);
    players=r.players; result=r.result;
    assert.equal(result,round===6?0:null);
  }
  assert.equal(players[0].hp,6); assert.equal(players[1].hp,0);
});
test('電腦八關可透過固定策略通關，所有預告皆合法', () => {
  for(let level=1;level<=8;level++) {
    let players=pair(), result=null;
    for(let round=1;round<200 && result===null;round++) {
      const ai=G.intent(level,round);
      assert.ok(['normal','strong','defend','rest'].includes(ai));
      const card=['normal','strong'].includes(ai)?'shield':players[0].energy>=2?'special':'attack';
      const r=G.resolve(players,[card,ai],level>=5);players=r.players;result=r.result;
    }
    assert.equal(result,0,`第 ${level} 關應可獲勝`);
  }
});
test('實際介面操作：家長→孩子→揭曉→下一回合，直到獲勝並重玩', () => {
  const vm=require('node:vm');
  const fs=require('node:fs');
  const handlers={};
  const app={innerHTML:'',addEventListener:(type,fn)=>handlers[type]=fn};
  const context=vm.createContext({Game:G,document:{getElementById:id=>id==='app'?app:{showModal(){}}}});
  vm.runInContext(fs.readFileSync(require.resolve('../app.js'),'utf8'),context);
  const click=action=>handlers.click({target:{closest:()=>({dataset:{action}})}});
  assert.match(app.innerHTML,/公開意圖/);
  click('start');
  click('retry');
  for(let round=1;round<=6;round++){
    click('choose:attack');
    // Child uses attack after charging, so energy remains legal and parent wins.
    click(round===1?'choose:charge':'choose:attack');
    assert.match(app.innerHTML,/受到/);
    if(round<6)click('next');
  }
  assert.match(app.innerHTML,/家長獲勝/);
  click('retry');
  assert.match(app.innerHTML,/第 1 回合/);
  click('home');
  handlers.change({target:{id:'public',checked:false}});
  click('start');click('choose:shield');
  assert.match(app.innerHTML,/選擇先保密/);
  assert.doesNotMatch(app.innerHTML,/家長的意圖/);
});
