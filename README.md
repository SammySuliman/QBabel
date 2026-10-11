# Qubabel v2 — Grammar in conversation

## What changed
No manual basis angles. Three named participants begin with identical neutral bases. Only received conversation and resolved readings change their personal linguistic frames. The content is grammatical, not subjective: agency, past/future tense, polarity, and SVO/VSO surface order.

## Run on Qollab
Replace the old four runtime files with index.html, main.css, main.js and semantic.js from this folder, at the project root. Run as JS / Qiskit on the free built-in simulator. Select a speaker, enter a supported utterance, and click Speak. After a content utterance, click Run latest utterance on Qollab’s backend. Exactly one eight-qubit job is submitted per project run; rerun the project for another backend job. No paid hardware is required. Free IonQ simulator compatibility still needs an actual platform run. Do not claim platform checks have passed based only on local tests.

## Run directly on your computer
Open preview.html in a browser. It is self-contained and supports the same local conversation engine. Its quantum-backend button explains that backend execution requires Qollab. It does not masquerade as an actual backend result.

## Try this
1. Alice says: Alice helps Bob.
2. Bob says: When?
3. Charlie says: I disagree.
4. Alice repeats: Alice helps Bob.
Compare the predicted top readings before the first and fourth measurements. Start a new conversation and reverse the middle two turns to explore history. With different speakers, recipients differ too. Automated order-effect tests hold the recipient fixed to isolate the noncommuting update rule.

## Mini-grammar
Names: Alice, Bob, Charlie. Verbs: help, trust, follow, call, see (with the documented present/past forms). Content examples:
- Alice helps Bob.
- Yesterday, Alice helped Bob.
- Tomorrow, Bob will help Alice.
- Alice did not help Bob.
Context phrases: I agree. / I disagree. / Who? / When? / Did it happen? / Say that again.
No arbitrary-English NLP, pronoun resolution, present-tense output, three-way tense, or six-way word order yet. Unsupported input gets an explicit error. Neutral input such as Alice helps Bob leaves tense unresolved between past and future by design.

## Formal definition
Each content exchange prepares two four-qubit registers, one per recipient. Bit 0 is role reversal; bit 1 is future rather than past; bit 2 is negative rather than positive; bit 3 is VSO rather than SVO. English-order labels preserve role identity in VSO output. Changing word order alone does not change who acts on whom.

Preparation probabilities for bit 1 are: role reversal .15; future .08 for past-marked utterances, .92 for future-marked utterances, .5 otherwise; negative .92 for negative input and .08 otherwise; VSO .2. Ry(2 asin(sqrt(p))) prepares each alternative. The speaker’s stored basis-gate history then transforms each register. These exact numbers are invented grammar defaults, not estimates learned from human conversations.

A controlled phase CP(lambda) joins the recipients’ agency qubits, with lambda = pi h/(h+2), where h is the number of prior content exchanges in the current conversation. This can create genuine entanglement in the simulated state. It represents a stipulated shared-history rule, not a claim that real speakers are physically entangled. The first exchange h=0 is separable.

Each listener’s basis B is the product of their received-history Y/Z rotations. Applying B inverse before Z measurement gives probabilities via the Born rule. A joint local draw resolves both registers. Each recipient then appends context gates plus reading-dependent gates to their own basis; the sender does not update merely from sending. The next utterance prepares a fresh state. Basis memories are classical gate lists, not preserved physical post-measurement qubits.

Content updates: agency Ry(.22); tense Ry(-.42) for past, Ry(.42) for future, Rz(.25) if unresolved; polarity Rz(pi/3) for negative, Ry(-.12) otherwise; order Rz(.18). Outcome bit 0 adds Ry(-.1), bit 1 adds Rz(.16) to that dimension. Context updates are specified in semantic.js. Since Y and Z rotations do not commute, receiving agreement then disagreement can differ from the reverse. There are no exposed numeric basis controls.

Backend results measure a frozen snapshot of the latest content exchange and its pre-reading basis histories, using 512 shots. This statistical verification does not retroactively replace local readings or update the conversation. New local input can continue while the job runs; results retain their captured utterance and participants.

## Tests
Run node test.mjs and python verify_qiskit.py (with Qiskit installed), from this folder. Passed: parser cases, role/tense/polarity/order decoding, normalized distributions, bit ordering, immutable input history, noncommuting history effects, entanglement reduced-state purity, and comparison of all 256 amplitudes’ probabilities to Qiskit for a nontrivial history.
Qollab browser/UI execution and IonQ execution remain unverified for this rewrite.

## Hackathon project page copy
Qubabel explores a constructed language whose grammar emerges through dialogue. English words prepare a quantum semantic state; each listener has a personal basis determined by received history. Instead of choosing angles, users participate in a conversation that changes who acts on whom, tense, polarity, and surface word order. Coherent controlled-phase coupling and noncommuting basis updates make the quantum mechanics part of the grammar rather than just a source of random numbers. The app exposes local exact-model predictions and an eight-qubit Qiskit backend check. Theme: Quantum Playground, with educational relevance to Quantum Unlocked.

## Originality and remaining submission steps
The project idea originates with the participant. This implementation is AI-assisted work created during the October 9–11, 2026 build window. The Qollab integration follows its documented JS/Qiskit API; v2 extends the AI-assisted v1 developed in the same window. Disclose both the earlier conceptual work and AI help. MIT license included. No quantum advantage, psychology, or factual event claims are made.
Before October 11, 2026, 7 p.m. Eastern: confirm team registration, test Qollab local and free IonQ simulator execution, publish a public runnable MIT version with project-page documentation, and include a public 2–3 minute demo. Keep the project available for 12 months as required by the hackathon terms. No entry has been submitted by this package.

This effort is supported by Qollab & IonQ

Platform sources verified during v1 work: https://qollab.xyz/programs/hackathon/terms ; https://qollab.xyz/learn/docs/js-qiskit-projects
