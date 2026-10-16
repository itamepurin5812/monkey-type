'use strict';
// 表示用の標準ローマ字を、複数の綴りを持つ音の列へ分解する。
// 日本語の表示に漢字があっても、stories.js のローマ字から判定できる。
const ROMAJI_GROUPS = [
 ['shi','si'],['chi','ti'],['tsu','tu'],['fu','hu'],['ji','zi'],
 ['sha','sya'],['shu','syu'],['sho','syo'],['she','sye'],
 ['cha','tya','cya'],['chu','tyu','cyu'],['cho','tyo','cyo'],['che','tye','cye'],
 ['ja','jya','zya'],['ju','jyu','zyu'],['jo','jyo','zyo'],['je','jye','zye'],
 ['fa','fwa'],['fi','fyi'],['fe','fye'],['fo','fwo'],
 ['ka','ca'],['ku','cu','qu'],['ko','co'],
 ['la','xa'],['li','xi'],['lu','xu'],['le','xe'],['lo','xo'],
 ['lya','xya'],['lyu','xyu'],['lyo','xyo'],['ltu','xtu','ltsu','xtsu'],
 ['n','nn','xn']
];
const ROMAJI_OPTIONS = new Map();
for(const group of ROMAJI_GROUPS)for(const form of group)ROMAJI_OPTIONS.set(form,group);
const ROMAJI_KEYS = [...ROMAJI_OPTIONS.keys()].filter(k=>k!=='nn').sort((a,b)=>b.length-a.length);
function romajiTokens(text){
 const tokens=[];
 for(let i=0;i<text.length;){
  // 促音：sshi/ssi、cchi/tti なども同じ経路として受け付ける。
  if(text[i]===text[i+1]&&/[bcdfghjklmpqrstvwxyz]/.test(text[i])){
   const key=ROMAJI_KEYS.find(k=>text.startsWith(k,i+1))||text[i+1];
   const forms=ROMAJI_OPTIONS.get(key)||[key];
   tokens.push([...new Set([text[i]+key,...forms.map(f=>f[0]+f),...forms.flatMap(f=>['ltu','xtu','ltsu','xtsu'].map(s=>s+f))])]);i+=key.length+1;continue;
  }
  const key=ROMAJI_KEYS.find(k=>text.startsWith(k,i))||text[i];
  const forms=ROMAJI_OPTIONS.get(key)||[key];
  tokens.push([key,...forms.filter(f=>f!==key)]);i+=key.length;
 }
 return tokens;
}
class RomajiMatcher {
 constructor(parts){
  this.nodes=[];this.typed='';this.partEnds=[];
  const node=(completedParts=0)=>{const id=this.nodes.length;this.nodes.push({edges:[],completedParts});return id};
  this.start=node();let boundary=this.start;
  parts.forEach((part,partIndex)=>{
   for(const options of romajiTokens(part[1])){
    const end=node(partIndex);
    for(const option of options){let from=boundary;for(let i=0;i<option.length;i++){const to=i===option.length-1?end:node(partIndex);this.nodes[from].edges.push({key:option[i],to});from=to}}
    boundary=end;
   }
   this.nodes[boundary].completedParts=partIndex+1;
  });
  this.end=boundary;this.states=new Set([this.start]);
  // DAGの各ノードから、標準綴りを優先した残り文字列を記憶する。
  this.suffix=new Map([[this.end,'']]);
  const suffix=id=>{if(this.suffix.has(id))return this.suffix.get(id);const e=this.nodes[id].edges[0];const s=e.key+suffix(e.to);this.suffix.set(id,s);return s};
  for(let i=this.nodes.length-1;i>=0;i--)suffix(i);
 }
 feed(key){const next=new Set();for(const id of this.states)for(const edge of this.nodes[id].edges)if(edge.key===key)next.add(edge.to);if(!next.size)return false;this.states=next;this.typed+=key;while(this.partEnds.length<this.completedParts)this.partEnds.push(this.typed.length);return true}
 get done(){return this.states.has(this.end)}
 get remaining(){if(this.done)return '';return this.suffix.get(this.states.values().next().value)}
 get completedParts(){return Math.max(...[...this.states].map(id=>this.nodes[id].completedParts))}
}

// 入力済みの音をひらがなにする。まだ音にならない子音はローマ字で残す。
const KANA_FOR_ROMAJI = new Map();
for(const [row,kana] of [
 ['','あいうえお'],['k','かきくけこ'],['g','がぎぐげご'],['s','さしすせそ'],
 ['z','ざじずぜぞ'],['t','たちつてと'],['d','だぢづでど'],['n','なにぬねの'],
 ['h','はひふへほ'],['b','ばびぶべぼ'],['p','ぱぴぷぺぽ'],['m','まみむめも'],['r','らりるれろ']
]) [...'aiueo'].forEach((v,i)=>KANA_FOR_ROMAJI.set(row+v,[...kana][i]));
for(const [roman,kana] of Object.entries({ya:'や',yu:'ゆ',yo:'よ',wa:'わ',wi:'うぃ',we:'うぇ',wo:'を',shi:'し',chi:'ち',tsu:'つ',fu:'ふ',ji:'じ',sha:'しゃ',shu:'しゅ',sho:'しょ',she:'しぇ',cha:'ちゃ',chu:'ちゅ',cho:'ちょ',che:'ちぇ',ja:'じゃ',ju:'じゅ',jo:'じょ',je:'じぇ',fa:'ふぁ',fi:'ふぃ',fe:'ふぇ',fo:'ふぉ',la:'ぁ',li:'ぃ',lu:'ぅ',le:'ぇ',lo:'ぉ',lya:'ゃ',lyu:'ゅ',lyo:'ょ',ltu:'っ',xn:'ん'}))KANA_FOR_ROMAJI.set(roman,kana);
for(const [prefix,kana] of [['ky','き'],['gy','ぎ'],['ny','に'],['hy','ひ'],['by','び'],['py','ぴ'],['my','み'],['ry','り']])for(const [v,small] of [['a','ゃ'],['u','ゅ'],['o','ょ']])KANA_FOR_ROMAJI.set(prefix+v,kana+small);
for(const group of ROMAJI_GROUPS){const kana=group.map(f=>KANA_FOR_ROMAJI.get(f)).find(Boolean);if(kana)for(const form of group)KANA_FOR_ROMAJI.set(form,kana)}
KANA_FOR_ROMAJI.delete('n');KANA_FOR_ROMAJI.delete('nn');
const KANA_ROMAJI_KEYS=[...KANA_FOR_ROMAJI.keys()].sort((a,b)=>b.length-a.length);
function typedToHiragana(text){
 let output='';
 for(let i=0;i<text.length;){
  if(text[i]===text[i+1]&&/[bcdfghjklmpqrstvwxyz]/.test(text[i])){output+='っ';i++;continue}
  if(text[i]==='n'){
   if(text[i+1]==='n'){output+='ん';i+=text[i+2]&&/[aiueoy]/.test(text[i+2])?1:2;continue}
   if(text[i+1]&&!/[aiueoy]/.test(text[i+1])){output+='ん';i++;continue}
  }
  const key=KANA_ROMAJI_KEYS.find(k=>text.startsWith(k,i));
  if(key){output+=KANA_FOR_ROMAJI.get(key);i+=key.length}else{output+=text[i];i++}
 }
 return output;
}
