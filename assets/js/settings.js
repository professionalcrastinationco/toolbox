// Settings management for GitHub Toolbox
class SettingsManager {
  constructor() {
    this.settings = null;
    this.defaultSettings = {
      cardElements: {
        owned: {
          visibility: true,
          language: true,
          stars: true,
          forks: true,
          createdDate: true,
          updatedDate: true,
          owner: true,
          description: true,
          archived: true,
          topics: true,
          actionMenu: true
        },
        starred: {
          visibility: true,
          language: true,
          stars: true,
          forks: true,
          createdDate: true,
          updatedDate: true,
          owner: true,
          description: true,
          archived: true,
          topics: true,
          actionMenu: true
        }
      },
      version: "1.0.0"
    };
    this.loadSettings();
  }

  // Load settings from localStorage or default from settings.json
  async loadSettings() {
    // First try localStorage
    const stored = localStorage.getItem('githubSettings');
    if (stored) {
      try {
        this.settings = JSON.parse(stored);
        return this.settings;
      } catch (e) {
        console.error('Error parsing stored settings:', e);
      }
    }

    // Try to load from settings.json
    try {
      const response = await fetch('/toolbox/settings.json');
      if (response.ok) {
        this.settings = await response.json();
      } else {
        this.settings = this.defaultSettings;
      }
    } catch (e) {
      console.error('Error loading settings.json:', e);
      this.settings = this.defaultSettings;
    }

    // Save to localStorage
    this.saveSettings();
    return this.settings;
  }

  // Save settings to localStorage
  saveSettings() {
    if (this.settings) {
      localStorage.setItem('githubSettings', JSON.stringify(this.settings));
    }
  }

  // Get settings for a specific repository type
  getCardSettings(type) {
    if (!this.settings || !this.settings.cardElements) {
      return this.defaultSettings.cardElements[type];
    }
    return this.settings.cardElements[type] || this.defaultSettings.cardElements[type];
  }

  // Update a specific setting
  updateSetting(type, element, value) {
    if (!this.settings) {
      this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
    }
    if (!this.settings.cardElements[type]) {
      this.settings.cardElements[type] = JSON.parse(JSON.stringify(this.defaultSettings.cardElements[type]));
    }
    this.settings.cardElements[type][element] = value;
    this.saveSettings();

    // Trigger re-render of repository cards
    if (window.renderRepositories) {
      window.renderRepositories();
    }
  }

  // Reset settings to defaults
  resetToDefaults() {
    this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
    this.saveSettings();

    // Update UI toggles
    this.updateUIToggles();

    // Re-render repository cards
    if (window.renderRepositories) {
      window.renderRepositories();
    }
  }

  // Update UI toggles to match current settings
  updateUIToggles() {
    const types = ['owned', 'starred'];
    const elements = ['visibility', 'language', 'stars', 'forks', 'createdDate', 'updatedDate',
                     'owner', 'description', 'archived', 'topics', 'actionMenu'];

    types.forEach(type => {
      elements.forEach(element => {
        const toggle = document.getElementById(`${type}-${element}-toggle`);
        if (toggle) {
          toggle.checked = this.settings.cardElements[type][element];
        }
      });
    });
  }

  // Initialize settings UI
  initializeUI() {
    const types = ['owned', 'starred'];
    const elements = [
      { key: 'visibility', label: 'Visibility Badge', description: 'Show Public/Private badge' },
      { key: 'language', label: 'Language Tag', description: 'Show programming language' },
      { key: 'stars', label: 'Stars Count', description: 'Show star count' },
      { key: 'forks', label: 'Forks Count', description: 'Show fork count' },
      { key: 'createdDate', label: 'Created Date', description: 'Show creation date' },
      { key: 'updatedDate', label: 'Updated Date', description: 'Show last update date' },
      { key: 'owner', label: 'Owner Info', description: 'Show repository owner' },
      { key: 'description', label: 'Description', description: 'Show repository description' },
      { key: 'archived', label: 'Archive Badge', description: 'Show archived status' },
      { key: 'topics', label: 'Topics', description: 'Show repository topics' },
      { key: 'actionMenu', label: 'Action Menu', description: 'Show dropdown menu with actions' }
    ];

    // Set up event listeners for toggles
    types.forEach(type => {
      elements.forEach(element => {
        const toggle = document.getElementById(`${type}-${element.key}-toggle`);
        if (toggle) {
          // Set initial state
          toggle.checked = this.getCardSettings(type)[element.key];

          // Add change listener
          toggle.addEventListener('change', (e) => {
            this.updateSetting(type, element.key, e.target.checked);
            this.showSaveNotification();
          });
        }
      });
    });

    // Reset button listener
    const resetBtn = document.getElementById('resetSettingsBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
          this.resetToDefaults();
          this.showSaveNotification('Settings reset to defaults');
        }
      });
    }
  }

  // Show save notification
  showSaveNotification(message = 'Settings saved') {
    const notification = document.getElementById('settingsNotification');
    if (notification) {
      notification.textContent = message;
      notification.classList.remove('hidden');
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 2000);
    }
  }
}

// Initialize settings manager
let settingsManager;
document.addEventListener('DOMContentLoaded', async () => {
  settingsManager = new SettingsManager();
  await settingsManager.loadSettings();
  settingsManager.initializeUI();
});

// Export for use in other scripts
window.settingsManager = settingsManager;