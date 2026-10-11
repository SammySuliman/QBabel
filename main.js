import { QuantumCircuit } from 'qiskit';
import {people,dimensions,parse,initial,evolve,build,distribution,marginal,sample,decode,countsDistribution,statevector} from './semantic.js';

const root = document.querySelector('main') || document.body;
root.innerHTML = `
<p class="eyebrow">QUBABEL · DIALOGUE CODEX</p>
<h1>Choose your words.<br>Watch grammar evolve.</h1>
<p>All choices are spoken English lines with a named addressee. Personal bases grow from the conversation; there are no angle controls or LLM calls.</p>
<section><h2 id="branch-title"></h2><p id="branch-note"></p><p id="speaker-label"></p><div id="choices" class="grid"></div><p id="status" role="status"></p><button id="reset">Restart conversation</button></section>
<section><h2>Interpretations</h2><p id="probe-label">Choose an opening sentence.</p><div id="readings" class="grid"></div></section>
<section><h2>Bloch spheres: before → after</h2><p>Cyan: message state. Dashed grey: basis before this turn. Gold: basis after this turn. The event is freshly replayed to predict how the updated basis would read it; earlier recorded outcomes stay unchanged.</p><p>P(outcome 0) = (1 + r · n) / 2. Outcome 0: written subject, past, positive, or SVO. Outcome 1: reversed roles, future, negative, or VSO. A short cyan vector is a mixed reduced state; individual spheres do not show all shared correlations.</p><div id="spheres" class="grid"></div></section>
<section><h2>Conversation</h2><ol id="history"></ol></section>
<section><h2>Qiskit check</h2><button id="quantum" disabled>Run current replay on selected backend</button><p id="backend-status" role="status">One eight-qubit backend job per project run. Local dialogue stays available afterward.</p><pre id="backend-results" tabindex="0"></pre></section>
<details><summary>How the grammar works</summary><p>Each listener has four qubits: roles, past/future, polarity, and SVO/VSO order. Each spoken line has a predefined grammatical frame that resolves “I” to its speaker and “you” to its named addressee. A content utterance prepares fresh states, applies the speaker’s frame, links recipient agency qubits through a controlled phase determined by prior content exchanges, and measures each register through its listener’s basis.</p><p>Questions, agreement, disagreement and measured readings append prescribed Y/Z rotations to recipient bases. These are invented conlang rules. The sender does not update from sending alone. All participants start with identical neutral frames. Context turns update projections of a fresh replay, without claiming that a measured state remains uncollapsed.</p></details>
<footer>This effort is supported by Qollab &amp; IonQ · MIT · AI-assisted implementation. Exact local quantum probabilities with classical sampling; backend counts use Qiskit. No outside service required.</footer>`;
const $ = id => document.getElementById(id);
const pct = n => (100*n).toFixed(1)+'%';
let memory=initial(),node='opening',shared=0,turn=0,probe=null,backendCircuit=null,used=false;
const codex={
 opening:{speaker:'Alice',title:'Alice starts the conversation',note:'Alice, Bob and Charlie are discussing who will help whom.',options:[
  ["Bob, I'll help you tomorrow.",'response','Tomorrow, Alice will help Bob.','Bob'],
  ["Bob, I helped you yesterday.",'response','Yesterday, Alice helped Bob.','Bob']
 ]},
 response:{speaker:'Bob',title:'Bob replies to Alice',note:'Choose what Bob actually says.',options:[
  ["Alice, when do you mean?",'time','When?','Alice'],
  ["Alice, do you mean you will help me, or I will help you?",'roles','Who?','Alice'],
  ["Alice, I disagree.",'disagreement','I disagree.','Alice'],
  ["Alice, I agree.",'agreement','I agree.','Alice']
 ]},
 time:{speaker:'Alice',title:'Alice clarifies to Bob',note:'The tense clarification changes the conversation.',options:[
  ["Bob, I mean I'll help you tomorrow.",'review','Tomorrow, Alice will help Bob.','Bob'],
  ["Bob, I mean I helped you yesterday.",'review','Yesterday, Alice helped Bob.','Bob']
 ]},
 roles:{speaker:'Alice',title:'Alice clarifies the roles',note:'The addressed person fixes the reference of “you”.',options:[
  ["Bob, I'll help you.",'review','Tomorrow, Alice will help Bob.','Bob'],
  ["Bob, you'll help me.",'review','Tomorrow, Bob will help Alice.','Bob'],
  ["Charlie, you'll help Bob.",'review','Tomorrow, Charlie will help Bob.','Charlie']
 ]},
 disagreement:{speaker:'Alice',title:'Alice responds to Bob’s disagreement',note:'Choose a correction or a new commitment.',options:[
  ["Bob, you're right. I did not help you yesterday.",'review','Alice did not help Bob.','Bob'],
  ["Bob, I'll help you tomorrow.",'review','Tomorrow, Alice will help Bob.','Bob']
 ]},
 agreement:{speaker:'Alice',title:'Alice continues after agreement',note:'She can keep the commitment or bring Charlie into it.',options:[
  ["Bob, I'll help you tomorrow.",'review','Tomorrow, Alice will help Bob.','Bob'],
  ["Charlie, you'll help Bob tomorrow.",'review','Tomorrow, Charlie will help Bob.','Charlie']
 ]},
 review:{speaker:'Charlie',title:'Charlie joins in',note:'Charlie’s reply updates Alice and Bob.',options:[
  ["Alice, I agree.",'revisit','I agree.','Alice'],
  ["Alice, I disagree.",'revisit','I disagree.','Alice'],
  ["Alice, when do you mean?",'time','When?','Alice'],
  ["Alice, could you say that again?",'revisit','Say that again.','Alice'],
  ["Bob, I'll help you tomorrow.",'bobReply','Tomorrow, Charlie will help Bob.','Bob']
 ]},
 bobReply:{speaker:'Bob',title:'Bob responds to Charlie',note:'Alice also hears this exchange.',options:[
  ["Charlie, I agree.",'revisit','I agree.','Charlie'],
  ["Charlie, I disagree.",'revisit','I disagree.','Charlie'],
  ["Charlie, I helped you yesterday.",'aliceReply','Yesterday, Bob helped Charlie.','Charlie']
 ]},
 aliceReply:{speaker:'Alice',title:'Alice reacts to Bob and Charlie',note:'She can ask for a replay or return to her own commitment.',options:[
  ["Bob, could you say that again?",'bobReply','Say that again.','Bob'],
  ["Bob, I'll help you tomorrow.",'response','Tomorrow, Alice will help Bob.','Bob']
 ]},
 revisit:{speaker:'Alice',title:'Alice revisits her earlier words',note:'Repeat a line and compare it with its earlier readings.',options:[
  ["Bob, I'll help you tomorrow.",'response','Tomorrow, Alice will help Bob.','Bob'],
  ["Bob, I helped you yesterday.",'response','Yesterday, Alice helped Bob.','Bob']
 ]}
};

function bloch(circuit,q){
 const {re,im}=statevector(circuit),mask=1<<q;let x=0,y=0,z=0;
 for(let i=0;i<re.length;i++)if(!(i&mask)){const j=i|mask;x+=2*(re[i]*re[j]+im[i]*im[j]);y+=2*(re[i]*im[j]-im[i]*re[j]);z+=re[i]**2+im[i]**2-re[j]**2-im[j]**2;}
 return [x,y,z];
}
function basis(gates){return bloch({qubits:1,ops:gates.map(g=>({...g,q:0}))},0);}
function chance(r,n){return Math.max(0,Math.min(1,(1+r.reduce((s,v,i)=>s+v*n[i],0))/2));}
function replay(prepared,frames){
 const c=structuredClone(prepared);
 c.listeners.forEach((name,l)=>dimensions.forEach((_,d)=>{for(const g of [...frames[name].basis[d]].reverse())c.ops.push({...g,angle:-g.angle,q:l*4+d});}));
 return c;
}
function preparedPart(circuit,frames){
 const suffix=circuit.listeners.reduce((s,n)=>s+frames[n].basis.reduce((a,b)=>a+b.length,0),0);
 return {...structuredClone(circuit),ops:circuit.ops.slice(0,circuit.ops.length-suffix)};
}
function addLog(text){const li=document.createElement('li');li.textContent=text;$('history').append(li);}
function renderChoices(){
 const branch=codex[node];$('branch-title').textContent=branch.title;$('branch-note').textContent=branch.note;$('speaker-label').textContent='Next speaker: '+branch.speaker;$('choices').replaceChildren();
 branch.options.forEach(([text,next,frame,to])=>{const button=document.createElement('button');button.type='button';button.textContent=text;button.addEventListener('click',()=>choose(text,next,frame,to));$('choices').append(button);});
}
function predictions(circuit){
 const p=distribution(circuit);$('readings').replaceChildren();
 circuit.listeners.forEach((name,l)=>{const card=document.createElement('article'),h=document.createElement('h3');h.textContent=name;card.append(h);marginal(p,l).map((v,i)=>({v,i})).sort((a,b)=>b.v-a.v).slice(0,3).forEach(item=>{const r=decode(circuit.message,item.i),line=document.createElement('p');line.textContent=pct(item.v)+' · '+r.english+' · '+r.order;card.append(line);});$('readings').append(card);});
}
function drawSphere(canvas,r,before,after){
 const ctx=canvas.getContext('2d');
 const project=v=>[150+90*(.866*v[0]+.5*v[1]),125+90*(.25*v[0]-.433*v[1]-.866*v[2])];
 function line(points,color){ctx.strokeStyle=color;ctx.beginPath();points.forEach((v,i)=>{const p=project(v);i?ctx.lineTo(...p):ctx.moveTo(...p);});ctx.stroke();}
 ctx.lineWidth=1;
 for(let d=0;d<3;d++){const points=[];for(let k=0;k<=80;k++){const t=k*2*Math.PI/80,v=[0,0,0];v[(d+1)%3]=Math.cos(t);v[(d+2)%3]=Math.sin(t);points.push(v);}line(points,'#56677e');}
 for(let d=0;d<3;d++){const v=[0,0,0];v[d]=1.1;line([[0,0,0],v],'#66788f');ctx.fillStyle='#eef2ff';ctx.fillText(['X','Y','Z reference'][d],...project(v));}
 function arrow(v,color,dashed){const [x,y]=project(v),a=Math.atan2(y-125,x-150);ctx.lineWidth=3;ctx.setLineDash(dashed?[5,4]:[]);line([[0,0,0],v],color);ctx.setLineDash([]);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-8*Math.cos(a-.4),y-8*Math.sin(a-.4));ctx.lineTo(x-8*Math.cos(a+.4),y-8*Math.sin(a+.4));ctx.closePath();ctx.fill();}
 arrow(before,'#a8b2c4',true);arrow(after,'#facc15',false);arrow(r,'#8ee6d3',false);
}
function spheres(before,after){
 $('spheres').replaceChildren();if(!probe)return;
 probe.listeners.forEach((name,l)=>dimensions.forEach((dimension,d)=>{
  const r=bloch(probe,l*4+d),old=basis(before[name].basis[d]),next=basis(after[name].basis[d]);
  const card=document.createElement('article'),h=document.createElement('h3');h.textContent=name+' · '+dimension;card.append(h);
  const canvas=document.createElement('canvas');canvas.width=300;canvas.height=250;canvas.style.width='100%';canvas.style.maxWidth='300px';canvas.setAttribute('role','img');canvas.setAttribute('aria-label',`${name} ${dimension}: probability of outcome zero changes from ${pct(chance(r,old))} to ${pct(chance(r,next))}`);card.append(canvas);drawSphere(canvas,r,old,next);
  const p=document.createElement('p');p.textContent=`P(0): ${pct(chance(r,old))} → ${pct(chance(r,next))} · state length ${Math.hypot(...r).toFixed(3)}`;card.append(p);$('spheres').append(card);
 }));
}
function choose(text,next,frame,to){
 try{
  const speaker=codex[node].speaker,message=parse(frame),listeners=people.filter(p=>p!==speaker),before=structuredClone(memory);
  message.text=text; message.grammarFrame=frame; message.addressee=to;
  addLog(`${++turn}. ${speaker} → ${to}: “${text}”`);
  if(message.kind==='context'){
   listeners.forEach(name=>{memory=evolve(memory,name,message);});
   addLog('Context update: '+listeners.join(' and ')+'. No event was measured on this turn.');
  }else{
   const circuit=build(memory,speaker,listeners,message,shared),out=sample(distribution(circuit));probe=preparedPart(circuit,memory);
   listeners.forEach((name,l)=>{const value=(out>>(4*l))&15,r=decode(message,value);addLog(`${name} received: ${r.english} · ${r.order}: ${r.surface}`);memory=evolve(memory,name,message,value);});shared++;
  }
  if(probe){backendCircuit=replay(probe,memory);predictions(backendCircuit);spheres(before,memory);$('probe-label').textContent=`Fresh replay of “${probe.message.text}” for ${probe.listeners.join(' and ')} through their updated bases. Top three of 16 readings each.`;$('quantum').disabled=used;}
  node=next;renderChoices();$('status').textContent='Turn complete. Choose the next sentence.';
 }catch(error){$('status').textContent=error.message||String(error);}
}
$('reset').addEventListener('click',()=>{memory=initial();shared=0;turn=0;node='opening';probe=null;backendCircuit=null;['history','readings','spheres'].forEach(id=>$(id).replaceChildren());$('quantum').disabled=true;$('probe-label').textContent='Choose an opening sentence.';$('status').textContent='Everyone starts neutral again.';renderChoices();});
$('quantum').addEventListener('click',async()=>{
 if(!backendCircuit||used)return;used=true;$('quantum').disabled=true;const c=structuredClone(backendCircuit);
 try{const qc=QuantumCircuit(8,8);for(const g of c.ops){if(g.gate==='cp')qc.cp(g.angle,g.q,g.target);else if(g.gate==='ry')qc.ry(g.angle,g.q);else qc.rz(g.angle,g.q);}qc.measure([0,1,2,3,4,5,6,7],[0,1,2,3,4,5,6,7]);$('backend-status').textContent='Running captured replay on the selected backend…';const job=await backend.run(qc,{shots:512}),raw=(await job.result()).get_counts().toJs(),entries=raw instanceof Map?[...raw.entries()]:Object.entries(raw),result=countsDistribution(entries);$('backend-results').textContent=JSON.stringify({utterance:c.message.text,listeners:c.listeners,shots:result.shots,counts:Object.fromEntries(entries)},null,2);$('backend-status').textContent='Backend results received. Rerun the project for another backend job.';}catch(error){$('backend-status').textContent='Backend error: '+(error.message||error)+'. Rerun the project to retry.';}
});
renderChoices();$('status').textContent='Ready. Choose an opening sentence.';
