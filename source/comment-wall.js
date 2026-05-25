(function() {
    'use strict';

    const API_BASE = 'https://david-comment-api.crystaldavid.deno.net';
    const NICKNAME_KEY = 'david_comment_nickname';

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
                    '<div class="msg-content">' + escapeHtml(comment.content || '') + '</div>'
                ].join('');
                els.list.appendChild(item);
            });
        } catch (error) {
            els.list.innerHTML = '<li class="article-comment-empty">留言服务暂时连接失败，请稍后重试。</li>';
        }
    }

    function bindWall(wall) {
        const els = getElements(wall);
        if (!els.nickname || !els.content || !els.submit || !els.list) return;

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

    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('[data-comment-wall]').forEach(bindWall);
    });
})();

