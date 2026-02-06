// ===== PARTICLES SYSTEM =====
function initParticles() {
    const particlesContainer = document.getElementById('particles-js');
    if (!particlesContainer) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = Math.random() * 3 + 1;
        const color = Math.random() > 0.5 ? 'var(--primary)' : 'var(--secondary)';
        const opacity = Math.random() * 0.5 + 0.1;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${opacity};
            box-shadow: 0 0 ${Math.random() * 10 + 5}px ${color};
            z-index: -1;
        `;
        
        particlesContainer.appendChild(particle);
        
        // Animate particle
        animateParticle(particle);
    }
}

function animateParticle(particle) {
    let x = parseFloat(particle.style.left);
    let y = parseFloat(particle.style.top);
    let xSpeed = (Math.random() - 0.5) * 0.3;
    let ySpeed = (Math.random() - 0.5) * 0.3;
    
    function move() {
        x += xSpeed;
        y += ySpeed;
        
        // Bounce off edges
        if (x <= 0 || x >= 100) xSpeed *= -1;
        if (y <= 0 || y >= 100) ySpeed *= -1;
        
        // Keep within bounds
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));
        
        particle.style.left = x + '%';
        particle.style.top = y + '%';
        
        requestAnimationFrame(move);
    }
    
    move();
}

// ===== TYPEWRITER EFFECT =====
function initTypewriter() {
    const typewriterElement = document.querySelector('.typewriter');
    if (!typewriterElement) return;
    
    const typewriterTexts = [
        "Building Digital Experiences",
        "Coding the Future",
        "Designing with Purpose",
        "Editing Visual Stories",
        "Creating Immersive UX"
    ];
    
    let currentTextIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function typeWriter() {
        const currentText = typewriterTexts[currentTextIndex];
        
        if (!isDeleting && charIndex < currentText.length) {
            typewriterElement.textContent += currentText.charAt(charIndex);
            charIndex++;
            typingSpeed = 100;
        } else if (isDeleting && charIndex > 0) {
            typewriterElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            isDeleting = !isDeleting;
            if (!isDeleting) {
                currentTextIndex = (currentTextIndex + 1) % typewriterTexts.length;
            }
            typingSpeed = 1000;
        }
        
        setTimeout(typeWriter, typingSpeed);
    }
    
    // Start typewriter effect
    setTimeout(typeWriter, 1000);
}

// ===== SCROLL PROGRESS INDICATOR =====
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, var(--primary), var(--secondary));
        z-index: 9999;
        transition: width 0.1s;
    `;
    
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// ===== SKILL BARS ANIMATION =====
function initSkillBars() {
    const skillCards = document.querySelectorAll('.skill-card');
    
    skillCards.forEach(card => {
        const skill = card.getAttribute('data-skill');
        let percentage;
        
        // Assign different percentages based on skill
        switch(skill) {
            case 'web': percentage = 95; break;
            case 'design': percentage = 90; break;
            case 'video': percentage = 85; break;
            case 'graphic': percentage = 80; break;
            default: percentage = 75;
        }
        
        // Create and add skill bar
        const skillBar = document.createElement('div');
        skillBar.className = 'skill-bar';
        skillBar.innerHTML = `
            <div class="skill-bar-fill" style="width: 0%"></div>
            <span class="skill-percentage">0%</span>
        `;
        
        skillBar.style.cssText = `
            width: 100%;
            height: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            margin-top: 1rem;
            position: relative;
            overflow: hidden;
        `;
        
        const skillBarFill = skillBar.querySelector('.skill-bar-fill');
        skillBarFill.style.cssText = `
            height: 100%;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
            border-radius: 4px;
            transition: width 1.5s ease-out;
        `;
        
        const skillPercentage = skillBar.querySelector('.skill-percentage');
        skillPercentage.style.cssText = `
            position: absolute;
            right: 0;
            top: -20px;
            font-size: 0.8rem;
            color: var(--primary);
        `;
        
        card.appendChild(skillBar);
        
        // Animate when in viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        skillBarFill.style.width = percentage + '%';
                        
                        // Animate percentage counter
                        let current = 0;
                        const increment = percentage / 50;
                        const timer = setInterval(() => {
                            current += increment;
                            if (current >= percentage) {
                                current = percentage;
                                clearInterval(timer);
                            }
                            skillPercentage.textContent = Math.round(current) + '%';
                        }, 30);
                    }, 300);
                    
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(card);
    });
}

// ===== CURSOR EFFECTS =====
function initCursorEffects() {
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border: 2px solid var(--primary);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        transition: width 0.2s, height 0.2s, background 0.2s;
        mix-blend-mode: difference;
    `;
    
    document.body.appendChild(cursor);
    
    // Follow cursor
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    // Change cursor on hover
    const hoverElements = document.querySelectorAll('a, button, .project-card, .skill-card');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.width = '40px';
            cursor.style.height = '40px';
            cursor.style.backgroundColor = 'rgba(0, 243, 255, 0.3)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.width = '20px';
            cursor.style.height = '20px';
            cursor.style.backgroundColor = 'transparent';
        });
    });
    
    // Hide cursor on mouse leave
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });
}

// ===== PARALLAX EFFECT =====
function initParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        hero.style.backgroundPosition = `50% ${rate}px`;
    });
}

// ===== INITIALIZE ALL ANIMATIONS =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all animation systems
    initParticles();
    initTypewriter();
    initScrollProgress();
    initSkillBars();
    initCursorEffects();
    initParallax();
    
    // Add loading animation to page
    document.body.classList.add('loaded');
    
    // Animate hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(20px)';
        heroContent.style.transition = 'opacity 1s ease, transform 1s ease';
        
        setTimeout(() => {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 500);
    }
    
    // Add animation to skill cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('slide-in-up');
                }, index * 200);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe skill cards and project cards
    document.querySelectorAll('.skill-card, .project-card').forEach(card => {
        observer.observe(card);
    });
});