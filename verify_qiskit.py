"""Validate the same generated history-driven gates using Qiskit."""
import json, subprocess
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
js="""import {parse,initial,evolve,build,distribution} from './semantic.js';
let m=initial();m=evolve(m,'Bob',parse('When?'));m=evolve(m,'Charlie',parse('I disagree.'));m=evolve(m,'Alice',parse('Yesterday, Bob helped Alice.'),3);
let c=build(m,'Alice',['Bob','Charlie'],parse('Tomorrow, Alice will help Bob.'),3);
console.log(JSON.stringify({c,p:distribution(c)}));"""
d=json.loads(subprocess.check_output(['node','--input-type=module','-e',js],text=True))
c=QuantumCircuit(8)
for op in d['c']['ops']:
 if op['gate']=='cp':c.cp(op['angle'],op['q'],op['target'])
 else:getattr(c,op['gate'])(op['angle'],op['q'])
p=Statevector.from_instruction(c).probabilities()
assert max(abs(a-b) for a,b in zip(p,d['p']))<1e-10
print('Qiskit eight-qubit cross-check passed for all 256 history-driven probabilities.')
