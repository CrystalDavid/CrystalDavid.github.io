// 导航栏滚动效果
const menu = document.getElementById('menu');
let lastScrollY = 0;

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
let isDarkMode = false;

if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode');

        // 更新图标
        const icon = themeToggle.querySelector('i');
        if (isDarkMode) {
            icon.className = 'fa-solid fa-sun fa-fw';
            themeToast.innerHTML = '<i class="fa-solid fa-moon"></i><span>已切换到深色模式</span>';
        } else {
            icon.className = 'fa-solid fa-moon fa-fw';
            themeToast.innerHTML = '<i class="fa-solid fa-sun"></i><span>已切换到浅色模式</span>';
        }

        // 显示提示
        themeToast.classList.add('show');
        setTimeout(() => {
            themeToast.classList.remove('show');
        }, 2000);

        // 控制星空
        if (isDarkMode) {
            startStarfield();
        } else {
            stopStarfield();
        }
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
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;

        // 移动速度和方向（从左下到右上）
        this.speedX = Math.random() * 0.3 + 0.1;
        this.speedY = -Math.random() * 0.3 - 0.1;

        // 随机决定是否走不规则路径
        this.irregular = Math.random() > 0.5;
        if (this.irregular) {
            this.waveAmplitude = Math.random() * 2 + 1;
            this.waveFrequency = Math.random() * 0.02 + 0.01;
            this.waveOffset = Math.random() * Math.PI * 2;
        }
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

        // 移动
        if (this.irregular) {
            // 不规则路径（像浮游生物）
            this.x += this.speedX + Math.sin(Date.now() * this.waveFrequency + this.waveOffset) * this.waveAmplitude * 0.1;
            this.y += this.speedY + Math.cos(Date.now() * this.waveFrequency + this.waveOffset) * this.waveAmplitude * 0.1;
        } else {
            // 规则路径（直线）
            this.x += this.speedX;
            this.y += this.speedY;
        }

        // 边界检测：从右上角出去后从左下角重新进入
        if (this.x > canvas.width + 10) {
            this.x = -10;
            this.y = canvas.height + Math.random() * 100;
        }
        if (this.y < -10) {
            this.y = canvas.height + 10;
            this.x = Math.random() * canvas.width * 0.3;
        }
    }
}

// 流星类
class ShootingStar {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width * 0.3;
        this.y = canvas.height + Math.random() * 200;
        this.length = Math.random() * 80 + 40;
        this.speed = Math.random() * 8 + 6;
        this.opacity = 1;
        this.curve = Math.random() * 0.3 - 0.15;
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

        if (this.opacity <= 0 || this.y < -100) {
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
        stars.push(new Star());
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

setupModal(['card-wechat-btn'], 'wechat-modal', 'wechat-close');
setupModal(['card-qq-btn'], 'qq-modal', 'qq-close');
