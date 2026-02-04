// ==================== Configuration ====================
const CONFIG = {
    owner: 'sundara-raghav',
    repo: 'Leetcode-problems',
    branch: 'main',
    apiBase: 'https://api.github.com',
    itemsPerPage: 100
};

const CACHE_KEY = 'leetcode_dashboard_cache_v1';
const CACHE_TTL_MS = 60 * 1000; // 1 minute to reduce desktop staleness
const DEVICE_TYPE_DESKTOP = 'desktop';
const DEVICE_TYPE_MOBILE = 'mobile';

// ==================== Global State ====================
let allProblems = [];
let commits = [];
let topicsMap = {};

// ==================== Topic Keywords Mapping ====================
const TOPIC_KEYWORDS = {
    'Arrays': ['array', 'two-sum', 'container', 'sorted-array', 'rotate', 'majority-element'],
    'Strings': ['string', 'palindrome', 'substring', 'anagram', 'prefix', 'roman'],
    'Linked List': ['linked-list', 'node', 'cycle', 'reverse-list', 'merge', 'remove-nth'],
    'Trees': ['tree', 'binary-tree', 'bst', 'inorder', 'preorder', 'postorder', 'balanced'],
    'Dynamic Programming': ['dp', 'climbing-stairs', 'house-robber', 'coin-change', 'knapsack', 'longest-substring'],
    'Graphs': ['graph', 'dfs', 'bfs', 'island', 'course-schedule', 'clone-graph'],
    'Stack': ['stack', 'valid-parentheses', 'min-stack', 'next-greater'],
    'Queue': ['queue', 'circular-queue', 'deque'],
    'Hash Table': ['hash', 'hashmap', 'hashset', 'two-sum', 'group-anagrams'],
    'Heap': ['heap', 'priority-queue', 'kth-largest', 'merge-k'],
    'Binary Search': ['binary-search', 'search-insert', 'search-rotated', 'find-minimum', 'peak-element'],
    'Two Pointers': ['two-pointer', 'container-water', 'trapping-rain'],
    'Backtracking': ['backtrack', 'permutation', 'combination', 'subset', 'n-queens'],
    'Greedy': ['greedy', 'jump-game', 'gas-station', 'interval'],
    'Bit Manipulation': ['bit', 'single-number', 'power-of-two', 'counting-bits'],
    'Math': ['math', 'sqrt', 'pow', 'prime', 'roman', 'divide', 'reverse-integer', 'plus-one'],
    'Sorting': ['sort', 'merge-sort', 'quick-sort'],
    'Recursion': ['recursion', 'recursive', 'fibonacci']
};

const TOPIC_ICONS = {
    'Arrays': '📊',
    'Strings': '📝',
    'Linked List': '🔗',
    'Trees': '🌳',
    'Dynamic Programming': '🎯',
    'Graphs': '🕸️',
    'Stack': '📚',
    'Queue': '🎫',
    'Hash Table': '#️⃣',
    'Heap': '⛰️',
    'Binary Search': '🔍',
    'Two Pointers': '👉',
    'Backtracking': '🔙',
    'Greedy': '💰',
    'Bit Manipulation': '🔢',
    'Math': '➗',
    'Sorting': '🔀',
    'Recursion': '♻️'
};

// ==================== Difficulty Keywords ====================
const DIFFICULTY_KEYWORDS = {
    'Easy': ['easy', 'simple', 'basic'],
    'Medium': ['medium', 'moderate', 'intermediate'],
    'Hard': ['hard', 'difficult', 'complex', 'advanced']
};

// ==================== Main Initialization ====================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        watchDeviceTypeChanges();
        await fetchAllData();
        renderDashboard();
        setupEventListeners();
        hideLoading();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        let errorMessage = 'Failed to load data from GitHub.';
        
        if (window.location.protocol === 'file:') {
            errorMessage = '⚠️ Cannot load from file:// protocol. Please use a web server or deploy to GitHub Pages.';
        } else if (error.message.includes('REPOSITORY_NOT_FOUND')) {
            errorMessage = error.message.replace('REPOSITORY_NOT_FOUND: ', '');
        } else if (error.message.includes('CORS') || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
            errorMessage = '⚠️ <strong>Browser Security Restriction (CORS)</strong><br><br>' +
                          'This happens when testing locally. The dashboard needs to be deployed to GitHub Pages to work properly.<br><br>' +
                          '<strong>Why?</strong> Browsers block direct API requests from local files for security reasons.';
        } else if (error.message.includes('rate limit')) {
            errorMessage = '⚠️ GitHub API rate limit exceeded. Please try again in an hour or deploy to GitHub Pages for better limits.';
        } else {
            errorMessage = `⚠️ ${error.message}<br><br>This dashboard works best when deployed to GitHub Pages!`;
        }
        
        showError(errorMessage);
    }
});

// ==================== Data Fetching ====================
async function fetchAllData() {
    const cached = loadCache();
    if (cached) {
        allProblems = cached.allProblems || [];
        commits = cached.commits || [];
        return;
    }

    try {
        const tree = await fetchRepoTree();
        allProblems = buildProblemsFromTree(tree);
        await fetchCommits();

        saveCache({ allProblems, commits });
        console.log(`Loaded ${allProblems.length} problems`);
    } catch (error) {
        console.error('Error fetching data:', error);

        if (cached) {
            console.warn('Using cached data due to fetch error.');
            return;
        }

        if (String(error.message).toLowerCase().includes('rate limit')) {
            const fallbackProblems = await fetchStatsJsonFallback();
            if (fallbackProblems.length > 0) {
                allProblems = fallbackProblems;
                commits = [];
                saveCache({ allProblems, commits });
                return;
            }
        }

        throw error;
    }
}

async function fetchStatsJsonFallback() {
    try {
        const rawUrl = `https://raw.githubusercontent.com/${CONFIG.owner}/${CONFIG.repo}/${CONFIG.branch}/stats.json`;
        const response = await fetch(rawUrl, { cache: 'no-cache' });
        if (!response.ok) return [];
        const stats = await response.json();
        return buildProblemsFromStats(stats);
    } catch (error) {
        return [];
    }
}

async function fetchRepoTree() {
    const treeUrl = `${CONFIG.apiBase}/repos/${CONFIG.owner}/${CONFIG.repo}/git/trees/${CONFIG.branch}?recursive=1`;
    const response = await fetch(treeUrl, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('REPOSITORY_NOT_FOUND: The repository may be private or does not exist. Please ensure your repository is PUBLIC for the dashboard to work.');
        } else if (response.status === 403) {
            const resetTime = response.headers.get('X-RateLimit-Reset');
            throw new Error(`GitHub API rate limit exceeded (403). Resets at ${new Date(resetTime * 1000).toLocaleTimeString()}`);
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.tree || [];
}

function buildProblemsFromTree(tree) {
    const problemsMap = new Map();

    tree.forEach(item => {
        if (item.type !== 'blob') return;

        const match = item.path.match(/^(\d{4}-[^/]+)\/([^/]+)$/);
        if (!match) return;

        const dirName = match[1];
        const filename = match[2];

        if (!isCodeFile(filename)) return;

        if (!problemsMap.has(dirName)) {
            const dirMatch = dirName.match(/^(\d{4})-(.*)$/);
            const problemNumber = dirMatch ? parseInt(dirMatch[1]) : 0;
            const problemTitle = dirMatch ? formatTitle(dirMatch[2]) : dirName;
            problemsMap.set(dirName, {
                number: problemNumber,
                title: problemTitle,
                dirName,
                files: []
            });
        }

        problemsMap.get(dirName).files.push(filename);
    });

    return Array.from(problemsMap.values()).map(entry => {
        const languages = [...new Set(entry.files.map(getLanguageFromExtension))];
        const difficulty = inferDifficulty(entry.number, entry.title);
        const topics = inferTopics(entry.title);

        return {
            number: entry.number,
            title: entry.title,
            difficulty,
            topics,
            languages,
            dirName: entry.dirName,
            htmlUrl: `https://github.com/${CONFIG.owner}/${CONFIG.repo}/tree/${CONFIG.branch}/${entry.dirName}`
        };
    });
}

async function fetchCommits() {
    try {
        let allCommits = [];
        let page = 1;
        let hasMore = true;

        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - 365);
        const since = sinceDate.toISOString();

        while (hasMore && page <= 3) {
            const commitsUrl = `${CONFIG.apiBase}/repos/${CONFIG.owner}/${CONFIG.repo}/commits?per_page=${CONFIG.itemsPerPage}&page=${page}&since=${encodeURIComponent(since)}`;
            const response = await fetch(commitsUrl);

            if (!response.ok) break;

            const pageCommits = await response.json();

            if (pageCommits.length === 0) {
                hasMore = false;
            } else {
                allCommits = allCommits.concat(pageCommits);
                page++;
            }

            if (pageCommits.length < CONFIG.itemsPerPage) {
                hasMore = false;
            }
        }

        commits = allCommits;
        console.log(`Loaded ${commits.length} commits`);
    } catch (error) {
        console.error('Error fetching commits:', error);
        commits = [];
    }
}

// ==================== Helper Functions ====================
function loadCache() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed.timestamp || !parsed.payload) return null;
        if (isDesktop()) return null; // force fresh data on desktop to fix slow updates
        if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
        return parsed.payload;
    } catch (error) {
        return null;
    }
}

function saveCache(payload) {
    try {
        // Skip caching on desktop to avoid visible lag vs mobile
        if (isDesktop()) return;
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            payload
        }));
    } catch (error) {
        // Ignore cache errors (e.g., storage quota)
    }
}

function isDesktop() {
    return window.innerWidth >= 992; // Bootstrap lg breakpoint; treat as desktop
}

let lastDeviceType = isDesktop() ? DEVICE_TYPE_DESKTOP : DEVICE_TYPE_MOBILE;
function watchDeviceTypeChanges() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const current = isDesktop() ? DEVICE_TYPE_DESKTOP : DEVICE_TYPE_MOBILE;
            if (current !== lastDeviceType) {
                localStorage.removeItem(CACHE_KEY); // clear stale cache when switching modes
                lastDeviceType = current;
            }
        }, 200); // debounce resize to avoid excessive cache clearing
    });
}

function isCodeFile(filename) {
    return /\.(java|py|cpp|js|ts)$/i.test(filename);
}

function normalizeDifficulty(value, number, title) {
    if (!value) return inferDifficulty(number, title);
    const v = String(value).toLowerCase();
    if (v === 'easy') return 'Easy';
    if (v === 'medium') return 'Medium';
    if (v === 'hard') return 'Hard';
    return inferDifficulty(number, title);
}

function buildProblemsFromStats(stats) {
    const shas = stats?.leetcode?.shas || {};
    const problems = [];

    Object.entries(shas).forEach(([dirName, filesObj]) => {
        if (!/^\d{4}-/.test(dirName) || typeof filesObj !== 'object') return;

        const dirMatch = dirName.match(/^(\d{4})-(.*)$/);
        const problemNumber = dirMatch ? parseInt(dirMatch[1]) : 0;
        const problemTitle = dirMatch ? formatTitle(dirMatch[2]) : dirName;

        const fileNames = Object.keys(filesObj).filter(name => name && name !== 'README.md' && name !== 'difficulty');
        const languages = [...new Set(fileNames.filter(isCodeFile).map(getLanguageFromExtension))];

        if (languages.length === 0) return;

        const difficulty = normalizeDifficulty(filesObj.difficulty, problemNumber, problemTitle);
        const topics = inferTopics(problemTitle);

        problems.push({
            number: problemNumber,
            title: problemTitle,
            difficulty,
            topics,
            languages,
            dirName,
            htmlUrl: `https://github.com/${CONFIG.owner}/${CONFIG.repo}/tree/${CONFIG.branch}/${dirName}`
        });
    });

    return problems;
}

function formatTitle(slug) {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function getLanguageFromExtension(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const languageMap = {
        'java': 'Java',
        'py': 'Python',
        'cpp': 'C++',
        'c': 'C',
        'js': 'JavaScript',
        'ts': 'TypeScript',
        'go': 'Go',
        'rs': 'Rust'
    };
    return languageMap[ext] || ext.toUpperCase();
}

function inferDifficulty(number, title) {
    // Common easy problems (1-100 range, simple operations)
    if (number <= 100 || 
        title.toLowerCase().includes('easy') ||
        ['Two Sum', 'Palindrome Number', 'Roman To Integer', 'Valid Parentheses', 
         'Merge Two Sorted Lists', 'Plus One', 'Sqrt', 'Climbing Stairs',
         'Remove Duplicates', 'Remove Element', 'Search Insert Position'].some(t => title.includes(t))) {
        return 'Easy';
    }
    
    // Hard problems
    if (title.toLowerCase().includes('hard') ||
        ['Median Of Two Sorted Arrays', 'Merge K Sorted Lists', 'Divide Two Integers'].some(t => title.includes(t))) {
        return 'Hard';
    }
    
    // Default to Medium
    return 'Medium';
}

function inferTopics(title) {
    const topics = [];
    const lowerTitle = title.toLowerCase();
    
    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        if (keywords.some(keyword => lowerTitle.includes(keyword))) {
            topics.push(topic);
        }
    }
    
    // If no topics found, assign default based on common patterns
    if (topics.length === 0) {
        if (lowerTitle.includes('tree')) topics.push('Trees');
        else if (lowerTitle.includes('list')) topics.push('Linked List');
        else if (lowerTitle.includes('array') || lowerTitle.includes('sum')) topics.push('Arrays');
        else topics.push('Math'); // Default
    }
    
    return topics;
}

function calculateStreaks() {
    if (commits.length === 0) {
        return { current: 0, longest: 0 };
    }
    
    // Get unique commit dates
    const commitDates = commits
        .map(commit => {
            const date = new Date(commit.commit.author.date);
            return date.toISOString().split('T')[0]; // YYYY-MM-DD format
        })
        .filter((date, index, self) => self.indexOf(date) === index)
        .sort()
        .reverse();
    
    if (commitDates.length === 0) {
        return { current: 0, longest: 0 };
    }
    
    let currentStreak = 1;
    let longestStreak = 1;
    let tempStreak = 1;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Check if streak is current (includes today or yesterday)
    if (commitDates[0] !== todayStr && commitDates[0] !== yesterdayStr) {
        currentStreak = 0;
    }
    
    // Calculate streaks
    for (let i = 0; i < commitDates.length - 1; i++) {
        const current = new Date(commitDates[i]);
        const next = new Date(commitDates[i + 1]);
        const diffDays = Math.floor((current - next) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            tempStreak++;
            if (currentStreak > 0) currentStreak++;
        } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
            if (i === 0) currentStreak = 0;
        }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    return { current: currentStreak, longest: longestStreak };
}

// ==================== Dashboard Rendering ====================
function renderDashboard() {
    renderStats();
    renderHeatmap();
    renderTopics();
    renderProblems(allProblems);
    populateFilters();
}

function renderStats() {
    // Total problems
    document.getElementById('totalProblems').textContent = allProblems.length;
    
    // Difficulty breakdown
    const difficulties = {
        Easy: allProblems.filter(p => p.difficulty === 'Easy').length,
        Medium: allProblems.filter(p => p.difficulty === 'Medium').length,
        Hard: allProblems.filter(p => p.difficulty === 'Hard').length
    };
    
    document.getElementById('easyProblems').textContent = difficulties.Easy;
    document.getElementById('mediumProblems').textContent = difficulties.Medium;
    document.getElementById('hardProblems').textContent = difficulties.Hard;
    
    // Streaks
    const streaks = calculateStreaks();
    document.getElementById('currentStreak').textContent = streaks.current + ' days';
    document.getElementById('longestStreak').textContent = streaks.longest + ' days';
    
    // Languages
    const languagesCount = {};
    allProblems.forEach(problem => {
        problem.languages.forEach(lang => {
            languagesCount[lang] = (languagesCount[lang] || 0) + 1;
        });
    });
    
    const languagesContainer = document.getElementById('languagesContainer');
    languagesContainer.innerHTML = Object.entries(languagesCount)
        .sort((a, b) => b[1] - a[1])
        .map(([lang, count]) => `
            <span class="language-badge">
                <i class="bi bi-code-slash"></i>
                ${lang}
                <span class="language-count">${count}</span>
            </span>
        `).join('');
}

function renderHeatmap() {
    const heatmapContainer = document.getElementById('heatmapContainer');
    
    if (commits.length === 0) {
        heatmapContainer.innerHTML = '<p class="text-muted text-center">No commit data available</p>';
        return;
    }
    
    // Create date map with problem counts
    const dateMap = {};
    commits.forEach(commit => {
        const date = new Date(commit.commit.author.date);
        const dateStr = date.toISOString().split('T')[0];
        dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
    });
    
    // Generate last 365 days
    const days = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        days.push({
            date: dateStr,
            count: dateMap[dateStr] || 0
        });
    }
    
    // Find max count for level calculation
    const maxCount = Math.max(...Object.values(dateMap), 1);
    
    // Generate heatmap grid
    const grid = document.createElement('div');
    grid.className = 'heatmap-grid';
    
    days.forEach(day => {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        
        // Calculate level (0-4)
        const level = day.count === 0 ? 0 : Math.min(Math.ceil((day.count / maxCount) * 4), 4);
        cell.setAttribute('data-level', level);
        cell.setAttribute('title', `${day.date}: ${day.count} ${day.count === 1 ? 'commit' : 'commits'}`);
        
        grid.appendChild(cell);
    });
    
    // Add legend
    const legend = `
        <div class="heatmap-legend">
            <span>Less</span>
            <div class="heatmap-legend-box" style="background: #161b22;"></div>
            <div class="heatmap-legend-box" style="background: #0e4429;"></div>
            <div class="heatmap-legend-box" style="background: #006d32;"></div>
            <div class="heatmap-legend-box" style="background: #26a641;"></div>
            <div class="heatmap-legend-box" style="background: #39d353;"></div>
            <span>More</span>
        </div>
    `;
    
    heatmapContainer.innerHTML = '';
    heatmapContainer.appendChild(grid);
    heatmapContainer.insertAdjacentHTML('beforeend', legend);
}

function renderTopics() {
    const topicsContainer = document.getElementById('topicsContainer');
    
    // Count problems per topic
    topicsMap = {};
    allProblems.forEach(problem => {
        problem.topics.forEach(topic => {
            topicsMap[topic] = (topicsMap[topic] || 0) + 1;
        });
    });
    
    // Sort topics by count
    const sortedTopics = Object.entries(topicsMap)
        .sort((a, b) => b[1] - a[1]);
    
    topicsContainer.innerHTML = sortedTopics.map(([topic, count]) => `
        <div class="col-md-6 col-lg-4 col-xl-3">
            <div class="topic-card" onclick="filterByTopic('${topic}')">
                <div class="topic-icon">${TOPIC_ICONS[topic] || '📌'}</div>
                <h5>${topic}</h5>
                <div class="topic-count">${count}</div>
            </div>
        </div>
    `).join('');
}

function renderProblems(problems) {
    const problemsList = document.getElementById('problemsList');
    const noResults = document.getElementById('noResults');
    
    const safeProblems = (problems || []).filter(Boolean);
    
    if (safeProblems.length === 0) {
        problemsList.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    // Sort by problem number
    const sortedProblems = safeProblems.sort((a, b) => a.number - b.number);
    
    problemsList.innerHTML = sortedProblems.map(problem => `
        <div class="problem-card" onclick="viewCode('${problem.dirName}', '${escapeHtml(problem.title)}')">
            <div class="problem-header">
                <h5 class="problem-title">
                    <span class="problem-number">#${problem.number}</span>
                    ${escapeHtml(problem.title)}
                </h5>
                <div class="problem-badges">
                    <span class="badge badge-${problem.difficulty.toLowerCase()}">${problem.difficulty}</span>
                    ${problem.languages.map(lang => `<span class="badge badge-lang">${lang}</span>`).join('')}
                </div>
            </div>
            <div class="problem-meta">
                ${problem.topics.map(topic => `<span class="badge badge-topic">${topic}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

// ==================== Event Listeners ====================
function setupEventListeners() {
    // Search input
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    
    // Filter dropdowns
    document.getElementById('difficultyFilter').addEventListener('change', applyFilters);
    document.getElementById('topicFilter').addEventListener('change', applyFilters);
    document.getElementById('languageFilter').addEventListener('change', applyFilters);
}

function populateFilters() {
    // Populate topic filter
    const topicFilter = document.getElementById('topicFilter');
    const topics = [...new Set(allProblems.flatMap(p => p.topics))].sort();
    topics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic;
        option.textContent = topic;
        topicFilter.appendChild(option);
    });
    
    // Populate language filter
    const languageFilter = document.getElementById('languageFilter');
    const languages = [...new Set(allProblems.flatMap(p => p.languages))].sort();
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang;
        languageFilter.appendChild(option);
    });
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const difficulty = document.getElementById('difficultyFilter').value;
    const topic = document.getElementById('topicFilter').value;
    const language = document.getElementById('languageFilter').value;
    
    const filtered = allProblems.filter(problem => {
        const matchesSearch = problem.title.toLowerCase().includes(searchTerm) || 
                             problem.number.toString().includes(searchTerm);
        const matchesDifficulty = !difficulty || problem.difficulty === difficulty;
        const matchesTopic = !topic || problem.topics.includes(topic);
        const matchesLanguage = !language || problem.languages.includes(language);
        
        return matchesSearch && matchesDifficulty && matchesTopic && matchesLanguage;
    });
    
    renderProblems(filtered);
}

function filterByTopic(topic) {
    document.getElementById('topicFilter').value = topic;
    applyFilters();
    
    // Scroll to problems section
    document.getElementById('problems').scrollIntoView({ behavior: 'smooth' });
}

// ==================== Code Viewer ====================
async function viewCode(dirName, title) {
    const modal = new bootstrap.Modal(document.getElementById('codeModal'));
    const modalTitle = document.getElementById('codeModalTitle');
    const codeContent = document.getElementById('codeContent');
    const codeLoadingSpinner = document.getElementById('codeLoadingSpinner');
    const githubLink = document.getElementById('githubLink');
    
    // Show modal with loading state
    modalTitle.textContent = title;
    codeContent.style.display = 'none';
    codeLoadingSpinner.style.display = 'block';
    modal.show();
    
    // Set GitHub link
    githubLink.href = `https://github.com/${CONFIG.owner}/${CONFIG.repo}/tree/main/${dirName}`;
    
    try {
        // Fetch directory contents
        const dirUrl = `${CONFIG.apiBase}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${dirName}`;
        const response = await fetch(dirUrl);
        const dirContents = await response.json();
        
        // Find code file
        const codeFile = dirContents.find(file => 
            file.name.endsWith('.java') || 
            file.name.endsWith('.py') || 
            file.name.endsWith('.cpp') ||
            file.name.endsWith('.js')
        );
        
        if (!codeFile) {
            throw new Error('No code file found');
        }
        
        // Fetch code content
        const codeResponse = await fetch(codeFile.download_url);
        const code = await codeResponse.text();
        
        // Determine language for syntax highlighting
        const language = getLanguageFromExtension(codeFile.name).toLowerCase();
        const languageClass = language === 'c++' ? 'cpp' : language;
        
        // Display code
        const codeElement = codeContent.querySelector('code');
        codeElement.className = `language-${languageClass}`;
        codeElement.textContent = code;
        
        // Apply syntax highlighting
        Prism.highlightElement(codeElement);
        
        // Hide loading, show code
        codeLoadingSpinner.style.display = 'none';
        codeContent.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading code:', error);
        codeLoadingSpinner.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle"></i> 
                Failed to load code. Please try again or view on GitHub.
            </div>
        `;
    }
}

// ==================== Utility Functions ====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
}

function showError(message) {
    const loading = document.getElementById('loading');
    loading.innerHTML = `
        <div class="container">
            <div class="alert alert-warning" role="alert" style="max-width: 800px; margin: 0 auto;">
                <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Setup Required</h4>
                <hr>
                <div>${message}</div>
                <hr>
                <h5 class="mt-4">📝 Quick Setup Guide:</h5>
                <ol class="text-start">
                    <li><strong>Make sure your repository is PUBLIC</strong>
                        <ul>
                            <li>Go to Settings → General → Danger Zone → Change visibility</li>
                            <li>Or create a new public repository</li>
                        </ul>
                    </li>
                    <li><strong>Enable GitHub Pages:</strong>
                        <ul>
                            <li>Go to Settings → Pages</li>
                            <li>Source: Deploy from a branch</li>
                            <li>Branch: <code>main</code>, Folder: <code>/docs</code></li>
                            <li>Click Save</li>
                        </ul>
                    </li>
                    <li><strong>Wait 1-2 minutes</strong> for GitHub Pages to deploy</li>
                    <li><strong>Access your dashboard at:</strong><br>
                        <code>https://sundara-raghav.github.io/Leetcode-problems/</code>
                    </li>
                </ol>
                <div class="alert alert-info mt-3">
                    <strong><i class="bi bi-info-circle"></i> Note:</strong> 
                    Local testing has limitations due to browser CORS restrictions. 
                    The dashboard works perfectly when deployed to GitHub Pages!
                </div>
                <div class="mt-3">
                    <a href="https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site" 
                       target="_blank" class="btn btn-primary">
                        <i class="bi bi-book"></i> GitHub Pages Documentation
                    </a>
                    <a href="https://github.com/sundara-raghav/Leetcode-problems/settings/pages" 
                       target="_blank" class="btn btn-secondary ms-2">
                        <i class="bi bi-gear"></i> Repository Settings
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Make functions available globally
window.filterByTopic = filterByTopic;
window.viewCode = viewCode;
