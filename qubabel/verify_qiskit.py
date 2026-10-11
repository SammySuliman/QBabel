"""Cross-check JS semantics against Qiskit's exact six-qubit statevector."""
import math, json, subprocess
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
g,p,a,d,b,e = .39,1.2,.21,.43,-.35,.18
c=QuantumCircuit(6)
c.ry(2*g,0);c.cx(0,1);c.rz(p,0)
c.rz(-d,0);c.ry(-2*a,0);c.rz(-e,1);c.ry(-2*b,1)
c.h(2);c.cx(2,3);c.h(2);c.h(3)
c.h(4);c.cx(4,5);c.z(4);c.h(4);c.h(5)
probs=Statevector.from_instruction(c).probabilities()
pair=[sum(v for i,v in enumerate(probs) if i%4==k) for k in range(4)]
js="import {probabilities} from './semantic.js'; console.log(JSON.stringify(probabilities(.39,1.2,{theta:.21,delta:.43},{theta:-.35,delta:.18})))"
expected=json.loads(subprocess.check_output(['node','--input-type=module','-e',js],text=True))
assert all(abs(x-y)<1e-10 for x,y in zip(pair,expected)), (pair,expected)
plus=sum(v for i,v in enumerate(probs) if ((i>>2)&1)==((i>>3)&1))
minus=sum(v for i,v in enumerate(probs) if ((i>>4)&1)==((i>>5)&1))
assert abs(plus-1)<1e-10 and abs(minus)<1e-10
print('Qiskit cross-check passed: six-qubit circuit, bit order, personal bases, phase reference pairs.')
