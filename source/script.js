// 导航栏滚动效果
const menu = document.getElementById('menu');
let lastScrollY = 0;

if (menu) {
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const homeHeight = window.innerHeight;

        if (scrollY < homeHeight - 100) {
            menu.classList.add('menu-color');
            menu.classList.remove('hidden');
        } else {
            menu.classList.remove('menu-color');
            if (scrollY > lastScrollY && scrollY > 100) {
                menu.classList.add('hidden');
            } else {
                menu.classList.remove('hidden');
            }
        }
        lastScrollY = scrollY;
    });

    menu.classList.add('menu-color');
}

// 标题点击逻辑
const titleLink = document.querySelector('#desktop-menu .title');
if (titleLink) {
    titleLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.scrollY > 100) {
            // 滚动后点击：返回顶部
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            // 在顶部点击：刷新页面
            window.location.reload();
        }
    });
}

// 主题切换
const themeToggle = document.getElementById('theme-toggle');
const themeToast = document.getElementById('theme-toast');
let isDarkMode = localStorage.getItem('dark-mode') === 'true';

// Apply saved dark mode on load
if (isDarkMode) {
    document.body.classList.add('dark-mode');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-sun fa-fw';
    }
    // startStarfield called later after it's defined
}

if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('dark-mode', isDarkMode);

        // 更新图标
        const icon = themeToggle.querySelector('i');
        if (isDarkMode) {
            icon.className = 'fa-solid fa-sun fa-fw';
            if (themeToast) themeToast.innerHTML = '<i class="fa-solid fa-moon"></i><span>已切换到深色模式</span>';
        } else {
            icon.className = 'fa-solid fa-moon fa-fw';
            if (themeToast) themeToast.innerHTML = '<i class="fa-solid fa-sun"></i><span>已切换到浅色模式</span>';
        }

        // 显示提示
        if (themeToast) {
            themeToast.classList.add('show');
            setTimeout(() => {
                themeToast.classList.remove('show');
            }, 2000);
        }

        // 控制星空
        if (isDarkMode) {
            startStarfield();
        } else {
            stopStarfield();
        }
    });
}

// 壁纸切换
const wallpapers = [
    { src: 'assets/壁纸3.png', type: 'image' },
    { src: 'assets/壁纸.png', type: 'image' },
    { src: 'assets/壁纸1.mp4', type: 'video' },
    { src: 'assets/壁纸2.png', type: 'image' },
    { src: 'assets/壁纸4.mp4', type: 'video' },
];
let currentWallpaper = 0;

const wallpaperToggle = document.getElementById('wallpaper-toggle');
const homeBackground = document.getElementById('home-background');
const homeVideo = document.getElementById('home-video');

function applyWallpaper(index) {
    const wp = wallpapers[index];
    if (wp.type === 'video') {
        if (homeBackground) homeBackground.style.display = 'none';
        if (homeVideo) {
            homeVideo.src = encodeURI(wp.src);
            homeVideo.style.display = 'block';
            homeVideo.play();
        }
    } else {
        if (homeVideo) {
            homeVideo.pause();
            homeVideo.style.display = 'none';
        }
        if (homeBackground) {
            homeBackground.style.display = 'block';
            homeBackground.style.backgroundImage = "url('" + encodeURI(wp.src) + "')";
            homeBackground.style.backgroundSize = 'cover';
            homeBackground.style.backgroundPosition = 'center';
            homeBackground.style.backgroundRepeat = 'no-repeat';
        }
    }
}

if (wallpaperToggle) {
    wallpaperToggle.addEventListener('click', (e) => {
        e.preventDefault();
        currentWallpaper = (currentWallpaper + 1) % wallpapers.length;
        applyWallpaper(currentWallpaper);
    });
}

// 搜索按钮（暂无功能）
const searchToggle = document.getElementById('search-toggle');
if (searchToggle) {
    searchToggle.addEventListener('click', (e) => {
        e.preventDefault();
        // 暂时无功能
    });
}

// 星空效果
let starsAnimationId = null;
const canvas = document.getElementById('stars-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

function initCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = Math.max(document.documentElement.scrollHeight, window.innerHeight);
}

// 星星类
class Star {
    constructor(initial = false) {
        if (initial) {
            // 初始化时随机分布在整个屏幕
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
        } else {
            // 运行时从左边或下边生成
            if (Math.random() > 0.5) {
                // 从左边生成
                this.x = -10;
                this.y = Math.random() * canvas.height;
            } else {
                // 从下边生成
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + 10;
            }
        }

        this.size = Math.random() * 2 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;

        // 移动速度（从左下到右上的总体趋势）
        this.speedX = Math.random() * 0.3 + 0.15;
        this.speedY = -Math.random() * 0.3 - 0.15;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 215, 100, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        // 闪烁效果
        this.opacity += this.twinkleSpeed;
        if (this.opacity > 1 || this.opacity < 0.3) {
            this.twinkleSpeed = -this.twinkleSpeed;
        }

        // 直线移动（从左下到右上）
        this.x += this.speedX;
        this.y += this.speedY;

        // 边界检测：从右边或上边出去后重新从左边或下边生成
        if (this.x > canvas.width + 10 || this.y < -10) {
            // 重新从左边或下边生成
            if (Math.random() > 0.5) {
                this.x = -10;
                this.y = Math.random() * canvas.height;
            } else {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + 10;
            }
        }
    }
}

// 流星类
class ShootingStar {
    constructor() {
        this.reset();
    }

    reset() {
        // 从左边或下边随机生成
        if (Math.random() > 0.5) {
            // 从左边生成
            this.x = -50;
            this.y = Math.random() * canvas.height * 0.7 + canvas.height * 0.3;
        } else {
            // 从下边生成
            this.x = Math.random() * canvas.width * 0.5;
            this.y = canvas.height + 50;
        }

        this.length = Math.random() * 80 + 40;
        this.speed = Math.random() * 8 + 6;
        this.opacity = 1;
        this.curve = Math.random() * 0.2 - 0.1;
    }

    draw() {
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);

        const endX = this.x + this.length * 0.7;
        const endY = this.y - this.length;
        const curveX = (this.x + endX) / 2 + this.curve * this.length;
        const curveY = (this.y + endY) / 2;

        ctx.quadraticCurveTo(curveX, curveY, endX, endY);
        ctx.stroke();

        // 发光效果
        const gradient = ctx.createLinearGradient(this.x, this.y, endX, endY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity * 0.8})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    update() {
        this.x += this.speed * 0.7;
        this.y -= this.speed;
        this.opacity -= 0.008;

        if (this.opacity <= 0 || this.y < -100 || this.x > canvas.width + 100) {
            this.reset();
        }
    }
}

let stars = [];
let shootingStars = [];

function createStars() {
    stars = [];
    const starCount = Math.floor((canvas.width * canvas.height) / 6000);
    for (let i = 0; i < starCount; i++) {
        stars.push(new Star(true)); // 初始化时传入true，让星星分布在整个屏幕
    }

    shootingStars = [];
    for (let i = 0; i < 3; i++) {
        shootingStars.push(new ShootingStar());
    }
}

function animateStars() {
    if (!canvas || !isDarkMode) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制星星
    stars.forEach(star => {
        star.update();
        star.draw();
    });

    // 绘制流星
    shootingStars.forEach(star => {
        star.update();
        star.draw();
    });

    starsAnimationId = requestAnimationFrame(animateStars);
}

function startStarfield() {
    if (!canvas) return;
    initCanvas();
    createStars();
    animateStars();
}

function stopStarfield() {
    if (starsAnimationId) {
        cancelAnimationFrame(starsAnimationId);
        starsAnimationId = null;
    }
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

window.addEventListener('resize', () => {
    if (isDarkMode && canvas) {
        initCanvas();
        createStars();
    }
});

if (canvas) {
    initCanvas();
}

// Start starfield if dark mode was saved
if (isDarkMode) {
    startStarfield();
}

// 移动端菜单
const mobileToggle = document.getElementById('mobile-menu-toggle');
const mobileItems = document.getElementById('mobile-menu-items');

if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        mobileItems.style.display = mobileItems.style.display === 'none' ? 'block' : 'none';
    });
}

// 向下滚动箭头点击
const scrollArrow = document.getElementById('scroll-arrow');
if (scrollArrow) {
    scrollArrow.addEventListener('click', () => {
        window.scrollTo({
            top: window.innerHeight - 80,
            behavior: 'smooth'
        });
    });
}

// 弹窗逻辑
function setupModal(btnIds, modalId, closeId) {
    const modal = document.getElementById(modalId);
    const close = document.getElementById(closeId);

    btnIds.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modal.classList.add('show');
            });
        }
    });

    if (close) {
        close.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }
}

setupModal(['card-qq-btn'], 'qq-modal', 'qq-close');

const qqCopyBtn = document.getElementById('qq-copy-btn');
if (qqCopyBtn) {
    qqCopyBtn.addEventListener('click', async () => {
        const qq = qqCopyBtn.dataset.copy || '';
        try {
            await navigator.clipboard.writeText(qq);
            qqCopyBtn.innerHTML = '<i class="fa-solid fa-check"></i><span>已复制</span>';
            setTimeout(() => {
                qqCopyBtn.innerHTML = '<i class="fa-solid fa-copy"></i><span>复制 QQ 号</span>';
            }, 1600);
        } catch (e) {
            const numberEl = document.getElementById('qq-number');
            if (numberEl) {
                const range = document.createRange();
                range.selectNodeContents(numberEl);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    });
}

// 烟花效果
(function() {
    const fwCanvas = document.getElementById('fireworks-canvas');
    if (!fwCanvas) return;
    const fwCtx = fwCanvas.getContext('2d');
    const particles = [];
    const colors = ['#ff4444','#ffd700','#00e5ff','#ff00ff','#76ff03','#ff9100','#ff69b4','#448aff'];
    let fwAnimId = null;
    let globalMode = false;
    let globalTimer = null;
    let globalSpawnTimer = null;
    const clickTimes = [];

    function resizeFwCanvas() {
        fwCanvas.width = window.innerWidth;
        fwCanvas.height = window.innerHeight;
    }
    resizeFwCanvas();
    window.addEventListener('resize', resizeFwCanvas);

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.size = Math.random() * 4 + 2.5;
            this.opacity = 1;
            this.gravity = 0.03;
            this.life = 1;
            this.decay = Math.random() * 0.005 + 0.003;
            this.trail = [];
        }
        update() {
            this.trail.push({x: this.x, y: this.y, opacity: this.opacity * 0.5});
            if (this.trail.length > 6) this.trail.shift();
            this.vx *= 0.98;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.life -= this.decay;
            this.opacity = this.life;
            this.size *= 0.993;
        }
        draw() {
            // Draw trail
            for (let i = 0; i < this.trail.length; i++) {
                const t = this.trail[i];
                const trailOpacity = (i / this.trail.length) * this.opacity * 0.4;
                fwCtx.save();
                fwCtx.globalAlpha = Math.max(0, trailOpacity);
                fwCtx.fillStyle = this.color;
                fwCtx.beginPath();
                fwCtx.arc(t.x, t.y, Math.max(0, this.size * 0.6), 0, Math.PI * 2);
                fwCtx.fill();
                fwCtx.restore();
            }
            // Draw particle with glow
            fwCtx.save();
            fwCtx.globalAlpha = Math.max(0, this.opacity);
            fwCtx.shadowColor = this.color;
            fwCtx.shadowBlur = 8;
            fwCtx.fillStyle = this.color;
            fwCtx.beginPath();
            fwCtx.arc(this.x, this.y, Math.max(0, this.size), 0, Math.PI * 2);
            fwCtx.fill();
            fwCtx.restore();
        }
        isDead() {
            return this.life <= 0 || this.size <= 0.2;
        }
    }

    function spawnBurst(x, y, count) {
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x, y));
        }
        if (!fwAnimId) animateFireworks();
    }

    function animateFireworks() {
        fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].isDead()) particles.splice(i, 1);
        }
        if (particles.length > 0 || globalMode) {
            fwAnimId = requestAnimationFrame(animateFireworks);
        } else {
            fwAnimId = null;
        }
    }

    function startGlobalFireworks() {
        globalMode = true;
        if (!fwAnimId) animateFireworks();
        globalSpawnTimer = setInterval(function() {
            const rx = Math.random() * fwCanvas.width;
            const ry = Math.random() * fwCanvas.height * 0.8;
            spawnBurst(rx, ry, 60);
        }, 120);
        globalTimer = setTimeout(function() {
            globalMode = false;
            clearInterval(globalSpawnTimer);
            globalSpawnTimer = null;
            globalTimer = null;
        }, 5000);
    }

    document.addEventListener('click', function(e) {
        // Skip clicks on form inputs and modals only
        if (e.target.closest('input, textarea, select, .modal-overlay')) return;

        spawnBurst(e.clientX, e.clientY, 40);

        // Rapid-click detection
        const now = Date.now();
        clickTimes.push(now);
        // Keep only clicks within last 1 second
        while (clickTimes.length > 0 && now - clickTimes[0] > 1000) {
            clickTimes.shift();
        }
        if (clickTimes.length >= 5 && !globalMode) {
            clickTimes.length = 0;
            startGlobalFireworks();
        }
    });
})();

// 站点运行时间计时器
(function() {
    const startDate = new Date('2026-05-17T00:00:00');
    function updateRuntime() {
        const now = new Date();
        const diff = now - startDate;
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        const el = document.getElementById('site-runtime');
        if (el) el.textContent = '本站已运行 ' + days + ' 天 ' + hours + ' 小时 ' + mins + ' 分 ' + secs + ' 秒';
    }
    updateRuntime();
    setInterval(updateRuntime, 1000);
})();
