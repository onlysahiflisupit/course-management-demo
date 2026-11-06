# Assessment design

## Separation of concerns

`src/domain.js` owns score parsing, averages, record keys and immutable publication snapshots. `src/app.js` owns the interface and local persistence. Tests exercise the domain without a browser; the separate QA repository exercises user workflows in Chromium.

## Assessment rules

Six named areas share a 0–100 integer scale. A blank score is unknown, not zero. All six values are required to save. An average uses all six areas and rounds to one decimal. Learning notes may be short while drafting; publication requires at least 10 characters.

A record key combines a stable fictional learner ID with Term 1 or Term 2. Publishing deep-copies the saved assessment. Editing a draft must not mutate an already published snapshot. The publish button is disabled while the form has unsaved changes. Switching learner or reporting period asks whether to discard those changes.

## Scope and tradeoffs

“Family report preview” describes what a family could see after publication, but there is no login boundary here. It is a UI preview in the same browser. A production portal must retrieve only authorised, published records from a server. Browser printing provides a simple PDF path; exact printer margins and fonts can vary.

The fixed rubric and sample terms keep the example focused. A production course system may need configurable rubrics, grading scales, accommodations and approval roles.
