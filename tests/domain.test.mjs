import test from "node:test";
import assert from "node:assert/strict";
import {
  SKILLS,
  parseScores,
  average,
  saveDraft,
  publish,
  sampleRecords,
  recordKey,
  validRecords,
} from "../src/domain.js";
const scores = (n) => Object.fromEntries(SKILLS.map((k) => [k, n]));
test("both inclusive boundaries are accepted", () => {
  assert.equal(average(parseScores(scores(0))), 0);
  assert.equal(average(parseScores(scores(100))), 100);
});
test("blank does not silently become zero", () => {
  for (const value of ["", " ", null, undefined])
    assert.throws(() => parseScores({ ...scores(80), Writing: value }));
});
test("out-of-range, decimal and nonnumeric scores are rejected", () => {
  for (const value of [-1, 101, 75.5, "NaN", "eighty"])
    assert.throws(() => parseScores({ ...scores(80), Speaking: value }));
});
test("published snapshots cannot be changed by later draft edits", () => {
  const old = publish(
    saveDraft({}, scores(70), "Practise a short daily conversation."),
  );
  const updated = saveDraft(
    old,
    scores(90),
    "Continue with a longer conversation.",
  );
  assert.equal(updated.published.scores.Reading, 70);
  assert.equal(updated.draft.scores.Reading, 90);
});
test("publishing requires a saved assessment and meaningful note", () => {
  assert.throws(() => publish({}));
  assert.throws(() => publish(saveDraft({}, scores(70), "Good")));
});
test("publishing replaces the snapshot with a deep copy", () => {
  const draft = saveDraft(
    {},
    scores(70),
    "Practise reading one paragraph aloud.",
  );
  const result = publish(draft);
  draft.draft.scores.Reading = 10;
  assert.equal(result.published.scores.Reading, 70);
});
test("student and period keys do not overlap", () => {
  assert.notEqual(recordKey("S-101", "Term 1"), recordKey("S-101", "Term 2"));
  assert.notEqual(recordKey("S-101", "Term 1"), recordKey("S-102", "Term 1"));
});
test("average uses all six areas and rounds to one decimal", () => {
  assert.equal(average({ ...scores(80), Writing: 81 }), 80.2);
});
test("persisted data validates student IDs and score shape", () => {
  assert.equal(validRecords(sampleRecords()), true);
  assert.equal(validRecords({ "unknown:Term 1": {} }), false);
  assert.equal(validRecords(null), false);
  assert.equal(
    validRecords({ "S-101:Term 1": { draft: { scores: {}, note: "" } } }),
    false,
  );
});
