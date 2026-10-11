// Qubabel v2: explicit English mini-grammar, conversation-derived bases.
export const people=['Alice','Bob','Charlie'];
export const dimensions=['agency','tense','polarity','order'];
const verbs={help:['helps','helped'],trust:['trusts','trusted'],follow:['follows','followed'],call:['calls','called'],see:['sees','saw']};
const wordToVerb=Object.fromEntries(Object.entries(verbs).flatMap(([base,forms])=>[base,...forms].map(w=>[w,base])));
export function parse(text){
  const clean=text.trim().replace(/[.!?]+$/,'').trim();
  const low=clean.toLowerCase();
  if(['i agree','i disagree','who helps whom','who','when','did it happen','say that again'].includes(low))return {kind:'context',type:low,text};
  // Fixed, documented mini-grammar. No external NLP or sentiment guesses.
  const m=clean.match(/^(?:(yesterday|tomorrow|no),?\s+)?(Alice|Bob|Charlie)\s+(?:(will|did)\s+)?(?:(not)\s+)?(help|helps|helped|trust|trusts|trusted|follow|follows|followed|call|calls|called|see|sees|saw)\s+(Alice|Bob|Charlie)$/i);
  if(!m)throw new Error('Use e.g. “Alice helps Bob.”, “Yesterday, Alice helped Bob.”, “Tomorrow, Bob will help Alice.”, “Alice did not help Bob.”, or a listed context phrase.');
  const canonical=n=>people.find(p=>p.toLowerCase()===n.toLowerCase());
  const subject=canonical(m[2]),object=canonical(m[6]);
  if(subject===object)throw new Error('Use two different people in this prototype.');
  const verb=wordToVerb[m[5].toLowerCase()],forms=verbs[verb];
  const tense=m[1]?.toLowerCase()==='tomorrow'||m[3]?.toLowerCase()==='will'?'future':m[1]?.toLowerCase()==='yesterday'||m[3]?.toLowerCase()==='did'||m[5].toLowerCase()===forms[1]?'past':'unresolved';
  return {kind:'utterance',text,subject,object,verb,tense,negative:!!m[4]||m[1]?.toLowerCase()==='no'};
}
export const initial=()=>Object.fromEntries(people.map(n=>[n,{basis:dimensions.map(()=>[]),heard:0}]));
export const ry=a=>({gate:'ry',angle:a});
export const rz=a=>({gate:'rz',angle:a});
function contextOps(message){
  if(message.kind==='utterance')return [ry(.22),message.tense==='past'?ry(-.42):message.tense==='future'?ry(.42):rz(.25),message.negative?rz(Math.PI/3):ry(-.12),rz(.18)];
  const table={'i agree':[ry(-.18),ry(-.18),ry(-.18),ry(-.18)],'i disagree':[rz(.55),rz(.55),rz(.55),rz(.55)],'who helps whom':[rz(.7),ry(0),ry(0),ry(.28)],'who':[rz(.7),ry(0),ry(0),ry(.28)],'when':[ry(0),rz(.7),ry(0),ry(0)],'did it happen':[ry(0),ry(0),rz(.7),ry(0)],'say that again':[ry(.25),ry(.25),ry(.25),ry(.25)]};
  return table[message.type];
}
export function evolve(memory,listener,message,outcome=null){
  const next=structuredClone(memory),ops=contextOps(message);
  next[listener].heard++;
  dimensions.forEach((_,d)=>{next[listener].basis[d].push(ops[d]);if(outcome!==null)next[listener].basis[d].push(outcome>>d&1?rz(.16):ry(-.1));});
  return next;
}
export function build(memory,speaker,listeners,message,shared){
  if(message.kind!=='utterance')throw new Error('A content utterance is required.');
  const probs=[.15,message.tense==='past'?.08:message.tense==='future'?.92:.5,message.negative?.92:.08,.2];
  const ops=[];
  for(let l=0;l<2;l++)for(let d=0;d<4;d++){
    const q=l*4+d;ops.push({...ry(2*Math.asin(Math.sqrt(probs[d]))),q});
    // Intent is encoded through the speaker's evolved linguistic frame.
    for(const g of memory[speaker].basis[d])ops.push({...g,q});
  }
  // Shared history controls a genuine coherent controlled-phase interaction.
  const coupling=Math.PI*shared/(shared+2);
  if(shared>0)ops.push({gate:'cp',angle:coupling,q:0,target:4});
  for(let l=0;l<2;l++)for(let d=0;d<4;d++){
    for(const g of [...memory[listeners[l]].basis[d]].reverse())ops.push({...g,angle:-g.angle,q:l*4+d});
  }
  return {ops,qubits:8,speaker,listeners,message,shared,coupling};
}
export function statevector(circuit){
  const n=1<<circuit.qubits,re=new Float64Array(n),im=new Float64Array(n);re[0]=1;
  for(const op of circuit.ops){
    const mask=1<<op.q;
    if(op.gate==='ry'){
      const c=Math.cos(op.angle/2),s=Math.sin(op.angle/2);
      for(let i=0;i<n;i++)if(!(i&mask)){const j=i|mask,a=re[i],b=re[j],ai=im[i],bi=im[j];re[i]=c*a-s*b;re[j]=s*a+c*b;im[i]=c*ai-s*bi;im[j]=s*ai+c*bi;}
    }else{
      for(let i=0;i<n;i++){
        if(op.gate==='cp'&&(!(i&mask)||!(i&(1<<op.target))))continue;
        const angle=op.gate==='cp'?op.angle:(i&mask?op.angle/2:-op.angle/2);
        const c=Math.cos(angle),s=Math.sin(angle),a=re[i],b=im[i];re[i]=a*c-b*s;im[i]=a*s+b*c;
      }
    }
  }return {re,im};
}
export function distribution(circuit){const {re,im}=statevector(circuit);return [...re].map((v,i)=>v*v+im[i]*im[i]);}
export function marginal(p,listener){const out=Array(16).fill(0);p.forEach((v,i)=>out[(i>>(4*listener))&15]+=v);return out;}
export function sample(p,r=Math.random()){let sum=0;for(let i=0;i<p.length;i++){sum+=p[i];if(r<sum)return i;}return p.length-1;}
export function decode(message,value){
  const reverse=value&1,future=value>>1&1,negative=value>>2&1,vso=value>>3&1;
  const subject=reverse?message.object:message.subject,object=reverse?message.subject:message.object;
  const verb=future?(negative?'will not ':'will ')+message.verb:negative?'did not '+message.verb:verbs[message.verb][1];
  return {subject,object,tense:future?'future':'past',polarity:negative?'negative':'positive',order:vso?'VSO':'SVO',english:`${subject} ${verb} ${object}.`,surface:vso?`${verb} [subject: ${subject}] [object: ${object}]`:`${subject} ${verb} ${object}`};
}
export function countsDistribution(entries){const p=Array(256).fill(0);let shots=0;for(const [key,count]of entries){const bits=String(key).replace(/\s/g,'');if(!/^[01]{1,8}$/.test(bits))throw new Error('Unsupported count key '+key);const n=Number(count);p[parseInt(bits,2)]+=n;shots+=n;}if(!shots)throw new Error('No counts returned');return {p:p.map(v=>v/shots),shots};}
