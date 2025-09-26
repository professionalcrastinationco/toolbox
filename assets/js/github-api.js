// GitHub API Integration Module
class GitHubAPI {
  constructor() {
    this.baseURL = 'https://api.github.com';
    this.token = this.getStoredToken();
  }

  // Token management
  getStoredToken() {
    const encrypted = localStorage.getItem('github_token');
    if (encrypted) {
      // Simple base64 encoding for basic obfuscation (not true encryption)
      try {
        return atob(encrypted);
      } catch {
        return null;
      }
    }
    return null;
  }

  setToken(token) {
    if (token) {
      // Simple base64 encoding for basic obfuscation
      localStorage.setItem('github_token', btoa(token));
      this.token = token;
    }
  }

  clearToken() {
    localStorage.removeItem('github_token');
    this.token = null;
  }

  hasToken() {
    return !!this.token;
  }

  // API request helper
  async makeRequest(endpoint, options = {}) {
    if (!this.token) {
      throw new Error('GitHub token not configured');
    }

    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${this.token}`,
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (response.status === 401) {
        throw new Error('Invalid GitHub token. Please check your token and try again.');
      }

      if (response.status === 403) {
        const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
        if (rateLimitRemaining === '0') {
          const resetTime = response.headers.get('X-RateLimit-Reset');
          const resetDate = new Date(resetTime * 1000);
          throw new Error(`GitHub API rate limit exceeded. Resets at ${resetDate.toLocaleTimeString()}`);
        }
        throw new Error('Access forbidden. Please check your token permissions.');
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  }

  // Fetch user's owned repositories
  async fetchOwnedRepositories() {
    const repos = [];
    let page = 1;
    const perPage = 100;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await this.makeRequest(`/user/repos?per_page=${perPage}&page=${page}&sort=updated&affiliation=owner`);

        if (response.length === 0) {
          hasMore = false;
        } else {
          repos.push(...response);
          page++;

          // GitHub has a max of 100 items per page
          if (response.length < perPage) {
            hasMore = false;
          }
        }
      } catch (error) {
        console.error('Error fetching owned repos:', error);
        throw error;
      }
    }

    return repos.map(repo => this.formatRepository(repo, 'owned'));
  }

  // Fetch user's starred repositories
  async fetchStarredRepositories() {
    const repos = [];
    let page = 1;
    const perPage = 100;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await this.makeRequest(`/user/starred?per_page=${perPage}&page=${page}`);

        if (response.length === 0) {
          hasMore = false;
        } else {
          repos.push(...response);
          page++;

          if (response.length < perPage) {
            hasMore = false;
          }
        }
      } catch (error) {
        console.error('Error fetching starred repos:', error);
        throw error;
      }
    }

    return repos.map(repo => this.formatRepository(repo, 'starred'));
  }

  // Format GitHub API response to match our data structure
  formatRepository(githubRepo, type) {
    return {
      id: `github-${type}-${githubRepo.id}`,
      name: githubRepo.name,
      description: githubRepo.description || 'No description available',
      language: githubRepo.language || 'Other',
      url: githubRepo.html_url,
      private: githubRepo.private || false,
      stars: githubRepo.stargazers_count || 0,
      forks: githubRepo.forks_count || 0,
      createdAt: githubRepo.created_at,
      updatedAt: githubRepo.updated_at,
      owner: githubRepo.owner ? githubRepo.owner.login : null,
      topics: githubRepo.topics || [],
      archived: githubRepo.archived || false
    };
  }

  // Validate token by making a simple API call
  async validateToken() {
    try {
      const user = await this.makeRequest('/user');
      return {
        valid: true,
        username: user.login,
        name: user.name,
        avatar: user.avatar_url
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  // Get rate limit status
  async getRateLimit() {
    try {
      const response = await this.makeRequest('/rate_limit');
      return {
        limit: response.rate.limit,
        remaining: response.rate.remaining,
        reset: new Date(response.rate.reset * 1000)
      };
    } catch (error) {
      console.error('Error fetching rate limit:', error);
      return null;
    }
  }
}

// Export for use in other scripts
window.GitHubAPI = GitHubAPI;