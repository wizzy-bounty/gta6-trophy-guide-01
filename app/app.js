// Leonida Platinum Atlas — GTA 6 trophy tracker. Loads the trophy data, renders the
// checklist and roadmap, and keeps earned trophies plus the spoiler setting in
// localStorage. Everything runs offline from this app's own files.
const STORE_KEY = "leonida-platinum-atlas-v1";
const CATEGORIES = [
  ["all", "All"],
  ["story", "Story"],
  ["collectibles", "Collectibles"],
  ["activities", "Activities"],
  ["robberies", "Robberies"],
  ["money", "Money"],
  ["events", "Events"],
  ["online", "Online"],
];
const CATEGORY_LABELS = Object.fromEntries(CATEGORIES);

const state = {
  data: null,
  earned: new Set(),
  spoiler: true,
  category: "all",
  grade: "all",
  missableOnly: false,
  hideEarned: false,
  query: "",
  view: "checklist",
  detailId: null,
};

const $ = (id) => document.getElementById(id);

function readStoredProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { earned: [], spoiler: true };
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned : [],
      spoiler: parsed.spoiler !== false,
    };
  } catch {
    return { earned: [], spoiler: true };
  }
}

function saveStoredProgress() {
  try {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({ earned: [...state.earned].sort((a, b) => a - b), spoiler: state.spoiler }),
    );
  } catch {
    // Private mode or storage full: the tracker still works for this visit.
  }
}

function applyDeepLinks() {
  const params = new URLSearchParams(location.search);
  if (params.has("earned")) {
    state.earned = new Set(
      params.get("earned").split(",").map((s) => Number(s)).filter((n) => Number.isInteger(n)),
    );
    saveStoredProgress();
  }
  if (params.has("filter")) {
    const f = params.get("filter");
    if (f === "missable") state.missableOnly = true;
    else if (CATEGORY_LABELS[f]) state.category = f;
  }
  if (params.has("grade") && ["platinum", "gold", "silver", "bronze"].includes(params.get("grade"))) {
    state.grade = params.get("grade");
  }
  if (params.has("missable") && params.get("missable") === "1") state.missableOnly = true;
  if (params.has("spoiler")) state.spoiler = params.get("spoiler") !== "off";
  if (params.has("search")) state.query = params.get("search");
  if (params.has("view") && params.get("view") === "roadmap") state.view = "roadmap";
  if (params.has("detail")) {
    const n = Number(params.get("detail"));
    if (Number.isInteger(n)) state.detailId = n;
  }
}

function trophyIsSpoilerHidden(trophy) {
  return state.spoiler && trophy.hidden && !state.earned.has(trophy.id);
}

function visibleTrophies() {
  const q = state.query.trim().toLowerCase();
  return state.data.trophies.filter((trophy) => {
    if (state.category === "online") return false;
    if (state.category !== "all" && trophy.category !== state.category) return false;
    if (state.grade !== "all" && trophy.grade !== state.grade) return false;
    if (state.missableOnly && !trophy.missable) return false;
    if (state.hideEarned && state.earned.has(trophy.id)) return false;
    if (q) {
      const hay = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.steps.join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderCategoryChips() {
  const host = $("category-chips");
  host.innerHTML = "";
  for (const [value, label] of CATEGORIES) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.dataset.category = value;
    if (value === state.category) button.classList.add("active");
    button.addEventListener("click", () => {
      state.category = value;
      renderCategoryChips();
      renderTrophyList();
    });
    host.appendChild(button);
  }
}

function renderProgress() {
  const total = state.data.trophies.length;
  const earned = state.earned.size;
  const pct = total ? Math.round((earned / total) * 100) : 0;
  $("earned-count").textContent = `${earned} of ${total} earned`;
  $("earned-pct").textContent = `${pct}%`;
  $("progress-fill").style.width = `${pct}%`;
  const byGrade = {};
  for (const trophy of state.data.trophies) {
    byGrade[trophy.grade] = byGrade[trophy.grade] || { got: 0, total: 0 };
    byGrade[trophy.grade].total += 1;
    if (state.earned.has(trophy.id)) byGrade[trophy.grade].got += 1;
  }
  $("progress-grades").textContent = ["platinum", "gold", "silver", "bronze"]
    .map((g) => `${byGrade[g].got}/${byGrade[g].total} ${g}`)
    .join(" · ");
}

function trophyRow(trophy) {
  const li = document.createElement("li");
  li.className = "trophy";
  li.dataset.id = String(trophy.id);
  if (state.earned.has(trophy.id)) li.classList.add("earned");

  const check = document.createElement("input");
  check.type = "checkbox";
  check.checked = state.earned.has(trophy.id);
  check.setAttribute("aria-label", `Earned: ${trophy.name}`);
  check.addEventListener("change", () => {
    if (check.checked) state.earned.add(trophy.id);
    else state.earned.delete(trophy.id);
    saveStoredProgress();
    renderProgress();
    renderTrophyList();
  });
  li.appendChild(check);

  const head = document.createElement("div");
  head.className = "trophy-head";
  const name = document.createElement("span");
  name.className = "trophy-name";
  name.textContent = trophy.name;
  const badge = document.createElement("span");
  badge.className = `badge ${trophy.grade}`;
  badge.textContent = trophy.grade;
  head.append(badge, name);
  if (trophy.missable) {
    const miss = document.createElement("span");
    miss.className = "tag missable";
    miss.textContent = "Possibly missable";
    head.appendChild(miss);
  }
  if (trophy.hidden) {
    const hid = document.createElement("span");
    hid.className = "tag hidden";
    hid.textContent = "Hidden";
    head.appendChild(hid);
  }
  li.appendChild(head);

  const desc = document.createElement("p");
  desc.className = "trophy-desc";
  desc.textContent = trophy.description;
  li.appendChild(desc);

  const guide = document.createElement("p");
  guide.className = "trophy-guide";
  guide.textContent = trophy.guide;
  li.appendChild(guide);

  const steps = document.createElement("ol");
  steps.className = "trophy-steps";
  for (const step of trophy.steps) {
    const item = document.createElement("li");
    item.textContent = step;
    steps.appendChild(item);
  }
  li.appendChild(steps);

  const meta = document.createElement("div");
  meta.className = "trophy-meta";
  const cat = document.createElement("span");
  cat.className = "tag";
  cat.textContent = CATEGORY_LABELS[trophy.category] || trophy.category;
  meta.appendChild(cat);
  if (trophy.note) {
    const note = document.createElement("span");
    note.className = "tag unconfirmed";
    note.textContent = "Unconfirmed at launch";
    meta.appendChild(note);
  }
  const srcLabel = document.createElement("span");
  srcLabel.textContent = "Sources: ";
  meta.appendChild(srcLabel);
  trophy.sources.forEach((source, i) => {
    if (i > 0) meta.appendChild(document.createTextNode(", "));
    const link = document.createElement("a");
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = source.name;
    meta.appendChild(link);
  });
  li.appendChild(meta);

  const actions = document.createElement("div");
  actions.className = "trophy-actions";
  const detailBtn = document.createElement("button");
  detailBtn.type = "button";
  detailBtn.textContent = "Details";
  detailBtn.addEventListener("click", () => openTrophyDetail(trophy.id));
  actions.appendChild(detailBtn);
  li.appendChild(actions);

  if (trophyIsSpoilerHidden(trophy)) {
    name.classList.add("spoiler-blur");
    desc.classList.add("spoiler-blur");
  }
  return li;
}

function renderTrophyList() {
  const list = visibleTrophies();
  const host = $("trophy-list");
  host.innerHTML = "";
  for (const trophy of list) host.appendChild(trophyRow(trophy));
  $("result-line").textContent = `Showing ${list.length} of ${state.data.trophies.length} trophies`;
  $("empty").hidden = state.category !== "online";
  const hiddenCount = state.data.trophies.filter((t) => t.hidden).length;
  $("list-note").textContent =
    `${hiddenCount} trophies stay hidden until earned — turn off "Hide story spoilers" to reveal them, or earn them in-game.`;
}

function renderRoadmap() {
  const host = $("phases");
  host.innerHTML = "";
  for (const phase of state.data.roadmap) {
    const item = document.createElement("li");
    const title = document.createElement("h3");
    title.textContent = `Phase ${phase.phase}: ${phase.title}`;
    const goal = document.createElement("p");
    goal.className = "phase-goal";
    goal.textContent = phase.goal;
    const steps = document.createElement("ul");
    for (const step of phase.items) {
      const stepItem = document.createElement("li");
      stepItem.textContent = step;
      steps.appendChild(stepItem);
    }
    item.append(title, goal, steps);
    host.appendChild(item);
  }
}

function openTrophyDetail(id) {
  const trophy = state.data.trophies.find((t) => t.id === id);
  if (!trophy) return;
  state.detailId = id;
  const body = $("detail-body");
  body.innerHTML = "";
  const title = document.createElement("h3");
  title.textContent = trophy.name;
  const badge = document.createElement("span");
  badge.className = `badge ${trophy.grade}`;
  badge.textContent = trophy.grade;
  const desc = document.createElement("p");
  desc.className = "detail-desc";
  desc.textContent = trophy.description;
  const guide = document.createElement("p");
  guide.className = "detail-guide";
  guide.textContent = trophy.guide;
  const steps = document.createElement("ol");
  for (const step of trophy.steps) {
    const item = document.createElement("li");
    item.textContent = step;
    steps.appendChild(item);
  }
  body.append(title, badge, desc, guide, steps);
  if (trophy.missable) {
    const warn = document.createElement("p");
    warn.className = "detail-note";
    warn.textContent =
      "Possibly missable: do Lucia's balcony meditation in Chapter 1 (the morning after Down to Earth) and keep a Chapter 1 save until this trophy pops.";
    body.appendChild(warn);
  }
  if (trophy.note) {
    const note = document.createElement("p");
    note.className = "detail-note";
    note.textContent = trophy.note;
    body.appendChild(note);
  }
  const srcLine = document.createElement("p");
  srcLine.textContent = "Sources: ";
  trophy.sources.forEach((source, i) => {
    if (i > 0) srcLine.appendChild(document.createTextNode(", "));
    const link = document.createElement("a");
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = source.name;
    srcLine.appendChild(link);
  });
  body.appendChild(srcLine);
  $("detail").hidden = false;
  $("detail").scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeTrophyDetail() {
  state.detailId = null;
  $("detail").hidden = true;
}

function exportProgress() {
  const blob = new Blob(
    [JSON.stringify({ earned: [...state.earned].sort((a, b) => a - b), exported: new Date().toISOString() }, null, 2)],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "leonida-platinum-atlas-progress.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importProgressFile(file) {
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const ids = Array.isArray(parsed.earned) ? parsed.earned : parsed;
      if (!Array.isArray(ids)) throw new Error("not an array");
      const valid = new Set(state.data.trophies.map((t) => t.id));
      state.earned = new Set(ids.map(Number).filter((n) => valid.has(n)));
      saveStoredProgress();
      renderProgress();
      renderTrophyList();
      $("result-line").textContent = `Imported ${state.earned.size} earned trophies.`;
    } catch {
      $("result-line").textContent = "That file is not a Leonida Platinum Atlas export.";
    }
  });
  reader.readAsText(file);
}

function syncToolbar() {
  $("search").value = state.query;
  $("grade-filter").value = state.grade;
  $("missable-only").checked = state.missableOnly;
  $("spoiler").checked = state.spoiler;
  $("hide-earned").checked = state.hideEarned;
  for (const button of document.querySelectorAll("#view-switch button")) {
    button.classList.toggle("active", button.dataset.view === state.view);
  }
  $("roadmap").hidden = state.view !== "roadmap";
  $("tracker").hidden = state.view !== "checklist";
}

function wireToolbar() {
  $("search").addEventListener("input", (event) => {
    state.query = event.target.value;
    renderTrophyList();
  });
  $("grade-filter").addEventListener("change", (event) => {
    state.grade = event.target.value;
    renderTrophyList();
  });
  $("missable-only").addEventListener("change", (event) => {
    state.missableOnly = event.target.checked;
    renderTrophyList();
  });
  $("spoiler").addEventListener("change", (event) => {
    state.spoiler = event.target.checked;
    saveStoredProgress();
    renderTrophyList();
  });
  $("hide-earned").addEventListener("change", (event) => {
    state.hideEarned = event.target.checked;
    renderTrophyList();
  });
  $("export-btn").addEventListener("click", exportProgress);
  $("import-btn").addEventListener("click", () => $("import-file").click());
  $("import-file").addEventListener("change", (event) => {
    if (event.target.files && event.target.files[0]) importProgressFile(event.target.files[0]);
    event.target.value = "";
  });
  $("detail-close").addEventListener("click", closeTrophyDetail);
  for (const button of document.querySelectorAll("#view-switch button")) {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      syncToolbar();
    });
  }
}

async function initTracker() {
  const stored = readStoredProgress();
  state.earned = new Set(stored.earned);
  state.spoiler = stored.spoiler;
  const response = await fetch("data/trophies.json");
  state.data = await response.json();
  applyDeepLinks();
  wireToolbar();
  renderCategoryChips();
  renderRoadmap();
  renderProgress();
  syncToolbar();
  renderTrophyList();
  if (state.detailId) openTrophyDetail(state.detailId);
}

initTracker();
