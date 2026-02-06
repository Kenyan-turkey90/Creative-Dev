// ===== DARK/LIGHT MODE TOGGLE =====

class ThemeSwitcher {
    constructor() {
        this.themes = {
            dark: {
                primary: '#00f3ff',
                secondary: '#ff00ff',
                accent: '#00ff9d',
                dark: '#0a0a14',
                darker: '#050510',
                glass: 'rgba(255, 255, 255, 0.05)',
                text: '#f0f0ff',
                'text-secondary': 'rgba(240, 240, 255, 0.7)'
            },
            light: {
                primary: '#0066cc',
                secondary: '#cc00cc',
                accent: '#00cc66',
                dark: '#f0f0ff',
                darker: '#ffffff',
                glass: 'rgba(0, 0, 0, 0.05)',
                text: '#0a0a14',
                'text-secondary': 'rgba(10, 10, 20, 0.7)'
            },
            cyberpunk: {
                primary: '#ff00ff',
                secondary: '#00ffff',
                accent: '#ffff00',
                dark: '#0a0a0a',
                darker: '#000000',
                glass: 'rgba(255, 0, 255, 0.05)',
                text: '#ffffff',
                'text-secondary': 'rgba(255, 255, 255, 0.7)'
            },
            matrix: {
                primary: '#00ff00',
                secondary: '#00ff00',
                accent: '#00ff00',
                dark: '#000000',
                darker: '#000000',
                glass: 'rgba(0, 255, 0, 0.05)',
                text: '#00ff00',
                'text-secondary': 'rgba(0, 255, 0, 0.7)'
            }
        };
        
        this.currentTheme = 'dark';
        this.init();
    }
    
    init() {
        // Create theme switcher UI
        this.createThemeSwitcher();
        
        // Load saved theme
        this.loadSavedTheme();
        
        // Add keyboard shortcut (Ctrl+Shift+T)
        this.addKeyboardShortcut();
    }
    
    createThemeSwitcher() {
        const switcher = document.createElement('div');
        switcher.className = 'theme-switcher';
        switcher.innerHTML = `
            <button class="theme-toggle" id="themeToggle">
                <i class="fas fa-moon"></i>
            </button>
            <div class="theme-dropdown">
                <h4>Select Theme</h4>
                <div class="theme-options">
                    <button class="theme-option" data-theme="dark">
                        <span class="theme-preview dark"></span>
                        <span>Dark Futuristic</span>
                    </button>
                    <button class="theme-option" data-theme="light">
                        <span class="theme-preview light"></span>
                        <span>Light Futuristic</span>
                    </button>
                    <button class="theme-option" data-theme="cyberpunk">
                        <span class="theme-preview cyberpunk"></span>
                        <span>Cyberpunk</span>
                    </button>
                    <button class="theme-option" data-theme="matrix">
                        <span class="theme-preview matrix"></span>
                        <span>Matrix</span>
                    </button>
                </div>
            </div>
        `;
        
        // Add to navbar
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.appendChild(switcher);
        }
        
        // Add event listeners
        this.addEventListeners();
    }
    
    addEventListeners() {
        // Toggle button
        document.getElementById('themeToggle').addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelector('.theme-dropdown').classList.toggle('show');
        });
        
        // Theme options
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const theme = option.dataset.theme;
                this.setTheme(theme);
                document.querySelector('.theme-dropdown').classList.remove('show');
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            document.querySelector('.theme-dropdown').classList.remove('show');
        });
    }
    
    loadSavedTheme() {
        const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
        this.setTheme(savedTheme);
    }
    
    setTheme(themeName) {
        if (!this.themes[themeName]) return;
        
        this.currentTheme = themeName;
        const theme = this.themes[themeName];
        
        // Update CSS variables
        Object.keys(theme).forEach(key => {
            document.documentElement.style.setProperty(`--${key}`, theme[key]);
        });
        
        // Update UI
        this.updateUI(themeName);
        
        // Save to localStorage
        localStorage.setItem('portfolio-theme', themeName);
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: themeName }));
    }
    
    updateUI(themeName) {
        const toggleBtn = document.getElementById('themeToggle');
        const icon = toggleBtn.querySelector('i');
        
        // Update icon based on theme
        const icons = {
            dark: 'fa-moon',
            light: 'fa-sun',
            cyberpunk: 'fa-robot',
            matrix: 'fa-code'
        };
        
        icon.className = `fas ${icons[themeName] || 'fa-palette'}`;
        
        // Update active theme option
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.theme === themeName) {
                option.classList.add('active');
            }
        });
        
        // Add theme class to body for specific overrides
        document.body.className = `theme-${themeName}`;
        
        // Show notification
        this.showThemeNotification(themeName);
    }
    
    showThemeNotification(themeName) {
        const themeNames = {
            dark: 'Dark Futuristic',
            light: 'Light Futuristic',
            cyberpunk: 'Cyberpunk',
            matrix: 'Matrix'
        };
        
        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.innerHTML = `
            <i class="fas fa-palette"></i>
            <span>Theme changed to: <strong>${themeNames[themeName]}</strong></span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--glass);
            backdrop-filter: blur(10px);
            border: 1px solid var(--primary);
            padding: 1rem 1.5rem;
            border-radius: 10px;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 1rem;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    addKeyboardShortcut() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                const themes = Object.keys(this.themes);
                const currentIndex = themes.indexOf(this.currentTheme);
                const nextIndex = (currentIndex + 1) % themes.length;
                this.setTheme(themes[nextIndex]);
            }
        });
    }
    
    // Get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    // Cycle through themes
    cycleTheme() {
        const themes = Object.keys(this.themes);
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.setTheme(themes[nextIndex]);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeSwitcher = new ThemeSwitcher();
});