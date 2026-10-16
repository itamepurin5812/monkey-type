'use strict';
(() => {
 const title=document.querySelector('#monkey-title .title-letters');
 const scene=document.querySelector('.monkey-scene');
 if(!title||!scene)return;
 const finalText=title.textContent;
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 if(motion.matches)return;
 const glyphs='abcdefghijklmnopqrstuvwxyzあいうえおかきくけこさしすせそ';
 const chars=[...finalText].map(char=>{const span=document.createElement('span');span.textContent=char;return {span,char}});
 title.replaceChildren(...chars.map(item=>item.span));
 const stream=scene.querySelector('.random-stream');
 const HOLD_MS=3000;
 let timer=null,holdTimer=null,start=0;
 function showCompleted(){chars.forEach(({span,char})=>{span.textContent=char;span.classList.add('resolved')});scene.classList.remove('is-typing');stream.replaceChildren();}
 function stop(){clearInterval(timer);clearTimeout(holdTimer);timer=null;holdTimer=null;showCompleted();}
 function hold(){clearInterval(timer);timer=null;showCompleted();holdTimer=setTimeout(begin,HOLD_MS);}
 function tick(){
  if(motion.matches||document.hidden){stop();return;}
  const elapsed=performance.now()-start;
  const settled=Math.floor(Math.max(0,elapsed-650)/290);
  if(settled>=chars.length){hold();return;}
  chars.forEach(({span,char},index)=>{const fixed=index<settled;span.textContent=fixed?char:glyphs[Math.floor(Math.random()*glyphs.length)];span.classList.toggle('resolved',fixed)});
  if(stream.children.length<7){const letter=document.createElement('span');letter.className='floating-letter';letter.textContent=glyphs[Math.floor(Math.random()*26)];letter.style.setProperty('--drift',(Math.random()*160-80)+'px');letter.style.setProperty('--tilt',(Math.random()*50-25)+'deg');letter.addEventListener('animationend',()=>letter.remove(),{once:true});stream.appendChild(letter);}
 }
 function begin(){
  clearInterval(timer);clearTimeout(holdTimer);holdTimer=null;
  if(motion.matches||document.hidden){stop();return;}
  start=performance.now();scene.classList.add('is-typing');timer=setInterval(tick,95);tick();
 }
 begin();
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else begin()});
 motion.addEventListener('change',()=>{if(motion.matches)stop();else begin()});
 window.addEventListener('pagehide',stop);
 window.addEventListener('pageshow',event=>{if(event.persisted)begin()});
})();
