(function() {
    'use strict';

    const API_BASE = 'https://david-comment-api.crystaldavid.deno.net';
    const NICKNAME_KEY = 'david_comment_nickname';
    const PWD_HASH = 'da3fb9830dbd1b3ee2e799a06b3d8b486e5285fc508264f87777905827510551';
    let adminPassword = '';

    async function hashStr(str) {
        const buf = new TextEncoder().encode(str);
        const hash = await crypto.subtle.digest('SHA-256', buf);
        return Array.from(new Uint8Array(hash)).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    }

    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value || '';
        return div.innerHTML;
    }

    function formatTime(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value || '';
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function getElements(wall) {
        return {
            nickname: wall.querySelector('[data-comment-nickname], #msg-nickname'),
            content: wall.querySelector('[data-comment-content], #msg-content'),
            submit: wall.querySelector('[data-comment-submit], #msg-submit'),
            list: wall.querySelector('[data-comment-list], #msg-list')
        };
    }

    async function loadComments(wall) {
        const page = wall.dataset.commentPage || window.location.pathname;
        const els = getElements(wall);
        if (!els.list) return;

        els.list.innerHTML = '<li class="article-comment-empty">加载中...</li>';
        try {
            const res = await fetch(API_BASE + '/comments?page=' + encodeURIComponent(page), {
                cache: 'no-store',
                mode: 'cors',
                credentials: 'omit'
            });
            const data = await res.json();
            if (!data.ok) throw new Error(data.error || '加载失败');

            const comments = data.comments || [];
            if (!comments.length) {
                els.list.innerHTML = '<li class="article-comment-empty">暂无评论，来写第一条吧。</li>';
                return;
            }

            els.list.innerHTML = '';
            comments.forEach(function(comment) {
                const item = document.createElement('li');
                item.className = 'msg-item';
                const initial = (comment.nickname || '?').charAt(0).toUpperCase();
                item.innerHTML = [
                    '<div class="msg-header">',
                    '<div class="msg-avatar">' + escapeHtml(initial) + '</div>',
                    '<span class="msg-nickname">' + escapeHtml(comment.nickname || '匿名') + '</span>',
                    '<span class="msg-time">' + escapeHtml(formatTime(comment.created_at)) + '</span>',
                    '</div>',
                    '<div class="msg-content">' + escapeHtml(comment.content || '') + '</div>',
                    adminPassword ? '<button class="msg-delete-btn" type="button" data-id="' + escapeHtml(comment.id || '') + '" data-created="' + escapeHtml(comment.created_at || '') + '" title="删除"><i class="fa-solid fa-trash"></i></button>' : ''
                ].join('');
                els.list.appendChild(item);
            });
            bindDeleteButtons(wall);
        } catch (error) {
            els.list.innerHTML = '<li class="article-comment-empty">留言服务暂时连接失败，请稍后重试。</li>';
        }
    }

    function bindDeleteButtons(wall) {
        const els = getElements(wall);
        if (!els.list || !adminPassword) return;
        els.list.querySelectorAll('.msg-delete-btn').forEach(function(btn) {
            const item = btn.closest('.msg-item');
            if (!item) return;
            item.addEventListener('mouseenter', function() { btn.style.opacity = '1'; });
            item.addEventListener('mouseleave', function() { btn.style.opacity = '0'; });
            btn.addEventListener('click', async function() {
                if (!confirm('确定删除这条留言吗？')) return;
                btn.disabled = true;
                try {
                    const page = wall.dataset.commentPage || window.location.pathname;
                    const res = await fetch(API_BASE + '/comments', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Admin-Password': adminPassword
                        },
                        mode: 'cors',
                        credentials: 'omit',
                        body: JSON.stringify({
                            page: page,
                            id: btn.dataset.id,
                            created_at: btn.dataset.created
                        })
                    });
                    const data = await res.json();
                    if (!data.ok) throw new Error(data.error || '删除失败');
                    item.classList.add('shattering');
                    setTimeout(function() { item.remove(); }, 2000);
                } catch (e) {
                    btn.disabled = false;
                    alert('删除失败：' + e.message);
                }
            });
        });
    }

    function bindWall(wall) {
        const els = getElements(wall);
        if (!els.nickname || !els.content || !els.submit || !els.list) return;
        setupCommentAdmin(wall);

        const saved = localStorage.getItem(NICKNAME_KEY);
        if (saved) els.nickname.value = saved;

        els.submit.addEventListener('click', async function() {
            const page = wall.dataset.commentPage || window.location.pathname;
            const nickname = els.nickname.value.trim();
            const content = els.content.value.trim();
            if (!nickname) {
                els.nickname.focus();
                return;
            }
            if (!content) {
                els.content.focus();
                return;
            }

            localStorage.setItem(NICKNAME_KEY, nickname);
            els.submit.disabled = true;
            const oldText = els.submit.textContent;
            els.submit.textContent = '发布中...';

            try {
                const res = await fetch(API_BASE + '/comments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    mode: 'cors',
                    credentials: 'omit',
                    body: JSON.stringify({ page, nickname, content })
                });
                const data = await res.json();
                if (!data.ok) throw new Error(data.error || '发布失败');
                els.content.value = '';
                await loadComments(wall);
            } catch (error) {
                alert('发布失败：留言服务暂时连接失败，请稍后重试。');
            } finally {
                els.submit.disabled = false;
                els.submit.textContent = oldText;
            }
        });

        loadComments(wall);
        setInterval(function() { loadComments(wall); }, 45000);
    }

    function setupCommentAdmin(wall) {
        if (wall.dataset.commentAdminReady === 'true') return;
        wall.dataset.commentAdminReady = 'true';
        if (document.getElementById('about-admin-panel')) return;

        const tools = document.createElement('div');
        tools.className = 'comment-admin-tools';
        tools.innerHTML = [
            '<button class="comment-admin-toggle" type="button"><i class="fa-solid fa-lock"></i> 管理员</button>',
            '<div class="comment-admin-login" style="display:none;">',
            '<input type="password" class="comment-admin-pwd" placeholder="输入管理员密码">',
            '<button class="comment-admin-login-btn" type="button">验证</button>',
            '</div>'
        ].join('');
        wall.appendChild(tools);

        const toggle = tools.querySelector('.comment-admin-toggle');
        const login = tools.querySelector('.comment-admin-login');
        const pwd = tools.querySelector('.comment-admin-pwd');
        const btn = tools.querySelector('.comment-admin-login-btn');

        toggle.addEventListener('click', function() {
            login.style.display = login.style.display === 'none' ? 'flex' : 'none';
        });

        btn.addEventListener('click', async function() {
            const value = pwd.value;
            if (await hashStr(value) === PWD_HASH) {
                adminPassword = value;
                tools.style.display = 'none';
                await loadComments(wall);
            } else {
                pwd.style.borderColor = '#ff4444';
                setTimeout(function() { pwd.style.borderColor = ''; }, 1500);
            }
        });

        pwd.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') btn.click();
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('[data-comment-wall]').forEach(bindWall);
    });

    document.addEventListener('david-admin-login', function(e) {
        adminPassword = e.detail && e.detail.password ? e.detail.password : '';
        document.querySelectorAll('[data-comment-wall]').forEach(loadComments);
    });
})();

