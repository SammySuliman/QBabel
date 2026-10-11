# Qubabel: Meaning between minds

An English-word quantum semantic playground. The factual sentence remains fixed; two listeners have their own evolving bases for subjective warm/guarded readings. This is an invented conlang mechanism, not a validated psychological model.

## Qollab setup
Create a JS / Qiskit project. Add index.html, main.css, main.js and semantic.js at the project root. Use the built-in free simulator first. Click Run, explore local conversation controls, then click Run six-qubit Qiskit experiment. Select a free IonQ simulator on a separate project run to check compatibility. The app submits exactly one six-qubit job per run; rerun the project for a new backend experiment. Qollab supplies the backend and Qiskit import. No external service, paid hardware, storage, or credentials are needed by the code.

## Mathematics
Prepare cos(gamma)|00> + exp(i phase) sin(gamma)|11> using Ry(2 gamma), CX and Rz(phase). Each listener measures a distinct subsystem in B = Rz(delta) Ry(2 theta), by applying its inverse before Z measurement. Probabilities follow the Born rule. Entanglement entropy is the binary entropy of sin²(gamma). At gamma=45°, each local marginal stays 50/50 regardless of the other basis; only joint correlations vary.

Each local exchange samples one joint outcome and then prepares a fresh utterance pair. Personal basis parameters persist within the run. Warm: theta += 7° cos(delta). Guarded: delta += 35°. These are invented, classical adaptive update rules. Their order does not commute. This is not a claim that quantum measurement automatically changes the measurement apparatus, nor that a measured state is reused coherently.

Two further reference pairs compare phase 0 and phase pi in X bases. Ideal agreement is 100% and 0%, respectively; an incoherent correlated 00/11 mixture gives 50% in both. This exposes interference rather than mere random generation. The reference experiment uses fixed maximal coupling, independently of the interactive coupling slider.

## Validation
Run node test.mjs. Install Qiskit and run python verify_qiskit.py from this folder. Both passed during development: probability normalization, Bell correlations, phase interference, no-signalling marginals, entropy endpoints, adaptive order effects, Qiskit six-qubit statevector cross-check and bit ordering. Browser UI and Qollab local/IonQ execution remain unverified because hosted project creation was blocked at sign-in. Do not claim those platform checks have passed yet.

## Originality and disclosure
Concept developed by the participant before this implementation; code and documentation generated with OpenAI assistant help during the October 9–11, 2026 build window. The small backend integration follows Qollab’s documented JS/Qiskit API. No pre-existing project code was imported. Qiskit is a third-party framework. Do not claim quantum advantage or Bell certification from this demo. Best-fit theme: Quantum Playground; secondary educational fit: Quantum Unlocked.

## Submission checklist
- Confirm your team is registered (registration closed October 8 at 11 a.m. Eastern).
- Upload the four runtime files and test built-in and free IonQ simulator runs.
- Publish a public runnable version under MIT before October 11, 2026 at 7 p.m. Eastern.
- Add a project page covering the purpose, mechanics, run steps, limitations, originality disclosure and attribution.
- Record and link a public 2–3 minute demo that opens without sign-in.
- Submit through your registered team. Keep the project available for 12 months per the terms.

This effort is supported by Qollab & IonQ

Sources: https://qollab.xyz/programs/hackathon/terms ; https://qollab.xyz/learn/docs/js-qiskit-projects ; https://qollab.xyz/learn/docs/compute-backends
