const REPO_OWNER = "sundara-raghav";
const REPO_NAME = "Leetcode-problems";
const REPO_BRANCH = "main";
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
const RAW_BASE = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}`;
const ROOT_README_URL = `${RAW_BASE}/README.md`;
const STATS_URL = `${RAW_BASE}/stats.json`;

const state = {
  problems: [],
  filtered: [],
  activeDifficulty: "All",
  search: "",
  sort: "folder-asc",
  selectedFolder: null,
  detailCache: new Map(),
  readmeCache: null,
  statsCache: null,
  topicMap: new Map(),
};

const nodes = {
  searchInput: document.getElementById("search-input"),
  difficultyFilter: document.getElementById("difficulty-filter"),
  sortFilter: document.getElementById("sort-filter"),
  refreshButton: document.getElementById("refresh-data"),
  clearFiltersButton: document.getElementById("clear-filters"),
  statTotal: document.getElementById("stat-total"),
  statDifficulty: document.getElementById("stat-difficulty"),
  statSync: document.getElementById("stat-sync"),
  resultsMeta: document.getElementById("results-meta"),
  questionsGrid: document.getElementById("questions-grid"),
  detailStatus: document.getElementById("detail-status"),
  detailEmpty: document.getElementById("detail-empty"),
  detailBody: document.getElementById("detail-body"),
  detailFolder: document.getElementById("detail-folder"),
  detailTitle: document.getElementById("detail-title"),
  detailDifficulty: document.getElementById("detail-difficulty"),
  detailDescription: document.getElementById("detail-description"),
  detailSubmitted: document.getElementById("detail-submitted"),
  detailFiles: document.getElementById("detail-files"),
  detailTopicsList: document.getElementById("detail-topics-list"),
  detailFilesList: document.getElementById("detail-files-list"),
  detailFolderLink: document.getElementById("detail-folder-link"),
  detailCodeLink: document.getElementById("detail-code-link"),
  detailCode: document.getElementById("detail-code"),
};

const difficultyOrder = new Map([
  ["easy", 1],
  ["medium", 2],
  ["hard", 3],
]);

boot().catch((error) => {
  nodes.questionsGrid.innerHTML = `<div class="empty-state">Failed to load repository data: ${escapeHtml(error.message)}</div>`;
  nodes.resultsMeta.textContent = "Unable to load data.";
  nodes.statSync.textContent = "Load failed";
  console.error(error);
});

async function boot(forceRefresh = false) {
  setStatus("Loading repository data…");
  nodes.questionsGrid.innerHTML = '<div class="loader">Loading solved questions from GitHub…</div>';

  const [statsText, readmeText] = await Promise.all([
    fetchText(STATS_URL),
    fetchText(ROOT_README_URL),
  ]);

  state.statsCache = JSON.parse(statsText);
  state.readmeCache = readmeText;
  state.topicMap = parseTopicMap(readmeText);
  state.problems = buildProblems(state.statsCache, state.topicMap);

  populateFilters();
  renderSummary(state.problems);
  applyFilters();
  nodes.statSync.textContent = `Synced ${new Date().toLocaleString()}`;
  setStatus(forceRefresh ? "Refreshed" : "Ready");
}

function buildProblems(statsPayload, topicMap) {
  const leetcode = statsPayload.leetcode || {};
  const shas = leetcode.shas || {};

  return Object.entries(shas)
    .filter(([key, value]) => key !== "README.md" && value && typeof value === "object" && value.difficulty)
    .map(([folder, meta]) => {
      const codeFiles = Object.keys(meta).filter((fileName) => fileName !== "README.md" && /\.[a-z]+$/i.test(fileName));
      const readmeEntry = shas[folder]?.["README.md"];
      return {
        folder,
        title: folderToTitle(folder),
        difficulty: String(meta.difficulty || "unknown").toLowerCase(),
        topics: Array.from(topicMap.get(folder) || []).sort((a, b) => a.localeCompare(b)),
        readmeSha: readmeEntry || null,
        codeFiles,
        primaryCodeFile: codeFiles[0] || null,
        fileCount: codeFiles.length + 1,
      };
    })
    .sort((left, right) => left.folder.localeCompare(right.folder));
}

function populateFilters() {
  const difficultyOptions = ["All", "easy", "medium", "hard"];

  nodes.difficultyFilter.innerHTML = difficultyOptions
    .map((difficulty) => `<option value="${difficulty}">${capitalize(difficulty)}</option>`)
    .join("");

  nodes.difficultyFilter.value = state.activeDifficulty;
}

function renderSummary(problems) {
  const difficultyCounts = problems.reduce(
    (counts, problem) => {
      counts[problem.difficulty] = (counts[problem.difficulty] || 0) + 1;
      return counts;
    },
    { easy: 0, medium: 0, hard: 0 },
  );

  nodes.statTotal.textContent = String(problems.length);
  nodes.statDifficulty.textContent = `${difficultyCounts.easy} / ${difficultyCounts.medium} / ${difficultyCounts.hard}`;
}

function applyFilters() {
  const search = state.search.trim().toLowerCase();

  state.filtered = state.problems
    .filter((problem) => {
      const matchesSearch = !search || [problem.title, problem.folder, problem.difficulty, problem.topics.join(" "), problem.codeFiles.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(search);
      const matchesDifficulty = state.activeDifficulty === "All" || problem.difficulty === state.activeDifficulty;
      return matchesSearch && matchesDifficulty;
    })
    .sort((left, right) => sortProblems(left, right, state.sort));

  nodes.resultsMeta.textContent = `${state.filtered.length} of ${state.problems.length} solved questions shown`;
  renderQuestions();

  if (!state.filtered.length) {
    nodes.questionsGrid.innerHTML = '<div class="empty-state">No questions match the current filters.</div>';
    showEmptyDetail();
    return;
  }

  if (!state.selectedFolder || !state.filtered.some((problem) => problem.folder === state.selectedFolder)) {
    selectProblem(state.filtered[0].folder);
  }
}

function renderQuestions() {
  nodes.questionsGrid.innerHTML = state.filtered
    .map((problem) => {
      const topics = problem.topics.length ? problem.topics : ["Uncategorized"];
      return `
        <article class="card question-card ${problem.folder === state.selectedFolder ? 'is-selected' : ''}" data-folder="${escapeHtml(problem.folder)}">
          <div class="question-head">
            <span class="difficulty-badge difficulty-${escapeHtml(problem.difficulty)}">${capitalize(problem.difficulty)}</span>
            <span class="question-folder">${escapeHtml(problem.folder)}</span>
          </div>
          <h3 class="question-title">${escapeHtml(problem.title)}</h3>
          <p class="question-meta">${escapeHtml(problem.codeFiles[0] || 'solution file missing')} • ${problem.fileCount} files</p>
          <div class="question-topics">
            ${topics.slice(0, 4).map((topic) => `<span class="topic-pill">${escapeHtml(topic)}</span>`).join("")}
          </div>
        </article>
      `;
    })
    .join("");

  nodes.questionsGrid.querySelectorAll("[data-folder]").forEach((card) => {
    card.addEventListener("click", () => selectProblem(card.dataset.folder));
  });
}

async function selectProblem(folder) {
  const problem = state.problems.find((item) => item.folder === folder);
  if (!problem) {
    return;
  }

  state.selectedFolder = folder;
  renderQuestions();
  nodes.detailStatus.textContent = "Loading details…";
  showDetailSkeleton(problem);

  const detail = await loadProblemDetail(problem);
  renderProblemDetail(detail);
}

async function loadProblemDetail(problem) {
  if (state.detailCache.has(problem.folder)) {
    return state.detailCache.get(problem.folder);
  }

  const [readmeHtml, commitInfo] = await Promise.all([
    fetchText(`${RAW_BASE}/${problem.folder}/README.md`),
    problem.primaryCodeFile
      ? fetchJson(`/commits?path=${encodeURIComponent(`${problem.folder}/${problem.primaryCodeFile}`)}&per_page=1`)
      : Promise.resolve([]),
  ]);

  const fileList = [
    { name: "README.md", type: "file", downloadUrl: `${RAW_BASE}/${problem.folder}/README.md` },
    ...(problem.primaryCodeFile ? [{ name: problem.primaryCodeFile, type: "file", downloadUrl: `${RAW_BASE}/${problem.folder}/${problem.primaryCodeFile}` }] : []),
  ];

  const fallbackCodeFile = problem.primaryCodeFile ? {
    name: problem.primaryCodeFile,
    type: "file",
    downloadUrl: `${RAW_BASE}/${problem.folder}/${problem.primaryCodeFile}`,
  } : null;

  const codeFile = fileList.find((entry) => isCodeFile(entry.name) && entry.name !== "README.md")
    || fileList.find((entry) => entry.name === problem.primaryCodeFile)
    || fallbackCodeFile
    || fileList.find((entry) => entry.name !== "README.md");

  const readmeDoc = parseHtml(readmeHtml);
  const title = readmeDoc.querySelector("h2")?.textContent?.trim() || problem.title;
  const difficulty = readmeDoc.querySelector("h3")?.textContent?.trim() || capitalize(problem.difficulty);
  const description = extractDescription(readmeDoc);
  const submittedAt = commitInfo[0]?.commit?.author?.date || commitInfo[0]?.commit?.committer?.date || null;
  const codeText = codeFile?.name
    ? await fetchSolutionText(problem.folder, codeFile.name, codeFile.downloadUrl)
    : "";

  const detail = {
    folder: problem.folder,
    title,
    difficulty,
    description,
    submittedAt,
    fileList,
    topics: problem.topics,
    codeFile: codeFile?.name || problem.primaryCodeFile || "",
    codeText,
    folderUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}/tree/${REPO_BRANCH}/${problem.folder}`,
    codeUrl: codeFile?.downloadUrl || `${RAW_BASE}/${problem.folder}/${problem.primaryCodeFile || ""}`,
  };

  state.detailCache.set(problem.folder, detail);
  return detail;
}

async function fetchSolutionText(folder, fileName, rawUrl) {
  const apiUrl = `${API_BASE}/contents/${folder}/${fileName}?ref=${REPO_BRANCH}`;

  try {
    const response = await fetch(apiUrl, {
      headers: { Accept: "application/vnd.github+json" },
    });

    if (response.ok) {
      const payload = await response.json();
      if (payload?.content && payload.encoding === "base64") {
        return decodeBase64(payload.content);
      }
    }
  } catch (error) {
    console.warn("GitHub contents API code fetch failed, falling back to raw URL.", error);
  }

  return rawUrl ? fetchText(rawUrl) : "";
}

function renderProblemDetail(detail) {
  nodes.detailEmpty.classList.add("is-hidden");
  nodes.detailBody.classList.remove("is-hidden");
  nodes.detailStatus.textContent = "Loaded";
  nodes.detailFolder.textContent = detail.folder;
  nodes.detailTitle.textContent = detail.title;
  nodes.detailDifficulty.textContent = detail.difficulty;
  nodes.detailDifficulty.className = `difficulty-badge difficulty-${String(detail.difficulty).toLowerCase()}`;
  nodes.detailDescription.textContent = detail.description || "README summary unavailable.";
  nodes.detailSubmitted.textContent = detail.submittedAt ? new Date(detail.submittedAt).toLocaleString() : "Not available";
  nodes.detailFiles.textContent = `${detail.fileList.length} item(s)`;
  nodes.detailTopicsList.textContent = detail.topics.length ? detail.topics.join(", ") : "Uncategorized";
  nodes.detailFolderLink.href = detail.folderUrl;
  nodes.detailCodeLink.href = detail.codeUrl;
  nodes.detailCodeLink.textContent = detail.codeFile ? `Open raw ${detail.codeFile}` : "Open raw code";
  nodes.detailFilesList.innerHTML = detail.fileList
    .map((file) => `<li><span>${escapeHtml(file.name)}</span><span>${escapeHtml(file.type)}</span></li>`)
    .join("");
  nodes.detailCode.textContent = detail.codeText || "No code file found for this question.";
}

function showDetailSkeleton(problem) {
  nodes.detailEmpty.classList.add("is-hidden");
  nodes.detailBody.classList.remove("is-hidden");
  nodes.detailFolder.textContent = problem.folder;
  nodes.detailTitle.textContent = problem.title;
  nodes.detailDifficulty.textContent = capitalize(problem.difficulty);
  nodes.detailDifficulty.className = `difficulty-badge difficulty-${problem.difficulty}`;
  nodes.detailDescription.textContent = "Loading README summary and submission data…";
  nodes.detailSubmitted.textContent = "Loading…";
  nodes.detailFiles.textContent = "Loading…";
  nodes.detailTopicsList.textContent = problem.topics.join(", ") || "Loading…";
  nodes.detailFilesList.innerHTML = '<li><span>Loading files</span><span>GitHub API</span></li>';
  nodes.detailCode.textContent = "Loading solution code…";
  nodes.detailFolderLink.href = `https://github.com/${REPO_OWNER}/${REPO_NAME}/tree/${REPO_BRANCH}/${problem.folder}`;
  nodes.detailCodeLink.href = problem.primaryCodeFile ? `${RAW_BASE}/${problem.folder}/${problem.primaryCodeFile}` : `https://github.com/${REPO_OWNER}/${REPO_NAME}/tree/${REPO_BRANCH}/${problem.folder}`;
  nodes.detailCodeLink.textContent = problem.primaryCodeFile ? `Open raw ${problem.primaryCodeFile}` : "Open raw code";
}

function showEmptyDetail() {
  nodes.detailStatus.textContent = "Idle";
  nodes.detailEmpty.classList.remove("is-hidden");
  nodes.detailBody.classList.add("is-hidden");
}

function setStatus(message) {
  nodes.detailStatus.textContent = message;
}

function parseTopicMap(readmeText) {
  const map = new Map();
  const lines = readmeText.split(/\r?\n/);
  let currentTopic = null;

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)$/);
    if (headingMatch && headingMatch[1] !== "LeetCode Topics") {
      currentTopic = headingMatch[1].trim();
      continue;
    }

    if (!currentTopic) {
      continue;
    }

    const folderMatches = Array.from(line.matchAll(/\[([0-9]{4}-[^\]]+)\]\(/g));
    for (const match of folderMatches) {
      const folder = match[1];
      if (folder === "README.md") {
        continue;
      }

      if (!map.has(folder)) {
        map.set(folder, new Set());
      }

      map.get(folder).add(currentTopic);
    }
  }

  return map;
}

function parseHtml(htmlText) {
  return new DOMParser().parseFromString(htmlText, "text/html");
}

function extractDescription(document) {
  const paragraph = document.querySelector("h2 + h3 + hr + p") || document.querySelector("hr + p") || document.querySelector("p");
  return paragraph?.textContent?.replace(/\s+/g, " ").trim() || "";
}

function folderToTitle(folder) {
  return folder
    .replace(/^\d+-/, "")
    .split("-")
    .map((segment) => segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : segment)
    .join(" ");
}

function sortProblems(left, right, sortMode) {
  if (sortMode === "title-asc") {
    return left.title.localeCompare(right.title);
  }

  if (sortMode === "difficulty-asc") {
    return (difficultyOrder.get(left.difficulty) || 99) - (difficultyOrder.get(right.difficulty) || 99) || left.folder.localeCompare(right.folder);
  }

  if (sortMode === "recent-desc") {
    const leftDate = state.detailCache.get(left.folder)?.submittedAt ? Date.parse(state.detailCache.get(left.folder).submittedAt) : 0;
    const rightDate = state.detailCache.get(right.folder)?.submittedAt ? Date.parse(state.detailCache.get(right.folder).submittedAt) : 0;
    return rightDate - leftDate || left.folder.localeCompare(right.folder);
  }

  return left.folder.localeCompare(right.folder);
}

function isCodeFile(fileName) {
  return /\.(java|py|cpp|c|cs|go|js|ts|tsx|jsx|rb|rs|kt|swift|scala|sql)$/i.test(fileName);
}

function capitalize(value) {
  if (value === "All") {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function fetchText(path) {
  const isDirectUrl = path.startsWith("http") && !path.includes("api.github.com");
  const response = await fetch(path.startsWith("http") ? path : `${API_BASE}${path}`, {
    headers: isDirectUrl ? undefined : { Accept: "application/vnd.github.object+json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }

  if (isDirectUrl) {
    return response.text();
  }

  const payload = await response.json();

  if (typeof payload === "string") {
    return payload;
  }

  if (payload.content && payload.encoding === "base64") {
    return decodeBase64(payload.content);
  }

  if (payload.download_url) {
    const direct = await fetch(payload.download_url);
    if (!direct.ok) {
      throw new Error(`Failed to fetch ${payload.download_url}: ${direct.status}`);
    }
    return direct.text();
  }

  return JSON.stringify(payload);
}

async function fetchJson(path) {
  const response = await fetch(path.startsWith("http") ? path : `${API_BASE}${path}`, {
    headers: { Accept: "application/vnd.github.object+json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }

  return response.json();
}

function decodeBase64(base64Text) {
  const binary = atob(base64Text.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

nodes.searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  applyFilters();
});

nodes.difficultyFilter.addEventListener("change", (event) => {
  state.activeDifficulty = event.target.value;
  applyFilters();
});

nodes.sortFilter.addEventListener("change", (event) => {
  state.sort = event.target.value;
  applyFilters();
});

nodes.refreshButton.addEventListener("click", () => boot(true));

nodes.clearFiltersButton.addEventListener("click", () => {
  state.search = "";
  state.activeDifficulty = "All";
  state.sort = "folder-asc";
  nodes.searchInput.value = "";
  nodes.difficultyFilter.value = "All";
  nodes.sortFilter.value = "folder-asc";
  populateFilters();
  applyFilters();
});