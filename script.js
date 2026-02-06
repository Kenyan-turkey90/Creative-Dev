// ===== BACKEND INTEGRATION =====
class BackendIntegration {
    constructor() {
        // Use this URL for local development
        this.apiBase = 'http://localhost:5000/api';
        this.isBackendAvailable = false;
        
        console.log('🔗 Initializing backend connection...');
        this.init();
    }
    
    async init() {
        // Check if backend is available
        const isAvailable = await this.checkBackend();
        
        if (isAvailable) {
            console.log('✅ Backend connected successfully');
            this.updateContactForm();
            this.trackPageView();
        } else {
            console.log('⚠️ Backend not available, using local mode');
            this.setupLocalFallback();
        }
    }
    
    async checkBackend() {
        try {
            console.log('🔄 Checking backend health...');
            const response = await fetch(`${this.apiBase}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('📊 Backend status:', data);
                this.isBackendAvailable = true;
                return true;
            }
        } catch (error) {
            console.log('❌ Cannot reach backend:', error.message);
        }
        return false;
    }
    
    updateContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;
        
        console.log('📝 Setting up contact form with backend...');
        
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Get form values
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                subject: document.getElementById('subject')?.value.trim() || 'No subject',
                message: document.getElementById('message').value.trim()
            };
            
            // Validation
            if (!formData.name || !formData.email || !formData.message) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            try {
                console.log('📤 Sending contact form data:', formData);
                
                const response = await fetch(`${this.apiBase}/contact`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification(result.message, 'success');
                    contactForm.reset();
                    console.log('✅ Contact form submitted successfully');
                } else {
                    showNotification(result.message || 'Failed to send message', 'error');
                    console.error('❌ Contact form error:', result);
                }
            } catch (error) {
                console.error('❌ Network error:', error);
                showNotification('Failed to connect to server. Please try again later.', 'error');
                
                // Fallback to local storage
                this.saveContactLocally(formData);
            } finally {
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    saveContactLocally(formData) {
        try {
            // Get existing contacts or create new array
            const contacts = JSON.parse(localStorage.getItem('portfolio_contacts') || '[]');
            
            // Add new contact
            contacts.push({
                ...formData,
                id: Date.now(),
                timestamp: new Date().toISOString()
            });
            
            // Save back to localStorage
            localStorage.setItem('portfolio_contacts', JSON.stringify(contacts));
            
            console.log('💾 Contact saved locally:', formData);
            showNotification('Message saved locally. Will send when connection is restored.', 'warning');
            
        } catch (error) {
            console.error('Failed to save contact locally:', error);
        }
    }
    
    setupLocalFallback() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;
        
        console.log('🔧 Setting up local fallback for contact form...');
        
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                subject: document.getElementById('subject')?.value.trim() || 'No subject',
                message: document.getElementById('message').value.trim()
            };
            
            this.saveContactLocally(formData);
            contactForm.reset();
        });
    }
    
    async trackPageView() {
        try {
            await fetch(`${this.apiBase}/analytics/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page: window.location.pathname,
                    referrer: document.referrer || 'direct',
                    screenSize: `${window.innerWidth}x${window.innerHeight}`,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            // Silent fail for analytics
        }
    }
    
    // Method to sync locally saved contacts when backend is back online
    async syncLocalContacts() {
        try {
            const contacts = JSON.parse(localStorage.getItem('portfolio_contacts') || '[]');
            
            if (contacts.length > 0 && this.isBackendAvailable) {
                console.log(`🔄 Syncing ${contacts.length} locally saved contacts...`);
                
                for (const contact of contacts) {
                    await fetch(`${this.apiBase}/contact`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(contact)
                    });
                }
                
                // Clear local storage after successful sync
                localStorage.removeItem('portfolio_contacts');
                console.log('✅ All contacts synced successfully');
            }
        } catch (error) {
            console.error('Failed to sync contacts:', error);
        }
    }
}

// Initialize backend connection
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Portfolio frontend loaded');
    
    // Initialize backend (only if not on file:// protocol)
    if (window.location.protocol !== 'file:') {
        window.backend = new BackendIntegration();
        
        // Check backend health every 30 seconds
        setInterval(() => {
            window.backend?.checkBackend().then(isAvailable => {
                if (isAvailable) {
                    window.backend.syncLocalContacts();
                }
            });
        }, 30000);
    } else {
        console.log('📁 Running in file mode - backend features limited');
        showNotification('Running in local file mode. Some features may be limited.', 'info');
    }
});
// ===== DOM ELEMENTS =====
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.querySelector('.nav-links');
const contactForm = document.getElementById('contactForm');
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const playVideoBtn = document.getElementById('playVideo');
const currentYearSpan = document.getElementById('currentYear');

// ===== MOBILE MENU TOGGLE =====
menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuBtn.innerHTML = navLinks.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    });
});

// ===== FORM SUBMISSION =====
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // Simple validation
    if (!name || !email || !message) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // In a real project, you would send this data to a server
    // For now, we'll simulate a successful submission
    showNotification(`Thanks for your message, ${name}! I'll get back to you soon.`, 'success');
    
    // Reset form
    contactForm.reset();
});

// ===== PROJECT FILTERING =====
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        const filter = button.getAttribute('data-filter');
        
        // Show/hide projects based on filter
        projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            
            if (filter === 'all' || filter === category) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 10);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    });
});

// ===== VIDEO PLAYER SIMULATION =====
playVideoBtn?.addEventListener('click', () => {
    const videoPlaceholder = document.querySelector('.video-placeholder');
    videoPlaceholder.innerHTML = `
        <div class="video-player">
            <div class="video-header">
                <h3>My Showreel 2024</h3>
                <button class="close-video"><i class="fas fa-times"></i></button>
            </div>
            <div class="video-frame">
                <i class="fas fa-play-circle"></i>
                <p>Video player would be embedded here</p>
                <p class="video-note">(In a real portfolio, embed your actual video)</p>
            </div>
        </div>
    `;
    
    // Add close functionality
    document.querySelector('.close-video')?.addEventListener('click', () => {
        videoPlaceholder.innerHTML = `
            <i class="fas fa-play-circle"></i>
            <h3>Video Showcase</h3>
            <p>My best video edits, motion graphics, and visual effects compilation</p>
            <button class="btn btn-primary" id="playVideo">Play Reel</button>
        `;
        
        // Re-attach event listener to new button
        document.getElementById('playVideo')?.addEventListener('click', () => {
            playVideoBtn.click();
        });
    });
});

// ===== SET CURRENT YEAR =====
currentYearSpan.textContent = new Date().getFullYear();

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// ===== NOTIFICATION SYSTEM =====
// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Icons based on type
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="fas ${icons[type] || 'fa-info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                background: rgba(5, 5, 16, 0.95);
                backdrop-filter: blur(10px);
                border: 1px solid;
                border-radius: 10px;
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 1rem;
                animation: slideInRight 0.3s ease-out;
                max-width: 400px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }
            
            .notification-success {
                border-color: #00ff9d;
                color: #00ff9d;
            }
            
            .notification-error {
                border-color: #ff5555;
                color: #ff5555;
            }
            
            .notification-warning {
                border-color: #ffaa00;
                color: #ffaa00;
            }
            
            .notification-info {
                border-color: #00f3ff;
                color: #00f3ff;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                margin-left: auto;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Add close functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 85, 85, 0.2)'};
        border: 1px solid ${type === 'success' ? '#00ff88' : '#ff5555'};
        border-radius: 8px;
        backdrop-filter: blur(10px);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 1rem;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    // Add close button styles
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: ${type === 'success' ? '#00ff88' : '#ff5555'};
        cursor: pointer;
        font-size: 1rem;
    `;
    
    document.body.appendChild(notification);
    
    // Add close functionality
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    // Add CSS for animations
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== SKILL CARDS HOVER EFFECT =====
document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        const skill = card.getAttribute('data-skill');
        const icon = card.querySelector('.skill-icon i');
        
        // Add pulse animation to icon
        icon.style.animation = 'pulse 0.5s';
        
        // Remove animation after it completes
        setTimeout(() => {
            icon.style.animation = '';
        }, 500);
    });
});

// ===== FORM INPUT ANIMATIONS =====
document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', () => {
        if (!input.value) {
            input.parentElement.classList.remove('focused');
        }
    });
});

// ===== SCROLL-REVEAL ANIMATIONS =====
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const nav = document.querySelector('.navbar');
    
    // Add shadow to navbar on scroll
    if (window.scrollY > 50) {
        nav.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.3)';
    } else {
        nav.style.boxShadow = 'none';
    }
    
    // Reveal sections on scroll
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (sectionTop < windowHeight * 0.85) {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }
    });
});

// Initialize sections with hidden state
document.querySelectorAll('section:not(#home)').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
});

// ===== INITIALIZE ON LOAD =====
window.addEventListener('load', () => {
    // Show hero content with delay
    setTimeout(() => {
        document.querySelector('.hero-content').style.opacity = '1';
        document.querySelector('.hero-content').style.transform = 'translateY(0)';
    }, 300);
    
    // Trigger scroll event to check initial positions
    window.dispatchEvent(new Event('scroll'));
});
// ===== BACKEND INTEGRATION =====

class BackendIntegration {
    constructor() {
        this.apiBase = 'http://localhost:5000/api'; // Change in production
        this.init();
    }
    
    init() {
        // Track page view
        this.trackPageView();
        
        // Update contact form submission
        this.updateContactForm();
        
        // Track project views
        this.trackProjectViews();
    }
    
    async trackPageView() {
        try {
            await fetch(`${this.apiBase}/analytics/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page: window.location.pathname,
                    referrer: document.referrer,
                    screenSize: `${window.innerWidth}x${window.innerHeight}`,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.log('Analytics tracking failed (offline or development mode)');
        }
    }
    
    updateContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;
        
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Get form values
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch(`${this.apiBase}/contact`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification(result.message, 'success');
                    contactForm.reset();
                } else {
                    showNotification(result.message, 'error');
                }
            } catch (error) {
                console.error('Contact form error:', error);
                showNotification('Failed to send message. Please try again later.', 'error');
            } finally {
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    trackProjectViews() {
        // Track when projects come into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const projectCard = entry.target;
                    const projectName = projectCard.querySelector('h3').textContent;
                    const projectId = projectCard.dataset.projectId || projectName.toLowerCase().replace(/\s+/g, '-');
                    
                    // Send tracking data
                    this.sendProjectView(projectId, projectName);
                    
                    // Stop observing this project
                    observer.unobserve(projectCard);
                }
            });
        }, { threshold: 0.5 });
        
        // Observe all project cards
        document.querySelectorAll('.project-card').forEach(card => {
            observer.observe(card);
        });
    }
    
    async sendProjectView(projectId, projectName) {
        try {
            await fetch(`${this.apiBase}/analytics/project-view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    projectName,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            // Silent fail for analytics
        }
    }
    
    // Check backend health
    async checkHealth() {
        try {
            const response = await fetch(`${this.apiBase}/health`);
            const data = await response.json();
            console.log('Backend health:', data);
            return data;
        } catch (error) {
            console.log('Backend is offline or not configured');
            return null;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we should initialize backend (only in production or if backend is available)
    if (window.location.hostname !== 'file://') {
        window.backend = new BackendIntegration();
        
        // Check health after 3 seconds
        setTimeout(() => {
            window.backend?.checkHealth();
        }, 3000);
    }
});