// 导航栏滚动效果
const menu = document.getElementById('menu');
let lastScrollY = 0;

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const homeHeight = window.innerHeight;

    // 滚动超过首屏后导航栏变色
    if (scrollY < homeHeight - 100) {
        menu.classList.add('menu-color');
        menu.classList.remove('hidden');
    } else {
        menu.classList.remove('menu-color');
        // 向下滚动隐藏，向上滚动显示
        if (scrollY > lastScrollY && scrollY > 100) {
            menu.classList.add('hidden');
        } else {
            menu.classList.remove('hidden');
        }
    }
    lastScrollY = scrollY;
});

// 初始状态：首屏时导航栏透明
menu.classList.add('menu-color');

// 移动端菜单
const mobileToggle = document.getElementById('mobile-menu-toggle');
const mobileItems = document.getElementById('mobile-menu-items');

if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        mobileItems.style.display = mobileItems.style.display === 'none' ? 'block' : 'none';
    });
}

// 点击首屏向下滚动
const homeInfo = document.getElementById('home-info');
if (homeInfo) {
    homeInfo.style.cursor = 'pointer';
    homeInfo.addEventListener('click', () => {
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

setupModal(['nav-wechat-btn', 'mobile-wechat-btn', 'card-wechat-btn'], 'wechat-modal', 'wechat-close');
setupModal(['nav-qq-btn', 'mobile-qq-btn', 'card-qq-btn'], 'qq-modal', 'qq-close');
