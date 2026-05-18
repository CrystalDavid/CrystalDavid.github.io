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

// 分类筛选
const filterBar = document.getElementById('filter-bar');
const filterText = document.getElementById('filter-text');
const filterClear = document.getElementById('filter-clear');
const posts = document.querySelectorAll('.post[data-category]');

const categoryNames = {
    about: 'About',
    article: 'Article',
    agent: 'Agent',
    musings: 'Musings'
};

document.querySelectorAll('[data-category]').forEach(link => {
    if (link.classList.contains('post')) return; // 跳过卡片本身
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = link.dataset.category;
        filterByCategory(category);
        // 滚动到内容区
        const postsWrap = document.getElementById('home-posts-wrap');
        if (postsWrap) {
            window.scrollTo({
                top: postsWrap.offsetTop - 60,
                behavior: 'smooth'
            });
        }
    });
});

function filterByCategory(category) {
    filterBar.style.display = 'block';
    filterText.textContent = '当前分类：' + (categoryNames[category] || category);

    posts.forEach(post => {
        if (post.dataset.category === category) {
            post.style.display = '';
        } else {
            post.style.display = 'none';
        }
    });
}

if (filterClear) {
    filterClear.addEventListener('click', (e) => {
        e.preventDefault();
        filterBar.style.display = 'none';
        posts.forEach(post => {
            post.style.display = '';
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
