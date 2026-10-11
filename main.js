import { QuantumCircuit } from 'qiskit';
import {people,dimensions,parse,initial,evolve,build,distribution,marginal,sample,decode,countsDistribution} from './semantic.js';
const $=id=>document.getElementById(id);
let memory=initial(),shared=0,latest=null,jobUsed=false,turn=0;
const percent=n=>(100*n).toFixed(1)+'%';
function log(text){const li=document.createElement('li');li.textContent=text;$('history').append(li);}
function inspect(){ $('inspect').textContent=JSON.stringify({sharedContentExchanges:shared,participants:Object.fromEntries(people.map(p=>[p,{heard:memory[p].heard,gatesPerDimension:memory[p].basis.map(b=>b.length)}])),latestCircuit:latest?.circuit.ops||[]},null,2);}
function show(p,circuit){
  $('readings').replaceChildren();
  circuit.listeners.forEach((name,l)=>{
    const probs=marginal(p,l),ranked=probs.map((v,i)=>({v,i})).sort((a,b)=>b.v-a.v);const card=document.createElement('article'),h=document.createElement('h3');h.textContent=name;card.append(h);
    for(const item of ranked.slice(0,3)){const reading=decode(circuit.message,item.i),para=document.createElement('p');para.textContent=`${percent(item.v)} · ${reading.english} · ${reading.order}`;card.append(para);}
    const note=document.createElement('p');note.textContent='Top three of 16 possible grammatical readings.';card.append(note);$('readings').append(card);
  });
}
$('compose').onsubmit=e=>{
  e.preventDefault();try{
    const message=parse($('message').value),speaker=$('speaker').value,listeners=people.filter(p=>p!==speaker);
    if(message.kind==='context'){
      for(const listener of listeners)memory=evolve(memory,listener,message);
      log(`${++turn}. ${speaker}: “${message.text}” — updated ${listeners.join(' and ')}; no new event measured.`);
    }else{
      const circuit=build(memory,speaker,listeners,message,shared),p=distribution(circuit),out=sample(p);
      latest={circuit,p};show(p,circuit);
      log(`${++turn}. ${speaker}: “${message.text}”`);
      listeners.forEach((listener,l)=>{const value=(out>>(4*l))&15,reading=decode(message,value);log(`${listener} receives: ${reading.english} · ${reading.order}: ${reading.surface}`);memory=evolve(memory,listener,message,value);});
      shared++;$('quantum').disabled=jobUsed;
    }
    $('status').textContent='Conversation updated. Personal bases follow the received history.';inspect();
  }catch(err){$('status').textContent=err.message;}
};
$('reset').onclick=()=>{memory=initial();shared=0;latest=null;turn=0;$('history').replaceChildren();$('readings').replaceChildren();$('quantum').disabled=true;$('status').textContent='All three participants start neutral again.';inspect();};
$('quantum').onclick=async()=>{
  if(!latest||jobUsed)return;jobUsed=true;$('quantum').disabled=true;
  const circuit=structuredClone(latest.circuit);
  try{
    const qc=QuantumCircuit(8,8);
    for(const op of circuit.ops){if(op.gate==='cp')qc.cp(op.angle,op.q,op.target);else if(op.gate==='ry')qc.ry(op.angle,op.q);else qc.rz(op.angle,op.q);}
    qc.measure([0,1,2,3,4,5,6,7],[0,1,2,3,4,5,6,7]);
    $('backend-status').textContent='Running the captured utterance and its historical bases on the selected backend…';
    const job=await backend.run(qc,{shots:512}),raw=(await job.result()).get_counts().toJs();
    const entries=raw instanceof Map?[...raw.entries()]:Object.entries(raw),{p,shots}=countsDistribution(entries);
    $('backend-results').textContent=JSON.stringify({utterance:circuit.message.text,speaker:circuit.speaker,listeners:circuit.listeners,sharedHistory:circuit.shared,shots,listenerDistributions:circuit.listeners.map((name,l)=>({name,readings:marginal(p,l).map((prob,value)=>({probability:prob,...decode(circuit.message,value)})).filter(r=>r.probability>0)})),counts:Object.fromEntries(entries)},null,2);
    $('backend-status').textContent='Backend results received for the captured utterance. This statistical check does not alter the conversation. Run the entire project again for another backend job.';
  }catch(err){$('backend-status').textContent=`Backend error: ${err.message||err}. Run the project again to retry on a free simulator.`;}
};
inspect();
