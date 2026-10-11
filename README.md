# Qubabel — Three-Person Quantum Dialogue

LINK TO THE ACTUAL QUANTUM SIMULATOR TO RUN THE CODE: https://qollab.xyz/u/llzamenhof/qbabel-v2

Qubabel is an interactive constructed-language experiment in which three people converse using ordinary English words, while their grammatical interpretations depend on personal measurement bases that evolve through the dialogue.

The user chooses actual spoken lines rather than third-person descriptions. For example:

> Alice → Bob: “Bob, I’ll help you tomorrow.”
> Bob → Alice: “Alice, when do you mean?”
> Alice → Bob: “Bob, I mean I helped you yesterday.”
> Charlie → Alice: “Alice, I disagree.”

No LLM, API key, microphone, or external grammar service is required.

## What the project explores

How can a language make conversational history part of its grammar? In Qubabel, the same spoken line can produce different grammatical readings after different exchanges. All three people begin with identical neutral frames. Their frames change only through received context and resolved readings; users cannot set basis angles manually.

## Dialogue tree and sentence codex

The current branch identifies the next speaker and offers a small set of lines. Each line records its speaker, addressee, next branch, and predefined grammatical frame. “I” refers to the speaker; “you” refers to the named addressee. These references are fixed before quantum interpretation.

For example, Alice’s “Bob, I’ll help you tomorrow” maps to the frame “Tomorrow, Alice will help Bob.” The quantum grammar can then vary agency, tense, polarity and word order. It does not infer intent with NLP. Longer choices such as “Bob, you’re right. I did not help you yesterday” model the event clause; incidental acknowledgement words have no additional gate effect in this version.

Bob can question time or agency, agree, or disagree. Alice can clarify or correct. Charlie can react or make his own commitment to Bob, who then replies. Branches can return to an earlier sentence so its new readings can be compared with the recorded earlier readings. Choices are contextual reactions, not automatically selected from quantum outcomes.

## Quantum grammar

Each content exchange uses eight qubits: four for each of the two people listening. Their dimensions are:

| Dimension | Outcome 0 | Outcome 1 |
|---|---|---|
| Agency | Written subject acts | Subject and object reverse |
| Tense | Past | Future |
| Polarity | Positive | Negative |
| Surface order | SVO | VSO |

Agency and word order are separate. VSO output includes explicit subject/object labels. Present tense, arbitrary sentences, and additional word orders are outside this prototype.

A content frame prepares amplitudes, the speaker’s stored frame transforms them, and a controlled-phase operation couples the listeners’ agency qubits based on prior content exchanges. Each listener applies the inverse of their own accumulated basis before measurement. Local readings are jointly sampled from the exact eight-qubit distribution. Context phrases and resolved readings append prescribed, noncommuting Y/Z rotations to recipient bases. These update rules are invented conlang rules, not empirically established laws of human language.

## Bloch sphere visualization

Eight spheres display the latest event’s two recipient registers. Cyan represents the reduced message state. Dashed grey is the listener’s basis before the current turn; gold is the basis afterward. Each card reports the change in P(0), computed as (1 + r · n) / 2.

A short cyan vector represents a mixed reduced state arising from entanglement in the pure joint model. The individual spheres do not completely describe its joint correlations.

After each turn, interpretation cards predict a fresh replay of the latest prepared event through updated bases. They do not change a previous measurement outcome or claim that a measured quantum state remains uncollapsed. The log preserves actual earlier resolutions. A context turn can update only one displayed recipient if the other recipient is the person speaking that turn.

## Run on Qollab

Put index.html, main.js, main.css and semantic.js at the project root. Run with the free built-in simulator, choose an opening line, and follow the reply buttons. Existing v2/v3 semantic.js is compatible, so an existing project can be updated by replacing main.js alone; it rebuilds the interface itself.

Click “Run current replay on selected backend” to measure the captured replay with Qiskit. The app permits one backend job per run to stay within IonQ’s remote limit. Dialogue remains usable afterward. Restarting the conversation does not reset that job budget; rerun the entire project for another backend job. Backend results do not rewrite the dialogue log. Use a free IonQ simulator on a separate run to verify compatibility before submission.

Open preview.html locally for the standalone dialogue and spheres; its backend button explicitly indicates that Qollab is required for a backend job.

## Validation and limitations

Local smoke tests passed for every codex frame and branch target, speaker/addressee mappings, sentence-button callbacks, eight sphere render calls, context redraw, conversation branching, preservation of prior outcomes and reset. The underlying engine has prior normalization, entanglement, Bloch-vector and Born-rule projection tests. Live Qollab/IonQ execution of this revision remains unverified.

This is an artistic quantum-language prototype, not a factual account of real events, a psychology model, or a claim of quantum advantage.

## Originality, licensing and attribution

MIT license. AI-assisted code built during the October 9–11, 2026 hackathon window, extending earlier same-window prototypes and the participant’s prior concept. Disclose those origins in the Qollab project page. Best-fit theme: Quantum Playground, with educational relevance to Quantum Unlocked.

This effort is supported by Qollab & IonQ

Before October 11 at 7 p.m. Eastern, verify the free simulator runs, publish a public runnable MIT Qollab version, include a project page and public 2–3 minute demo, and submit through the registered team. Keep the project available for the required 12 months. No hackathon submission was made by this package.
