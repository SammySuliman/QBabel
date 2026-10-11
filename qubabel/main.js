import { QuantumCircuit } from 'qiskit';
import {probabilities,radians,updateBasis,sample,entropy} from './semantic.js';
const $=id=>document.getElementById(id);
let a={theta:0,delta:0},b={theta:radians(45),delta:0},turn=0,submitted=false;
const pct=x=>(100*x).toFixed(1)+'%';
const settings=()=>({gamma:radians(Number($('coupling').value)),phase:radians(Number($('phase').value))});
function render(){
  const {gamma,phase}=settings(),p=probabilities(gamma,phase,a,b);
  $('av').textContent=`${(a.theta*180/Math.PI).toFixed(1)}° / phase ${(a.delta*180/Math.PI).toFixed(1)}°`;
  $('bv').textContent=`${(b.theta*180/Math.PI).toFixed(1)}° / phase ${(b.delta*180/Math.PI).toFixed(1)}°`;
  $('cv').textContent=$('coupling').value+'°';
  $('entropy').textContent=`Entanglement entropy: ${entropy(gamma).toFixed(3)} bits · ${gamma===0?'separable pair':'entangled pair'}`;
  const labels=['Warm / Warm','Guarded / Warm','Warm / Guarded','Guarded / Guarded'];
  $('bars').replaceChildren(...p.map((v,i)=>{const row=document.createElement('div');row.className='bar';const label=document.createElement('span');label.textContent=labels[i];const track=document.createElement('div');track.className='track';const fill=document.createElement('div');fill.className='fill';fill.style.width=pct(v);track.append(fill);const value=document.createElement('span');value.textContent=pct(v);row.append(label,track,value);return row;}));
  $('marginals').textContent=`Alice warm: ${pct(p[0]+p[2])} · Bob warm: ${pct(p[0]+p[1])} · Agreement: ${pct(p[0]+p[3])}`;
  const x={theta:Math.PI/4,delta:0};
  const plus=probabilities(gamma,0,x,x),minus=probabilities(gamma,Math.PI,x,x);
  $('interference').textContent=`Rotated-basis agreement: coherent phase 0 = ${pct(plus[0]+plus[3])}; coherent phase 180 = ${pct(minus[0]+minus[3])}; classical correlated mixture = 50.0%.`;
}
for(const id of ['alice','bob','coupling','phase'])$(id).addEventListener('input',()=>{if(id==='alice')a.theta=radians(Number($(id).value));if(id==='bob')b.theta=radians(Number($(id).value));render();});
$('exchange').onclick=()=>{const {gamma,phase}=settings();const p=probabilities(gamma,phase,a,b),out=sample(p),aa=out&1,bb=(out>>1)&1;const text=`Exchange ${++turn}: Alice hears ${aa?'guarded':'warm'}, Bob hears ${bb?'guarded':'warm'} (joint probability ${pct(p[out])}).`;const li=document.createElement('li');li.textContent=text;$('history').append(li);$('reading').textContent=text;a=updateBasis(a,aa);b=updateBasis(b,bb);render();};
$('reset').onclick=()=>{a={theta:0,delta:0};b={theta:Math.PI/4,delta:0};turn=0;$('alice').value=0;$('bob').value=45;$('history').replaceChildren();$('reading').textContent='Conversation reset.';render();};
$('quantum').onclick=async()=>{
  if(submitted)return;submitted=true;$('quantum').disabled=true;
  try{
    const {gamma,phase}=settings(),snapshot={gamma,phase,alice:{...a},bob:{...b}};
    const qc=QuantumCircuit(6,6);qc.ry(2*gamma,0);qc.cx(0,1);qc.rz(phase,0);
    qc.rz(-a.delta,0);qc.ry(-2*a.theta,0);qc.rz(-b.delta,1);qc.ry(-2*b.theta,1);
    qc.h(2);qc.cx(2,3);qc.h(2);qc.h(3);
    qc.h(4);qc.cx(4,5);qc.z(4);qc.h(4);qc.h(5);
    qc.measure([0,1,2,3,4,5],[0,1,2,3,4,5]);
    $('status').textContent='Running one six-qubit job on the selected Qollab backend…';
    const job=await backend.run(qc,{shots:512});
    const raw=(await job.result()).get_counts().toJs();
    const entries=raw instanceof Map?[...raw.entries()]:Object.entries(raw);
    let n=0,plus=0,minus=0;const pair=[0,0,0,0];
    for(const [key,count]of entries){const bits=String(key).replace(/\s/g,'').padStart(6,'0').split('').reverse();const v=Number(count);n+=v;pair[Number(bits[0])+2*Number(bits[1])]+=v;if(bits[2]===bits[3])plus+=v;if(bits[4]===bits[5])minus+=v;}
    if(!n)throw new Error('Backend returned no counts.');
    $('results').textContent=JSON.stringify({shots:n,settings:snapshot,listenerPairProbabilities:pair.map(v=>v/n),phaseZeroAgreement:plus/n,phasePiAgreement:minus/n,rawCounts:Object.fromEntries(entries)},null,2);
    $('status').textContent='Backend results received. These describe the captured settings. Run the project again for another backend job; local conversation controls remain available.';
  }catch(e){$('status').textContent=`Backend error: ${e.message||e}. Run the project again and choose a free simulator.`;}
};
render();
