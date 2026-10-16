'use strict';
const settings = {
  easy: { title:'物語を打とう',rule:'有名な物語の冒頭部分を入力しよう。何回でもミスできるよ',pool:STORY_LIBRARY.standard },
  normal: { title:'偶然にまかせよう',rule:'有名な物語の冒頭部分を入力しよう。わからなかったら適当にカチャカチャしよう',pool:STORY_LIBRARY.standard },
  hard: { title:'一度きりの挑戦',rule:'有名な物語の冒頭部分を入力しよう。何の物語なのか、君にはミスせずに分かるかな？',pool:STORY_LIBRARY.standard }
};
const $ = id => document.getElementById(id);
let mode=document.body.dataset.mode || 'easy', position=0, points=0, active=false, started=0, timer=null, target='', segments=[], screen='game', currentStory=null, previousStory=null, celebrationTimer=null, hasPlayed=false, matcher=null, storyVisible=false;
function prepare(selectNew=false){
  clearTimeout(celebrationTimer);document.getElementById("celebration")?.remove();
  if(selectNew || !currentStory){
    const pool=settings[mode].pool;
    const choices=pool.length>1?pool.filter(story=>story!==previousStory):pool;
    currentStory=choices[Math.floor(Math.random()*choices.length)];
    previousStory=currentStory;
  }
  clearInterval(timer);active=false;storyVisible=false;position=0;points=0;
  segments=currentStory.parts;target=segments.map(s=>s[1]).join('');
  matcher=new RomajiMatcher(segments);
  if(mode!=='easy')matcher.feed(target[0]); // 最初の一文字は自動入力。
  position=matcher.typed.length;target=matcher.typed+matcher.remaining;
  $('rule').textContent=settings[mode].rule;$('label').textContent=({easy:'EASY',normal:'NORMAL',hard:'HELL'})[mode];
  $('state').textContent='準備完了';$('time').textContent='0.0 秒';
  $('message').textContent='スペースキーを押してスタート！';$('message').classList.add('start-guide');render();
}
function render(){
  if($('points'))$('points').textContent=points;$('bar').style.width=position/target.length*100+'%';
  const letters=$('letters');letters.replaceChildren();
  if(!storyVisible){$('story').textContent='';$('bar').style.width='0%';return;}
  if(mode==='easy'){
    // EASYは入力済みも含め、全文をローマ字で表示する。
    [...target].forEach((letter,i)=>{const span=document.createElement('span');span.textContent=letter;span.className=i<position?'done':i===position?'next':'';letters.append(span)});
  }else{
    // 推測モードは入力中の一節をひらがなにし、完成した一節を上へ移す。
    const partStart=matcher.partEnds[matcher.completedParts-1]||0;
    const entered=typedToHiragana(matcher.typed.slice(partStart));
    if(entered){const span=document.createElement('span');span.textContent=entered;span.className='done';letters.append(span)}
  }
  if(mode!=='easy'&&position<target.length){const dots=document.createElement('span');dots.className='hidden';dots.textContent=' …';letters.append(dots)}
  let count=0;
  $('story').textContent=mode!=='easy'?segments.filter((s,i)=>i<matcher.completedParts).map(s=>s[0]).join('、')||'':segments.map(s=>s[0]).join('、')+'。';
}
function finish(win){active=false;clearInterval(timer);$('state').textContent=win?'物語完成！':'ゲーム終了';$('message').textContent=win?(mode==='easy'?'完成！ '+points+'ポイント。スペースキーでもう一度。':'完成！ スペースキーでもう一度。'):'ミス！ ここまで '+position+' 文字。スペースキーで再挑戦。';$('message').classList.add('start-guide');if(win)celebrate();}
function startGame(){if(screen!=='game')return;prepare(hasPlayed);hasPlayed=true;active=true;storyVisible=true;render();started=performance.now();$('state').textContent='挑戦中';$('message').textContent=mode==='easy'?'金色の文字を入力しよう。':'最初の一文字の続きから、見えない文字を打ってみよう。';$('message').classList.remove('start-guide');document.activeElement?.blur();timer=setInterval(()=>{$('time').textContent=((performance.now()-started)/1000).toFixed(1)+' 秒'},100);if(position===target.length)finish(true)}
document.addEventListener('keydown',event=>{
  if(screen==='game'&&event.code==='Space'&&!event.isComposing&&!event.ctrlKey&&!event.metaKey&&!event.altKey){event.preventDefault();if(!event.repeat&&!active)startGame();return;}
  if(!active||event.ctrlKey||event.metaKey||event.altKey||event.repeat)return;
  if(event.isComposing||event.key==='Process'){ $('message').textContent='日本語入力をオフにして、半角英字で入力してください。';return; }
  if(event.key.length!==1||!/[a-z]/i.test(event.key))return;
  event.preventDefault();
  if(matcher.feed(event.key.toLowerCase())){position=matcher.typed.length;target=matcher.typed+matcher.remaining;points+=10;render();if(matcher.done)finish(true)}
  else if(mode==='hard'){finish(false)}
  else if(mode==='easy'){ $('message').textContent='もう一度。次は「'+target[position]+'」です。';$('letters').classList.remove('miss');void $('letters').offsetWidth;$('letters').classList.add('miss') }
});
prepare();

function celebrate(){
  const overlay=document.createElement('div');overlay.id='celebration';overlay.className='celebration';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','クリア結果');
  const card=document.createElement('div');card.className='clear-card';
  const icon=document.createElement('div');icon.className='clear-icon';icon.textContent='';
  const heading=document.createElement('h2');heading.textContent='クリア！';
  const title=document.createElement('p');title.textContent=currentStory.title;
  const score=document.createElement('p');score.className='clear-score';score.textContent=points+' POINTS';
  const time=document.createElement('p');time.textContent='クリアタイム '+((performance.now()-started)/1000).toFixed(1)+' 秒';
  const again=document.createElement('button');again.className='primary';again.textContent='スペースキーで次の文章へ';again.addEventListener('click',startGame);
  const home=document.createElement('a');home.href='index.html';home.className='clear-home';home.textContent='ホームへ戻る';
  card.append(icon,heading,title);if(mode==='easy')card.append(score);card.append(time,again,home);overlay.append(card);
  for(let i=0;i<42;i++){const bit=document.createElement('i');bit.className='confetti';bit.style.setProperty('--x',Math.random()*100+'vw');bit.style.setProperty('--delay',Math.random()*0.8+'s');bit.style.setProperty('--turn',Math.random()*720+'deg');bit.style.background=['#d9ad4a','#75935d','#f0a17c','#ece0af'][i%4];overlay.append(bit)}
  document.body.append(overlay);again.focus();
  celebrationTimer=setTimeout(()=>overlay.querySelectorAll('.confetti').forEach(bit=>bit.remove()),4500);
  overlay.addEventListener('keydown',event=>{if(event.key==='Tab'){event.preventDefault();(document.activeElement===again?home:again).focus()}});
}
