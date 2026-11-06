import {
  SKILLS,
  students,
  recordKey,
  saveDraft,
  publish,
  sampleRecords,
  average,
  validRecords,
} from "./domain.js";
const $ = (s) => document.querySelector(s),
  storageKey = "only-coursebook-v1";
const esc = (v) =>
  String(v).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let records = sampleRecords(),
  selected = students[0].id,
  dirty = false,
  currentTerm = "Term 1",
  pendingNavigation = null;
try {
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    const value = JSON.parse(stored);
    if (!validRecords(value)) throw Error();
    records = value;
  }
} catch {
  $("#feedback").textContent =
    "Saved assessments could not be read. Sample records are shown; reset to replace the saved copy.";
}
function navigate(action) {
  if (dirty) {
    pendingNavigation = action;
    $("#discard-dialog").showModal();
  } else {
    action();
    render();
  }
}
const currentKey = () => recordKey(selected, $("#term").value);
function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(records));
    return true;
  } catch {
    $("#feedback").textContent =
      "Browser storage is unavailable. Changes will last only while this page is open.";
    return false;
  }
}
function render() {
  const term = $("#term").value,
    student = students.find((s) => s.id === selected),
    record = records[currentKey()];
  dirty = false;
  $("#term-card").textContent = term;
  $("#published-count").textContent = students.filter(
    (s) => records[recordKey(s.id, term)]?.published,
  ).length;
  $("#students").innerHTML = students
    .map(
      (s) =>
        `<button type="button" class="item ${s.id === selected ? "selected" : ""}" aria-pressed="${s.id === selected}" data-student="${s.id}"><span class="row"><span><strong>${s.name}</strong><span class="meta"> · ${s.group}</span></span><span class="pill">${records[recordKey(s.id, term)]?.published ? "Published" : records[recordKey(s.id, term)]?.draft ? "Draft" : "Not started"}</span></span></button>`,
    )
    .join("");
  document.querySelectorAll("[data-student]").forEach(
    (b) =>
      (b.onclick = () =>
        navigate(() => {
          selected = b.dataset.student;
        })),
  );
  $("#assessment-title").textContent = `${student.name} · ${term}`;
  $("#scores").innerHTML = SKILLS.map(
    (s, i) =>
      `<label class="field" for="score-${i}">${s}<input id="score-${i}" name="${s}" type="number" min="0" max="100" step="1" required value="${record?.draft?.scores[s] ?? ""}"></label>`,
  ).join("");
  $("#learning-note").value = record?.draft?.note ?? "";
  $("#assessment-error").textContent = "";
  $("#publish").disabled = !record?.draft;
  const report = record?.published;
  $("#report-state").textContent = report ? "Published" : "Not published";
  $("#print").disabled = !report;
  $("#report").innerHTML = report
    ? `<p class="eyebrow">Learning progress · ${term}</p><h2>${student.name}</h2><p class="subtle">${student.group} · Fictional sample learner</p><p><span class="result" id="report-average">${average(report.scores)}</span><span class="subtle"> / 100 average</span></p><table><thead><tr><th scope="col">Learning area</th><th scope="col">Score</th></tr></thead><tbody>${SKILLS.map((s) => `<tr><td>${s}</td><td>${report.scores[s]}</td></tr>`).join("")}</tbody></table><h3 style="margin-top:20px">Next steps</h3><p id="report-note">${esc(report.note)}</p><p class="subtle">Published ${esc(new Date(report.publishedAt).toLocaleDateString("en-GB"))}</p>`
    : '<div class="empty">No report published for this learner and term. Save a complete assessment and learning note, then publish it.</div>';
}
$("#assessment-form").addEventListener("input", () => {
  dirty = true;
  $("#publish").disabled = true;
  $("#feedback").textContent =
    "Unsaved assessment. Save before switching learners or publishing.";
});
$("#assessment-form").onsubmit = (e) => {
  e.preventDefault();
  try {
    const key = currentKey();
    records[key] = saveDraft(
      records[key] ?? {},
      Object.fromEntries(new FormData(e.target)),
      $("#learning-note").value,
    );
    const saved = persist();
    render();
    if (saved)
      $("#feedback").textContent =
        "Assessment saved. The published report has not changed.";
  } catch (err) {
    $("#assessment-error").textContent = err.message;
  }
};
$("#publish").onclick = () => {
  try {
    if (dirty) throw Error("Save your changes before publishing.");
    const key = currentKey();
    records[key] = publish(records[key]);
    const saved = persist();
    render();
    if (saved)
      $("#feedback").textContent =
        "Saved assessment published. The family report preview is updated.";
  } catch (err) {
    $("#assessment-error").textContent = err.message;
  }
};
$("#term").onchange = () => {
  const next = $("#term").value;
  $("#term").value = currentTerm;
  navigate(() => {
    currentTerm = next;
    $("#term").value = next;
  });
};
$("#keep-editing").onclick = () => {
  $("#discard-dialog").close();
  pendingNavigation = null;
};
$("#discard-changes").onclick = () => {
  $("#discard-dialog").close();
  pendingNavigation?.();
  pendingNavigation = null;
  render();
  $("#feedback").textContent = "Unsaved changes discarded.";
};
$("#print").onclick = () => window.print();
$("#reset").onclick = () => $("#reset-dialog").showModal();
$("#cancel-reset").onclick = () => $("#reset-dialog").close();
$("#confirm-reset").onclick = () => {
  records = sampleRecords();
  selected = students[0].id;
  currentTerm = "Term 1";
  $("#term").value = "Term 1";
  const saved = persist();
  $("#reset-dialog").close();
  render();
  if (saved) $("#feedback").textContent = "Sample assessments restored.";
};
render();
