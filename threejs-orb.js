// ===== THREE.JS 3D SKILL ORB =====

class SkillOrb {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    async init() {
        // Check if WebGL is supported
        if (!this.detectWebGL()) {
            console.warn('WebGL not supported, skipping 3D scene');
            this.createFallbackView();
            return;
        }

        try {
            // Load Three.js if not already loaded
            if (!window.THREE) {
                await this.loadThreeJS();
            }
            
            // Load OrbitControls if not already loaded
            if (!this.OrbitControlsLoaded()) {
                await this.loadOrbitControls();
            }
            
            this.setupScene();
            this.animate();
            this.addEventListeners();
            this.isInitialized = true;
            
            console.log('Three.js scene initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Three.js:', error);
            this.createFallbackView();
        }
    }

    detectWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                     (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    OrbitControlsLoaded() {
        return window.THREE && window.THREE.OrbitControls;
    }

    loadThreeJS() {
        return new Promise((resolve, reject) => {
            if (window.THREE) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    loadOrbitControls() {
        return new Promise((resolve, reject) => {
            if (window.THREE && window.THREE.OrbitControls) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.min.js';
            script.onload = resolve;
            script.onerror = () => {
                console.log('OrbitControls failed, trying alternative CDN...');
                // Try alternative CDN
                const altScript = document.createElement('script');
                altScript.src = 'https://unpkg.com/three@0.128.0/examples/js/controls/OrbitControls.js';
                altScript.onload = resolve;
                altScript.onerror = reject;
                document.head.appendChild(altScript);
            };
            document.head.appendChild(script);
        });
    }

    createFallbackView() {
        const container = document.getElementById('threejs-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="fallback-3d" style="
                width: 100%;
                height: 600px;
                background: linear-gradient(135deg, #0a0a14, #1a1a2e);
                border-radius: 15px;
                border: 2px solid #00f3ff;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 2rem;
                box-shadow: 0 20px 40px rgba(0, 243, 255, 0.2);
            ">
                <div style="
                    width: 200px;
                    height: 200px;
                    background: linear-gradient(45deg, #00f3ff, #ff00ff);
                    border-radius: 50%;
                    margin-bottom: 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 3rem;
                    animation: pulse 2s infinite;
                ">
                    <i class="fas fa-cube"></i>
                </div>
                <h3 style="color: #00f3ff; margin-bottom: 1rem;">3D Interactive Skills Orb</h3>
                <p style="color: #f0f0ff; opacity: 0.8; max-width: 500px; margin-bottom: 2rem;">
                    This interactive 3D visualization requires WebGL support. 
                    Your browser might not support WebGL, or it might be disabled.
                </p>
                <div class="skill-points-fallback" style="
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                    justify-content: center;
                ">
                    ${['Web Dev', 'UI/UX', 'Video', 'Design', '3D', 'Motion'].map(skill => `
                        <div class="skill-point" style="
                            background: rgba(0, 243, 255, 0.1);
                            border: 1px solid #00f3ff;
                            padding: 0.5rem 1rem;
                            border-radius: 20px;
                            color: #00f3ff;
                            font-weight: 600;
                        ">
                            ${skill}
                        </div>
                    `).join('')}
                </div>
                <p style="color: #ff00ff; margin-top: 2rem; font-size: 0.9rem;">
                    <i class="fas fa-info-circle"></i>
                    Try updating your browser or enabling WebGL in settings
                </p>
            </div>
        `;
    }

    setupScene() {
        // Get container
        const container = document.getElementById('threejs-container');
        if (!container) {
            console.error('Container not found');
            return;
        }

        // Clear container
        container.innerHTML = '';
        
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = null; // Transparent background
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.z = 15;
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true,
            antialias: true,
            preserveDrawingBuffer: true
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        container.appendChild(this.renderer.domElement);
        
        // Add CSS to canvas
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.borderRadius = '15px';
        this.renderer.domElement.style.boxShadow = '0 20px 40px rgba(0, 243, 255, 0.2)';
        
        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.rotateSpeed = 0.5;
        this.controls.enableZoom = true;
        this.controls.enablePan = false;
        this.controls.maxDistance = 25;
        this.controls.minDistance = 5;
        
        // Lights
        this.addLights();
        
        // Create skill orb
        this.createSkillOrb();
        
        // Add floating particles
        this.createParticles();
        
        // Handle window resize
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
    }

    addLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Directional light (main light)
        const directionalLight = new THREE.DirectionalLight(0x00f3ff, 1);
        directionalLight.position.set(10, 10, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Point light 1 (magenta)
        const pointLight1 = new THREE.PointLight(0xff00ff, 2, 30);
        pointLight1.position.set(-10, 5, 5);
        pointLight1.castShadow = true;
        this.scene.add(pointLight1);
        
        // Point light 2 (green)
        const pointLight2 = new THREE.PointLight(0x00ff9d, 2, 30);
        pointLight2.position.set(10, -5, -5);
        pointLight2.castShadow = true;
        this.scene.add(pointLight2);
        
        // Hemisphere light for ambient color
        const hemisphereLight = new THREE.HemisphereLight(0x00aaff, 0xff00aa, 0.3);
        this.scene.add(hemisphereLight);
    }

    createSkillOrb() {
        // Main orb (wireframe icosahedron)
        const geometry = new THREE.IcosahedronGeometry(3, 2);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00f3ff,
            wireframe: true,
            transparent: true,
            opacity: 0.3,
            shininess: 100
        });
        
        this.mainOrb = new THREE.Mesh(geometry, material);
        this.mainOrb.castShadow = true;
        this.scene.add(this.mainOrb);
        
        // Skill points (spheres around the orb)
        this.skillPoints = [];
        const skills = [
            { name: 'Web Dev', color: 0x00f3ff, icon: '💻', radius: 0.7 },
            { name: 'UI/UX', color: 0xff00ff, icon: '🎨', radius: 0.7 },
            { name: 'Video', color: 0x00ff9d, icon: '🎬', radius: 0.7 },
            { name: 'Design', color: 0xffaa00, icon: '✏️', radius: 0.7 },
            { name: '3D', color: 0x9d4edd, icon: '🔮', radius: 0.7 },
            { name: 'Motion', color: 0xff6d00, icon: '🌀', radius: 0.7 },
            { name: 'Frontend', color: 0x00aaff, icon: '⚡', radius: 0.7 },
            { name: 'Backend', color: 0xff5555, icon: '⚙️', radius: 0.7 }
        ];
        
        const radius = 6; // Distance from center
        
        skills.forEach((skill, index) => {
            // Calculate position using spherical coordinates
            const phi = Math.acos(-1 + (2 * index) / skills.length);
            const theta = Math.sqrt(skills.length * Math.PI) * phi;
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            // Create sphere for skill
            const sphereGeometry = new THREE.SphereGeometry(skill.radius, 32, 32);
            const sphereMaterial = new THREE.MeshStandardMaterial({
                color: skill.color,
                emissive: skill.color,
                emissiveIntensity: 0.3,
                metalness: 0.7,
                roughness: 0.2
            });
            
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(x, y, z);
            sphere.castShadow = true;
            sphere.receiveShadow = true;
            sphere.userData = skill;
            
            // Add glow effect
            const glowGeometry = new THREE.SphereGeometry(skill.radius * 1.3, 32, 32);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: skill.color,
                transparent: true,
                opacity: 0.2,
                side: THREE.BackSide
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.set(x, y, z);
            sphere.add(glow);
            
            this.scene.add(sphere);
            this.skillPoints.push(sphere);
            
            // Create connecting line to center
            const lineMaterial = new THREE.LineBasicMaterial({
                color: skill.color,
                transparent: true,
                opacity: 0.2,
                linewidth: 2
            });
            
            const points = [
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(x, y, z)
            ];
            
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, lineMaterial);
            this.scene.add(line);
        });
    }

    createParticles() {
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        const color = new THREE.Color();
        
        for (let i = 0; i < particleCount; i++) {
            // Random position in a sphere
            const radius = 20;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Random color between cyan and magenta
            color.setHSL(Math.random() * 0.2 + 0.5, 0.8, 0.6);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
            
            // Random size
            sizes[i] = Math.random() * 0.1 + 0.05;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    handleResize() {
        const container = document.getElementById('threejs-container');
        if (!container || !this.camera || !this.renderer) return;
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        if (!this.isInitialized) return;
        
        requestAnimationFrame(() => this.animate());
        
        // Rotate main orb
        if (this.mainOrb) {
            this.mainOrb.rotation.x += 0.002;
            this.mainOrb.rotation.y += 0.003;
        }
        
        // Animate skill points
        if (this.skillPoints) {
            const time = Date.now() * 0.001;
            
            this.skillPoints.forEach((point, i) => {
                // Slight floating animation
                point.position.y += Math.sin(time + i) * 0.002;
                
                // Pulsing effect
                const scale = 1 + Math.sin(time * 2 + i) * 0.1;
                point.scale.setScalar(scale);
                
                // Slow rotation
                point.rotation.x += 0.01;
                point.rotation.y += 0.01;
            });
        }
        
        // Animate particles
        if (this.particles) {
            this.particles.rotation.y += 0.0005;
        }
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Render
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    addEventListeners() {
        const container = document.getElementById('threejs-container');
        if (!container) return;
        
        // Click interaction
        container.addEventListener('click', (event) => {
            if (!this.camera || !this.skillPoints) return;
            
            // Calculate mouse position in normalized device coordinates
            const rect = container.getBoundingClientRect();
            const mouse = new THREE.Vector2(
                ((event.clientX - rect.left) / container.clientWidth) * 2 - 1,
                -((event.clientY - rect.top) / container.clientHeight) * 2 + 1
            );
            
            // Raycasting
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, this.camera);
            
            const intersects = raycaster.intersectObjects(this.skillPoints);
            if (intersects.length > 0) {
                const skill = intersects[0].object.userData;
                this.showSkillInfo(skill);
            }
        });
        
        // Mouse move for hover effect
        container.addEventListener('mousemove', (event) => {
            if (!this.camera || !this.skillPoints) return;
            
            const rect = container.getBoundingClientRect();
            const mouse = new THREE.Vector2(
                ((event.clientX - rect.left) / container.clientWidth) * 2 - 1,
                -((event.clientY - rect.top) / container.clientHeight) * 2 + 1
            );
            
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, this.camera);
            
            const intersects = raycaster.intersectObjects(this.skillPoints);
            container.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
        });
    }

    showSkillInfo(skill) {
        // Remove existing notification
        const existing = document.querySelector('.skill-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = 'skill-notification';
        notification.innerHTML = `
            <div class="skill-notification-content">
                <span style="font-size: 3rem">${skill.icon}</span>
                <h3 style="color: #${skill.color.toString(16)}; margin: 1rem 0;">${skill.name}</h3>
                <p>Click and drag to rotate • Scroll to zoom</p>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(10, 10, 20, 0.95);
            backdrop-filter: blur(20px);
            padding: 2rem 3rem;
            border-radius: 20px;
            border: 2px solid #${skill.color.toString(16)};
            box-shadow: 0 0 50px rgba(${skill.color >> 16}, ${skill.color >> 8 & 255}, ${skill.color & 255}, 0.5);
            z-index: 10000;
            animation: zoomIn 0.3s ease-out;
            text-align: center;
            min-width: 250px;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 2 seconds
        setTimeout(() => {
            notification.style.animation = 'zoomOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 2000);
    }
}

// Initialize when everything is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure DOM is fully ready
    setTimeout(() => {
        window.skillOrb = new SkillOrb();
    }, 500);
});