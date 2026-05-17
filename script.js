// 微信弹窗
const wechatBtn = document.getElementById('wechat-btn');
const wechatModal = document.getElementById('wechat-modal');
const wechatClose = document.getElementById('wechat-close');

wechatBtn.addEventListener('click', () => {
    wechatModal.classList.add('show');
});

wechatClose.addEventListener('click', () => {
    wechatModal.classList.remove('show');
});

wechatModal.addEventListener('click', (e) => {
    if (e.target === wechatModal) {
        wechatModal.classList.remove('show');
    }
});

// QQ弹窗
const qqBtn = document.getElementById('qq-btn');
const qqModal = document.getElementById('qq-modal');
const qqClose = document.getElementById('qq-close');

qqBtn.addEventListener('click', () => {
    qqModal.classList.add('show');
});

qqClose.addEventListener('click', () => {
    qqModal.classList.remove('show');
});

qqModal.addEventListener('click', (e) => {
    if (e.target === qqModal) {
        qqModal.classList.remove('show');
    }
});

// Agent导航 - 点击椭圆按钮跳转到对应Agent
document.querySelectorAll('.nav-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
        const agent = pill.dataset.agent;
        if (agent === 'ppt-agent') {
            window.location.href = 'https://lambent-zabaione-8eab6b.netlify.app';
        }
    });
});
