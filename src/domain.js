export const SKILLS = [
  "Vocabulary",
  "Listening",
  "Speaking",
  "Reading",
  "Writing",
  "Conversation",
];
export const TERMS = ["Term 1", "Term 2"];
export const students = [
  { id: "S-101", name: "Avery Tan", group: "Foundation A" },
  { id: "S-102", name: "Jamie Noor", group: "Foundation A" },
  { id: "S-103", name: "Riley Chen", group: "Foundation B" },
  { id: "S-104", name: "Morgan Lim", group: "Foundation B" },
];
export const recordKey = (id, term) => `${id}:${term}`;
export function parseScores(raw) {
  const scores = {};
  for (const skill of SKILLS) {
    const value = raw[skill];
    if (value === null || value === undefined || String(value).trim() === "")
      throw new Error(`Enter a score for ${skill}.`);
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0 || n > 100)
      throw new Error(`${skill} must be a whole number from 0 to 100.`);
    scores[skill] = n;
  }
  return scores;
}
export function average(scores) {
  return (
    Math.round(
      (SKILLS.reduce((sum, s) => sum + scores[s], 0) / SKILLS.length) * 10,
    ) / 10
  );
}
export function saveDraft(previous, raw, note, now = new Date().toISOString()) {
  return {
    ...previous,
    draft: {
      scores: parseScores(raw),
      note: String(note ?? "")
        .trim()
        .slice(0, 1500),
      savedAt: now,
    },
  };
}
export function publish(record, now = new Date().toISOString()) {
  if (!record?.draft) throw new Error("Save a complete assessment first.");
  parseScores(record.draft.scores);
  if (record.draft.note.length < 10)
    throw new Error(
      "Add a learning note of at least 10 characters before publishing.",
    );
  return {
    ...record,
    published: { ...structuredClone(record.draft), publishedAt: now },
  };
}
export function sampleRecords() {
  const result = {};
  students.forEach((s, i) => {
    const scores = Object.fromEntries(
      SKILLS.map((k, j) => [k, 65 + i * 4 + j * 2]),
    );
    const record = saveDraft(
      {},
      scores,
      "A steady start. Practise describing a daily routine aloud, then write three sentences using the same vocabulary.",
      "2026-11-03T08:00:00.000Z",
    );
    result[recordKey(s.id, "Term 1")] = publish(
      record,
      "2026-11-04T08:00:00.000Z",
    );
  });
  return result;
}
export function validRecords(records) {
  if (!records || typeof records !== "object" || Array.isArray(records))
    return false;
  try {
    for (const [key, record] of Object.entries(records)) {
      if (!students.some((s) => TERMS.some((t) => recordKey(s.id, t) === key)))
        return false;
      for (const kind of ["draft", "published"])
        if (record[kind]) {
          parseScores(record[kind].scores);
          if (
            typeof record[kind].note !== "string" ||
            typeof record[kind].savedAt !== "string"
          )
            return false;
          if (
            kind === "published" &&
            typeof record[kind].publishedAt !== "string"
          )
            return false;
        }
    }
    return true;
  } catch {
    return false;
  }
}
