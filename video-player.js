// ===== VIDEO.JS PLAYER =====

class VideoPortfolioPlayer {
    constructor() {
        this.player = null;
        this.videos = [
            {
                title: "Web Development Showcase",
                src: "https://example.com/videos/web-dev-reel.mp4",
                poster: "https://example.com/images/video-thumb-1.jpg",
                description: "My best web development projects in motion"
            },
            {
                title: "UI/UX Design Process",
                src: "https://example.com/videos/ux-design-reel.mp4",
                poster: "https://example.com/images/video-thumb-2.jpg",
                description: "From wireframes to interactive prototypes"
            },
            {
                title: "Motion Graphics Reel",
                src: "https://example.com/videos/motion-reel.mp4",
                poster: "https://example.com/images/video-thumb-3.jpg",
                description: "After Effects and motion design projects"
            }
        ];
        
        this.init();
    }
    
    init() {
        // Create video player container
        this.createPlayerContainer();
        
        // Load Video.js if not already loaded
        if (!window.videojs) {
            this.loadVideoJS();
        } else {
            this.setupPlayer();
        }
        
        this.createVideoPlaylist();
    }
    
    loadVideoJS() {
        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://vjs.zencdn.net/7.20.3/video-js.css';
        document.head.appendChild(link);
        
        // Load JS
        const script = document.createElement('script');
        script.src = 'https://vjs.zencdn.net/7.20.3/video.min.js';
        script.onload = () => {
            // Load quality selector plugin
            const qualityScript = document.createElement('script');
            qualityScript.src = 'https://cdn.jsdelivr.net/npm/videojs-contrib-quality-levels@2.0.4/dist/videojs-contrib-quality-levels.min.js';
            qualityScript.onload = () => {
                this.setupPlayer();
            };
            document.head.appendChild(qualityScript);
        };
        document.head.appendChild(script);
    }
    
    createPlayerContainer() {
        const videoSection = document.getElementById('video');
        if (!videoSection) return;
        
        // Remove placeholder
        const placeholder = videoSection.querySelector('.video-placeholder');
        if (placeholder) placeholder.remove();
        
        // Create player container
        const container = document.createElement('div');
        container.className = 'video-player-container';
        container.innerHTML = `
            <div class="player-wrapper">
                <video 
                    id="portfolio-video" 
                    class="video-js vjs-big-play-centered vjs-fluid"
                    controls 
                    preload="auto"
                    poster="${this.videos[0].poster}"
                    data-setup='{}'
                >
                    <source src="${this.videos[0].src}" type="video/mp4" />
                    <p class="vjs-no-js">
                        To view this video please enable JavaScript, and consider upgrading to a web browser that
                        <a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
                    </p>
                </video>
            </div>
            <div class="video-playlist">
                <h3><i class="fas fa-film"></i> Video Portfolio</h3>
                <div class="playlist-items" id="playlist-items"></div>
            </div>
        `;
        
        videoSection.querySelector('.video-container').appendChild(container);
    }
    
    setupPlayer() {
        this.player = videojs('portfolio-video', {
            controls: true,
            autoplay: false,
            preload: 'auto',
            fluid: true,
            responsive: true,
            playbackRates: [0.5, 1, 1.5, 2],
            controlBar: {
                children: [
                    'playToggle',
                    'volumePanel',
                    'currentTimeDisplay',
                    'timeDivider',
                    'durationDisplay',
                    'progressControl',
                    'remainingTimeDisplay',
                    'playbackRateMenuButton',
                    'fullscreenToggle'
                ]
            }
        });
        
        // Customize player theme
        this.customizePlayer();
        
        // Add player events
        this.addPlayerEvents();
    }
    
    customizePlayer() {
        // Add custom CSS for futuristic theme
        const style = document.createElement('style');
        style.textContent = `
            .video-js {
                border-radius: 10px;
                overflow: hidden;
                border: 2px solid #00f3ff;
                background: #050510 !important;
            }
            
            .vjs-big-play-button {
                background: linear-gradient(45deg, #00f3ff, #ff00ff) !important;
                border: none !important;
                border-radius: 50% !important;
                width: 80px !important;
                height: 80px !important;
                line-height: 80px !important;
                font-size: 3rem !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%);
            }
            
            .vjs-control-bar {
                background: rgba(5, 5, 16, 0.9) !important;
                backdrop-filter: blur(10px);
                border-top: 1px solid #00f3ff;
            }
            
            .vjs-play-progress {
                background: linear-gradient(90deg, #00f3ff, #ff00ff) !important;
            }
            
            .vjs-slider {
                background: rgba(255, 255, 255, 0.1) !important;
            }
            
            .vjs-playback-rate .vjs-playback-rate-value {
                font-size: 1.2rem;
                line-height: 2;
                color: #00f3ff;
            }
        `;
        document.head.appendChild(style);
    }
    
    createVideoPlaylist() {
        const playlistContainer = document.getElementById('playlist-items');
        if (!playlistContainer) return;
        
        this.videos.forEach((video, index) => {
            const item = document.createElement('div');
            item.className = 'playlist-item';
            item.dataset.index = index;
            
            item.innerHTML = `
                <div class="playlist-thumb">
                    <i class="fas fa-play-circle"></i>
                </div>
                <div class="playlist-info">
                    <h4>${video.title}</h4>
                    <p>${video.description}</p>
                </div>
                <div class="playlist-duration">
                    <i class="fas fa-clock"></i>
                    2:30
                </div>
            `;
            
            item.addEventListener('click', () => this.playVideo(index));
            playlistContainer.appendChild(item);
        });
        
        // Set first item as active
        playlistContainer.querySelector('.playlist-item').classList.add('active');
    }
    
    playVideo(index) {
        const video = this.videos[index];
        
        // Update player source
        this.player.src({
            src: video.src,
            type: 'video/mp4'
        });
        
        this.player.poster(video.poster);
        
        // Update active playlist item
        document.querySelectorAll('.playlist-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.playlist-item[data-index="${index}"]`).classList.add('active');
        
        // Play video
        this.player.play();
        
        // Show notification
        this.showVideoNotification(video.title);
    }
    
    addPlayerEvents() {
        // Custom fullscreen behavior
        this.player.on('fullscreenchange', () => {
            if (this.player.isFullscreen()) {
                document.querySelector('.video-playlist').style.opacity = '0';
            } else {
                document.querySelector('.video-playlist').style.opacity = '1';
            }
        });
        
        // End of video
        this.player.on('ended', () => {
            const currentIndex = parseInt(document.querySelector('.playlist-item.active').dataset.index);
            const nextIndex = (currentIndex + 1) % this.videos.length;
            this.playVideo(nextIndex);
        });
    }
    
    showVideoNotification(title) {
        const notification = document.createElement('div');
        notification.className = 'video-notification';
        notification.innerHTML = `
            <i class="fas fa-play-circle"></i>
            <span>Now playing: ${title}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: rgba(0, 243, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid #00f3ff;
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
        }, 3000);
    }
    
    // Load your actual video URLs
    loadVideoURLs(videos) {
        this.videos = videos;
        if (this.player) {
            this.playVideo(0);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.videoPlayer = new VideoPortfolioPlayer();
});