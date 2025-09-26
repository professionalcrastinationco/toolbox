// GitHub Repository Manager
let repositories = {
  owned: [],
  starred: []
};

// GitHub API instance
let githubAPI = null;

// Load data from localStorage or data.json
async function loadData() {
  try {
    // First try localStorage
    const localData = localStorage.getItem('githubRepos');
    if (localData) {
      repositories = JSON.parse(localData);
    } else {
      // Try to load from data.json
      const response = await fetch('/toolbox/data.json');
      if (response.ok) {
        repositories = await response.json();
      }
    }
  } catch (error) {
    console.log('Loading default empty data structure');
  }
  renderRepositories();
  updateCounts();
}

// Save data to localStorage and attempt to save to file
function saveData() {
  localStorage.setItem('githubRepos', JSON.stringify(repositories));
  updateCounts();

  // For demonstration, also log the data structure
  console.log('Data saved:', repositories);
}

// Generate unique ID
function generateId() {
  return 'repo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Format date
function formatDate(date) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
}

// Create repository card HTML
function createRepoCard(repo, type) {
  const languageColors = {
    JavaScript: 'bg-yellow-500',
    TypeScript: 'bg-blue-600',
    Python: 'bg-blue-500',
    Java: 'bg-orange-500',
    'C++': 'bg-pink-600',
    'C#': 'bg-purple-600',
    Go: 'bg-cyan-500',
    Ruby: 'bg-red-600',
    PHP: 'bg-indigo-500',
    Swift: 'bg-orange-600',
    Rust: 'bg-orange-700',
    Other: 'bg-slate-500'
  };

  const langColor = languageColors[repo.language] || 'bg-slate-500';

  return `
    <div class="flex flex-col bg-white border border-slate-300 shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer dark:bg-neutral-800 dark:border-neutral-700" data-repo-id="${repo.id}">
      <div class="p-5">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2">
            <svg class="shrink-0 size-4 text-slate-600 dark:text-neutral-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            ${repo.private ? '<span class="inline-flex items-center gap-x-1 text-xs font-medium bg-slate-100 text-slate-800 rounded-full px-2 py-0.5 dark:bg-neutral-700 dark:text-neutral-300">Private</span>' : '<span class="inline-flex items-center gap-x-1 text-xs font-medium bg-green-100 text-green-800 rounded-full px-2 py-0.5 dark:bg-green-900/30 dark:text-green-500">Public</span>'}
          </div>

          <!-- Dropdown Actions -->
          <div class="hs-dropdown relative inline-flex [--placement:bottom-right]">
            <button type="button" class="hs-dropdown-toggle inline-flex items-center justify-center size-8 text-sm font-semibold rounded-lg text-slate-500 hover:bg-slate-50 transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:bg-neutral-700">
              <svg class="flex-none size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="1"/>
                <circle cx="12" cy="5" r="1"/>
                <circle cx="12" cy="19" r="1"/>
              </svg>
            </button>
            <div class="hs-dropdown-menu transition-[opacity,margin] duration-300 hs-dropdown-open:opacity-100 opacity-0 hidden min-w-32 z-10 bg-white shadow-lg rounded-lg p-1 space-y-0.5 mt-2 dark:bg-neutral-800 dark:border dark:border-neutral-700" role="menu">
              ${repo.url ? `<a class="flex items-center gap-x-2 py-1.5 px-2 rounded-lg text-xs text-slate-800 hover:bg-slate-50 focus:outline-hidden focus:bg-slate-100 transition-colors duration-200 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700" href="${repo.url}" target="_blank">
                <svg class="flex-shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 3h6v6"/>
                  <path d="M10 14 21 3"/>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                </svg>
                View on GitHub
              </a>` : ''}
              <button class="flex w-full items-center gap-x-2 py-1.5 px-2 rounded-lg text-xs text-slate-800 hover:bg-slate-50 focus:outline-hidden focus:bg-slate-100 transition-colors duration-200 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700" onclick="editRepo('${repo.id}', '${type}')">
                <svg class="flex-shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                </svg>
                Edit
              </button>
              <button class="flex w-full items-center gap-x-2 py-1.5 px-2 rounded-lg text-xs text-red-600 hover:bg-red-50 focus:outline-hidden focus:bg-red-50 transition-colors duration-200 dark:text-red-500 dark:hover:bg-red-900/20" onclick="deleteRepo('${repo.id}', '${type}')">
                <svg class="flex-shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>

        <h3 class="text-base font-bold text-slate-800 dark:text-white mb-2">
          ${repo.name}
        </h3>

        <p class="text-sm text-slate-600 dark:text-neutral-400 mb-4 line-clamp-2">
          ${repo.description || 'No description available'}
        </p>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4 text-xs text-slate-500 dark:text-neutral-400">
            ${repo.language ? `<div class="flex items-center gap-1">
              <span class="size-2 rounded-full ${langColor}"></span>
              ${repo.language}
            </div>` : ''}

            <div class="flex items-center gap-1">
              <svg class="size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              ${repo.stars || 0}
            </div>

            <div class="flex items-center gap-1">
              <svg class="size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="18" r="3"/>
                <circle cx="5" cy="6" r="3"/>
                <circle cx="19" cy="6" r="3"/>
                <path d="M12 15V6.5a.5.5 0 0 0-1 0v0a.5.5 0 0 1-1 0V6"/>
                <path d="M10.5 8.5 8 6"/>
                <path d="m13.5 8.5L16 6"/>
              </svg>
              ${repo.forks || 0}
            </div>
          </div>
        </div>

        <div class="mt-3 text-xs text-slate-500 dark:text-neutral-500">
          Updated ${formatDate(repo.updatedAt || repo.createdAt || new Date())}
        </div>
      </div>
    </div>
  `;
}

// Render repositories
function renderRepositories(searchTerm = '') {
  const myReposGrid = document.getElementById('myReposGrid');
  const starredReposGrid = document.getElementById('starredReposGrid');
  const myReposEmpty = document.getElementById('myReposEmpty');
  const starredReposEmpty = document.getElementById('starredReposEmpty');

  // Filter repositories based on search term
  const filteredOwned = repositories.owned.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (repo.language && repo.language.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredStarred = repositories.starred.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (repo.language && repo.language.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Render owned repositories
  if (filteredOwned.length > 0) {
    myReposGrid.innerHTML = filteredOwned.map(repo => createRepoCard(repo, 'owned')).join('');
    myReposGrid.classList.remove('hidden');
    myReposEmpty.classList.add('hidden');
  } else {
    myReposGrid.classList.add('hidden');
    myReposEmpty.classList.remove('hidden');
  }

  // Render starred repositories
  if (filteredStarred.length > 0) {
    starredReposGrid.innerHTML = filteredStarred.map(repo => createRepoCard(repo, 'starred')).join('');
    starredReposGrid.classList.remove('hidden');
    starredReposEmpty.classList.add('hidden');
  } else {
    starredReposGrid.classList.add('hidden');
    starredReposEmpty.classList.remove('hidden');
  }

  // Reinitialize Preline dropdowns
  if (window.HSDropdown) {
    window.HSDropdown.autoInit();
  }
}

// Update repository counts
function updateCounts() {
  document.getElementById('myRepoCount').textContent = repositories.owned.length;
  document.getElementById('starredRepoCount').textContent = repositories.starred.length;
}

// Open Add Repository Modal
function openAddRepoModal() {
  document.getElementById('repoModalLabel').textContent = 'Add Repository';
  document.getElementById('repoForm').reset();
  document.getElementById('repoId').value = '';
  document.getElementById('repoType').value = 'owned';
  document.getElementById('repoModal').classList.remove('hidden');
  document.getElementById('repoModal').classList.add('open');
}

// Open Add Starred Repository Modal
function openAddStarredModal() {
  document.getElementById('repoModalLabel').textContent = 'Add Starred Repository';
  document.getElementById('repoForm').reset();
  document.getElementById('repoId').value = '';
  document.getElementById('repoType').value = 'starred';
  document.getElementById('repoModal').classList.remove('hidden');
  document.getElementById('repoModal').classList.add('open');
}

// Close Repository Modal
function closeRepoModal() {
  document.getElementById('repoModal').classList.add('hidden');
  document.getElementById('repoModal').classList.remove('open');
}

// Edit Repository
function editRepo(id, type) {
  const repo = repositories[type].find(r => r.id === id);
  if (!repo) return;

  document.getElementById('repoModalLabel').textContent = 'Edit Repository';
  document.getElementById('repoId').value = repo.id;
  document.getElementById('repoType').value = type;
  document.getElementById('repoName').value = repo.name;
  document.getElementById('repoDescription').value = repo.description || '';
  document.getElementById('repoLanguage').value = repo.language || '';
  document.getElementById('repoUrl').value = repo.url || '';
  document.getElementById('repoPrivate').checked = repo.private || false;

  document.getElementById('repoModal').classList.remove('hidden');
  document.getElementById('repoModal').classList.add('open');
}

// Delete Repository
function deleteRepo(id, type) {
  if (confirm('Are you sure you want to delete this repository?')) {
    repositories[type] = repositories[type].filter(r => r.id !== id);
    saveData();
    renderRepositories();
  }
}

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
  // Load initial data
  loadData();

  // Tab switching
  document.querySelectorAll('[data-hs-tab]').forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();

      // Remove active class from all tabs
      document.querySelectorAll('[data-hs-tab]').forEach(t => t.classList.remove('active'));
      // Add active to clicked tab
      this.classList.add('active');

      // Hide all tab panels
      document.querySelectorAll('#my-repos, #starred-repos').forEach(panel => {
        panel.classList.add('hidden');
      });

      // Show selected panel
      const targetId = this.getAttribute('data-hs-tab');
      document.querySelector(targetId).classList.remove('hidden');
    });
  });

  // Search functionality
  const searchInput = document.getElementById('repoSearch');
  let searchTimeout;
  searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      renderRepositories(this.value);
    }, 300);
  });

  // Form submission
  document.getElementById('repoForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const id = formData.get('id');
    const type = formData.get('type');

    const repoData = {
      id: id || generateId(),
      name: formData.get('name'),
      description: formData.get('description'),
      language: formData.get('language'),
      url: formData.get('url'),
      private: formData.get('private') === 'on',
      stars: 0,
      forks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (id) {
      // Edit existing
      const index = repositories[type].findIndex(r => r.id === id);
      if (index > -1) {
        repositories[type][index] = { ...repositories[type][index], ...repoData };
      }
    } else {
      // Add new
      repositories[type].push(repoData);
    }

    saveData();
    renderRepositories();
    closeRepoModal();
  });

  // Close modal on overlay click
  document.getElementById('repoModal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeRepoModal();
    }
  });
});

// Export data as JSON (for download)
function exportData() {
  const dataStr = JSON.stringify(repositories, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

  const exportFileDefaultName = 'github-repos-' + new Date().toISOString().slice(0,10) + '.json';

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

// Import Modal Functions
function openImportModal() {
  // Initialize GitHub API if not already done
  if (!githubAPI) {
    githubAPI = new GitHubAPI();
  }

  // Check if token exists
  if (githubAPI.hasToken()) {
    // Token exists, go directly to import
    performImport();
  } else {
    // Show token setup
    document.getElementById('tokenSetup').classList.remove('hidden');
    document.getElementById('importProgress').classList.add('hidden');
    document.getElementById('importResults').classList.add('hidden');
    document.getElementById('tokenError').classList.add('hidden');
    document.getElementById('importModal').classList.remove('hidden');
    document.getElementById('importModal').classList.add('open');
  }
}

function closeImportModal() {
  document.getElementById('importModal').classList.add('hidden');
  document.getElementById('importModal').classList.remove('open');
  // Reset the modal state
  document.getElementById('githubToken').value = '';
  document.getElementById('tokenError').classList.add('hidden');
}

async function validateAndImport() {
  const tokenInput = document.getElementById('githubToken');
  const token = tokenInput.value.trim();

  if (!token) {
    showTokenError('Please enter a GitHub personal access token');
    return;
  }

  // Initialize GitHub API with token
  if (!githubAPI) {
    githubAPI = new GitHubAPI();
  }
  githubAPI.setToken(token);

  // Show progress
  document.getElementById('tokenSetup').classList.add('hidden');
  document.getElementById('importProgress').classList.remove('hidden');
  document.getElementById('importStatus').textContent = 'Validating token...';

  try {
    // Validate token
    const validation = await githubAPI.validateToken();
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid token');
    }

    document.getElementById('importStatus').textContent = `Connected as ${validation.username}. Starting import...`;

    // Perform the import
    await performImport();

  } catch (error) {
    // Show error and go back to token setup
    document.getElementById('tokenSetup').classList.remove('hidden');
    document.getElementById('importProgress').classList.add('hidden');
    showTokenError(error.message);
  }
}

function showTokenError(message) {
  const errorDiv = document.getElementById('tokenError');
  errorDiv.querySelector('p').textContent = message;
  errorDiv.classList.remove('hidden');
}

async function performImport() {
  // Show progress
  document.getElementById('tokenSetup').classList.add('hidden');
  document.getElementById('importProgress').classList.remove('hidden');
  document.getElementById('importResults').classList.add('hidden');

  const progressBar = document.getElementById('importProgressBar');
  const statusText = document.getElementById('importStatus');

  try {
    // Import owned repositories
    statusText.textContent = 'Fetching your repositories...';
    progressBar.style.width = '25%';

    const ownedRepos = await githubAPI.fetchOwnedRepositories();

    statusText.textContent = `Found ${ownedRepos.length} owned repositories. Processing...`;
    progressBar.style.width = '50%';

    // Import starred repositories
    statusText.textContent = 'Fetching starred repositories...';
    progressBar.style.width = '75%';

    const starredRepos = await githubAPI.fetchStarredRepositories();

    statusText.textContent = `Found ${starredRepos.length} starred repositories. Processing...`;
    progressBar.style.width = '90%';

    // Merge with existing data (avoid duplicates)
    let newOwnedCount = 0;
    let newStarredCount = 0;

    // Process owned repos
    ownedRepos.forEach(newRepo => {
      const exists = repositories.owned.some(r =>
        r.url === newRepo.url ||
        (r.name === newRepo.name && r.owner === newRepo.owner)
      );
      if (!exists) {
        repositories.owned.push(newRepo);
        newOwnedCount++;
      }
    });

    // Process starred repos
    starredRepos.forEach(newRepo => {
      const exists = repositories.starred.some(r =>
        r.url === newRepo.url ||
        (r.name === newRepo.name && r.owner === newRepo.owner)
      );
      if (!exists) {
        repositories.starred.push(newRepo);
        newStarredCount++;
      }
    });

    // Sort repositories by update date (newest first)
    repositories.owned.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    repositories.starred.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Save data
    saveData();
    renderRepositories();

    // Show results
    progressBar.style.width = '100%';
    statusText.textContent = 'Import complete!';

    setTimeout(() => {
      document.getElementById('importProgress').classList.add('hidden');
      document.getElementById('importResults').classList.remove('hidden');

      const summaryText = `Imported ${newOwnedCount} owned and ${newStarredCount} starred repositories.` +
        (newOwnedCount === 0 && newStarredCount === 0 ? ' All repositories were already in your list.' : '');
      document.getElementById('importSummary').textContent = summaryText;

      // Store last sync time
      localStorage.setItem('lastGitHubSync', new Date().toISOString());
    }, 500);

  } catch (error) {
    console.error('Import error:', error);

    // Check if it's a token error
    if (error.message.includes('token') || error.message.includes('401')) {
      // Clear the bad token
      githubAPI.clearToken();
      // Show token setup again
      document.getElementById('tokenSetup').classList.remove('hidden');
      document.getElementById('importProgress').classList.add('hidden');
      showTokenError(error.message);
    } else {
      // Show error in progress area
      statusText.textContent = `Error: ${error.message}`;
      progressBar.style.width = '0%';
      progressBar.classList.add('bg-red-600');

      setTimeout(() => {
        closeImportModal();
      }, 3000);
    }
  }
}

// Quick import function (when token already exists)
async function quickImport() {
  if (!githubAPI) {
    githubAPI = new GitHubAPI();
  }

  if (githubAPI.hasToken()) {
    document.getElementById('importModal').classList.remove('hidden');
    document.getElementById('importModal').classList.add('open');
    await performImport();
  } else {
    openImportModal();
  }
}