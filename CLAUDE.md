# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a GitHub Repository Manager web application built with vanilla JavaScript and Preline UI (Tailwind CSS component library). It allows users to manage their GitHub repositories locally and import them directly from GitHub using personal access tokens.

## Commands

### Development
- **Run locally**: Open `index.html` directly in a browser (no build step required)
- **Test import feature**: Open `test-import.html` for API testing interface

### Git Operations
```bash
# Push changes to GitHub
git add .
git commit -m "message"
git push origin main
```

## Architecture & Key Components

### Frontend Stack
- **UI Framework**: Preline UI v2.5.0 (Tailwind CSS-based component library)
- **CSS Architecture**: Modular Tailwind CSS v4 structure in `/assets/css/`
  - `main.css` - Entry point importing all modules
  - `theme/` - Design tokens (colors, typography, spacing, effects)
  - `utilities/all-utilities.css` - Utility classes (28,000+ lines)
- **JavaScript Libraries**:
  - `index.js` - Preline UI components initialization
  - `apexcharts.min.js` - Chart library
  - `lodash.min.js` - Utility library

### Core Application Files

1. **`index.html`** - Single-page application with:
   - Sidebar navigation
   - Tab-based repository views (owned/starred)
   - Modals for adding/editing repos and GitHub import

2. **`assets/js/github.js`** - Repository management core:
   - Local storage persistence
   - CRUD operations for repositories
   - Import orchestration from GitHub API
   - Preline dropdown reinitialization after DOM changes

3. **`assets/js/github-api.js`** - GitHub API integration:
   - Token management (base64 encoded in localStorage)
   - Pagination handling for large repository lists
   - Rate limiting and error handling
   - Fetches both owned and starred repositories

4. **`data.json`** - Sample repository data structure

### Important Implementation Details

1. **Preline UI Integration**:
   - Components require `window.HSDropdown.autoInit()` after DOM updates
   - Uses `hs-` prefixed classes for interactive components
   - Dark mode support via Tailwind classes

2. **Data Storage**:
   - Primary: localStorage (`githubRepos` key)
   - Fallback: `/toolbox/data.json` file
   - Token storage: `github_token` key (base64 encoded)

3. **GitHub API Usage**:
   - Required scopes: `repo`, `read:user`
   - Handles pagination (100 items per page)
   - Duplicate detection by URL and name/owner combination
   - Preserves manually added repositories during import

4. **Repository Data Structure**:
```javascript
{
  owned: [
    {
      id: "github-owned-123",
      name: "repo-name",
      description: "...",
      language: "JavaScript",
      url: "https://github.com/...",
      private: false,
      stars: 42,
      forks: 8,
      createdAt: "ISO-8601",
      updatedAt: "ISO-8601",
      owner: "username",
      topics: [],
      archived: false
    }
  ],
  starred: [...]
}
```

## Development Notes

- All paths use `/toolbox/` prefix for assets
- No build process - direct browser execution
- Modal operations use class toggling (`hidden`/`open`)
- Repository cards are dynamically generated with language color coding
- Search functionality filters by name, description, and language

## Design Notes
ALWAYS check the /.claude/docs/design.md file for design rules before making any frontend/UI changes