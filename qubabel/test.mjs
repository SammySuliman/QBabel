import assert from 'node:assert/strict';
import {probabilities,entropy,updateBasis} from './semantic.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
const z={theta:0,delta:0},x={theta:Math.PI/4,delta:0};
let p=probabilities(Math.PI/4,0,z,z);close(p[0],.5);close(p[3],.5);close(p[1]+p[2],0);
p=probabilities(Math.PI/4,0,x,x);close(p[0]+p[3],1);
p=probabilities(Math.PI/4,Math.PI,x,x);close(p[0]+p[3],0);
close(entropy(0),0);close(entropy(Math.PI/4),1);
for(let i=0;i<50;i++){const a={theta:i*.13,delta:i*.17},b={theta:i*.21,delta:i*.31};p=probabilities(Math.PI/4,i*.19,a,b);close(p.reduce((s,v)=>s+v,0),1);close(p[0]+p[2],.5);close(p[0]+p[1],.5);}
assert.notEqual(updateBasis(updateBasis(z,0),1).theta,updateBasis(updateBasis(z,1),0).theta);
console.log('Passed: normalization, Bell correlations, interference, no-signalling marginals, entropy, adaptive order dependence.');
