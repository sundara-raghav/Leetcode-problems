# LeetCode Progress Tracker

A beautiful, auto-updating dashboard to track your LeetCode progress directly from your GitHub repository!

## 🌟 Features

### 📊 **Statistics Dashboard**
- Total problems solved
- Difficulty breakdown (Easy/Medium/Hard)
- Languages used with counts
- Beautiful stat cards with icons

### 🔥 **Streak Tracker**
- Current solving streak (consecutive days)
- Longest streak achieved
- Automatically calculated from commit history

### 🟩 **Contribution Heatmap**
- GitHub-style contribution calendar
- Visual representation of daily activity
- Color-coded intensity based on commits

### 🧠 **DSA Topic Breakdown**
- Auto-categorized into 18+ topics:
  - Arrays, Strings, Linked Lists
  - Trees, Graphs, Dynamic Programming
  - Stack, Queue, Hash Tables
  - Binary Search, Backtracking, and more!
- Click topics to filter problems

### 📂 **Problem Explorer**
- Complete list of all solved problems
- Advanced filtering:
  - Search by name or number
  - Filter by difficulty
  - Filter by topic
  - Filter by programming language
- Clean, responsive card layout

### 👨‍💻 **Code Viewer**
- Click any problem to view full source code
- Syntax highlighting with Prism.js
- Supports Java, Python, C++, JavaScript, and more
- Direct link to GitHub repository

## 🚀 Live Demo

Your dashboard will be available at: `https://sundara-raghav.github.io/Leetcode-problems/`

## 🛠️ How It Works

1. **Data Source**: Uses GitHub REST API to read your repository
2. **Auto-Detection**: Automatically detects:
   - Problem numbers and titles from folder names
   - Programming languages from file extensions
   - Difficulty levels using intelligent heuristics
   - Topics based on problem keywords
3. **Real-time Updates**: Fetches latest data on every page load
4. **No Authentication**: Works with public repositories

## 📋 Setup Instructions

### ⭐ Step 1: Enable GitHub Pages (Required)

1. Go to your repository: `https://github.com/sundara-raghav/Leetcode-problems`
2. Click on **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select:
   - Branch: `main` (or `master`)
   - Folder: `/docs`
5. Click **Save**
6. Wait 1-2 minutes for deployment
7. Your dashboard will be live at: `https://sundara-raghav.github.io/Leetcode-problems/`

### 🔄 Auto-Updates

- The dashboard fetches data from GitHub on every page load
- No manual updates needed - just push new solutions via LeetHub!
- GitHub Pages automatically rebuilds when you push changes

### 🧪 Local Testing (Optional)

**Note**: Due to CORS restrictions, local testing has limitations. The dashboard works perfectly when deployed to GitHub Pages.

If you want to test locally anyway:

```bash
cd docs
python -m http.server 8000
# Visit http://localhost:8000
```

You may see CORS errors - this is expected and won't happen on GitHub Pages!

## 🎨 Customization

### Change Repository
Edit `script.js` line 2-4:

```javascript
const CONFIG = {
    owner: 'your-username',
    repo: 'your-repo-name',
    apiBase: 'https://api.github.com',
    itemsPerPage: 100
};
```

### Adjust Topics
Modify `TOPIC_KEYWORDS` in `script.js` to add/remove topics or keywords.

### Theme Colors
Edit CSS variables in `style.css`:

```css
:root {
    --bg-primary: #0d1117;
    --accent-primary: #58a6ff;
    /* ... */
}
```

## 🔧 Technical Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom dark theme with CSS variables
- **JavaScript (ES6+)** - Async/await, Fetch API
- **Bootstrap 5** - Responsive grid and components
- **Prism.js** - Syntax highlighting
- **GitHub REST API** - Data source

## 📱 Responsive Design

Fully responsive and works on:
- Desktop (1920px+)
- Laptop (1366px - 1920px)
- Tablet (768px - 1366px)
- Mobile (320px - 768px)

## 🐛 Troubleshooting

### Dashboard not loading?
- Check if repository is public
- Verify repository name in CONFIG
- Check browser console for errors
- GitHub API rate limit: 60 requests/hour for unauthenticated requests

### Problems not showing?
- Ensure folder names follow format: `0001-problem-name`
- Check if code files have proper extensions (.java, .py, etc.)

### Heatmap empty?
- Requires commit history
- Make sure repository has commits

## 📄 License

This dashboard is open-source and free to use!

## 🙏 Credits

Built with ❤️ by combining:
- Bootstrap 5 (MIT License)
- Prism.js (MIT License)
- GitHub REST API

---

**Note**: This is a client-side only application. All data is fetched in real-time from your public GitHub repository. No backend or database required!
