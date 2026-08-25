# Logic Prototype

Build one self-contained HTML file that lets a person drive a state model by hand. Use it for questions about business logic, state transitions, data shape, or an interface that only becomes clear when real scenarios are exercised.

The artifact is a primary source for the question it answers, but that does not make it permanent. The user decides whether it is deleted, retained temporarily, absorbed into production work, or preserved as durable evidence.

## When this is the right shape

- "Does this state machine handle X followed by Y?"
- "Can this data model represent the exception case?"
- "What should this reducer or command interface feel like?"
- Anything where a non-developer should be able to press controls and inspect the resulting state.

If the question is visual appearance rather than behavior, use [UI.md](UI.md).

## Process

### 1. State the question and location

Before writing, state the exact question, intended file path, and why that location fits. A standalone artifact should normally use an OS-temp path such as `<tmpdir>/<slug>-logic-prototype.html`. Use a clearly named repository scratch path only when the prototype must reuse project code or runtime conventions.

Put the question in the visible page header and in a top-of-file comment. Mark the page **PROTOTYPE — NOT PRODUCTION**.

### 2. Keep the logic portable

Inside the single HTML file, keep the logic behind a small pure interface, separate from rendering and event handling. Good shapes include:

- a reducer: `(state, action) => nextState`;
- an explicit state machine;
- pure functions over a plain data object;
- a small module-like object with a narrow method surface when it genuinely owns state.

The logic must not read the DOM, perform network or filesystem I/O, or use rendering as control flow. UI code dispatches actions and renders returned state; logic never calls back into the UI. Keep the logic block easy to lift into production later, but do not generalize beyond the question.

### 3. Make the file genuinely self-contained

Use plain HTML, CSS, and JavaScript in one file:

- no CDN, remote font, external image, module import, build step, package manager, or local server;
- no dependency on the repository being present after the file is shared;
- all example data embedded and visibly marked as fake;
- no real credentials, personal data, production endpoint, or persistent mutation.

Keep repository- and user-derived content inert:

- add a restrictive CSP that blocks network access and permits only the file's known inline style and script;
- HTML-escape every derived value placed in markup, including the question, comments, labels, and scenario names;
- write dynamic text with `textContent`; never use `innerHTML`, `outerHTML`, `insertAdjacentHTML`, or `document.write`;
- serialize embedded data as JSON and escape less-than characters, closing-script sequences, and Unicode line separators before placing it in a script block.

The file must open from `file://` by double-clicking it. If browser security makes the intended behavior impossible without a server, stop and explain why this artifact shape does not fit instead of quietly adding infrastructure.

### 4. Build the interaction surface

Render these parts in order:

1. **Question and prototype warning.** The user must always know what is being tested.
2. **Current state panel.** Show every relevant field in stable, diff-friendly JSON or labeled rows. Distinguish inputs, derived values, and validation/errors.
3. **Free-play controls.** Keep all valid actions available so the user can explore outside scripted cases. Disable illegal actions only when that illegality is part of the model, and explain why.
4. **Guided walkthrough tabs.** Each tab names one scenario, states what it probes, and lists the ordered controls to press. Provide a reset-to-scenario-start action.
5. **Transition evidence.** After each action, show the action name and a compact before/after or changed-fields view. Do not rely on an ever-growing console log as the primary view.

Use the project's domain language in labels and scenario names. The shell should help a non-developer recognize when behavior contradicts their expectation.

### 5. Verify and hand over

Verify after the final edit:

- the file parses and contains exactly one complete HTML document;
- no external URLs or imports are needed for runtime behavior;
- the CSP blocks network access, derived values are escaped or assigned with `textContent`, and no forbidden HTML-writing sink exists;
- initial state renders without console errors;
- every free-play control dispatches a defined action;
- every walkthrough references controls that exist and can reset cleanly;
- state and transition evidence refresh after each action;
- no production mutation or persistence exists.

Give the user the absolute path and tell them to double-click it. Do not create a branch, issue, ADR, commit, or durable repository note as part of handoff.

### 6. Capture the answer

When the prototype has answered its question, summarize in the conversation:

- the question;
- observed evidence;
- likely answer;
- remaining uncertainty;
- whether the pure logic appears worth lifting into production.

Then offer delete, temporary retain, absorb, or opt-in durable evidence. Each follow-up is a separate side effect and follows the authorization boundary in the parent skill.

## Anti-patterns

- Tests, production error handling, or generalized extension hooks.
- External libraries or assets that make the file stop working offline.
- Real APIs, databases, credentials, or personal data.
- DOM access inside the reducer/state machine.
- Guided scenarios with controls that do not exist in free play.
- Automatic branch creation or deletion because the artifact is described as throwaway.
- Shipping the HTML shell as production code. Only validated decisions and deliberately rewritten logic may graduate.
