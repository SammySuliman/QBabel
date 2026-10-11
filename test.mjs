import assert from 'node:assert/strict';
import {parse,initial,evolve,build,distribution,decode,marginal,countsDistribution,statevector} from './semantic.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
const message=parse('Alice helps Bob.'),base=initial();
assert.equal(parse('Yesterday, Alice helped Bob.').tense,'past');assert.equal(parse('Tomorrow, Bob will help Alice.').tense,'future');assert.equal(parse('Alice did not help Bob.').negative,true);assert.equal(parse('When?').kind,'context');assert.throws(()=>parse('nonsense'));assert.throws(()=>parse('Alice helps Alice.'));
const original=build(base,'Alice',['Bob','Charlie'],message,0),p=distribution(original);close(p.reduce((a,b)=>a+b),1);close(marginal(p,0).reduce((a,b)=>a+b),1);
assert.equal(decode(message,0).english,'Alice helped Bob.');assert.equal(decode(message,1).english,'Bob helped Alice.');assert.equal(decode(message,2).english,'Alice will help Bob.');assert.equal(decode(message,8).order,'VSO');assert.equal(decode(message,4).english,'Alice did not help Bob.');
let ab=evolve(evolve(base,'Bob',parse('I agree.')),'Bob',parse('I disagree.'));
let ba=evolve(evolve(base,'Bob',parse('I disagree.')),'Bob',parse('I agree.'));
const pa=distribution(build(ab,'Alice',['Bob','Charlie'],message,2)),pb=distribution(build(ba,'Alice',['Bob','Charlie'],message,2));assert.ok(pa.some((v,i)=>Math.abs(v-pb[i])>1e-5));
assert.deepEqual(base.Bob.basis,[[],[],[],[]]);
// Entanglement: purity of reduced agency qubit drops below 1 after CP.
function purity(c){const {re,im}=statevector(c);let a=0,b=0,x=0,y=0;for(let i=0;i<256;i+=2){a+=re[i]**2+im[i]**2;b+=re[i+1]**2+im[i+1]**2;x+=re[i]*re[i+1]+im[i]*im[i+1];y+=im[i]*re[i+1]-re[i]*im[i+1];}return a*a+b*b+2*(x*x+y*y);}
close(purity(original),1);assert.ok(purity(build(base,'Alice',['Bob','Charlie'],message,4))<.99);
close(countsDistribution([['00000000',10],['00010001',10]]).p[17],.5);
console.log('Passed: parser, role/tense/polarity/order decoding, normalization, count bit order, immutable history, conversation-order effects, entanglement purity.');
