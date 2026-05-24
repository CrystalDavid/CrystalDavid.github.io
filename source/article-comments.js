(function() {
    'use strict';

    const wall = document.getElementById('article-comment-wall');
    if (!wall || !window.SiteAPI) return;

    const pageKey = wall.dataset.page || location.pathname;
    const list = document.getElementById('article-comment-list');
    const nicknameInput = document.getElementById('article-comment-nickname');
    const contentInput = document.getElementById('article-comment-content');
    const submitBtn = document.getElementById('article-comment-submit');

    function esc(value) {
        const div = document.createElement('div');
        div.textContent = value || '';
        return div.innerHTML;
    }

    function formatDate() {
        const d = new Date();
        const pad = n => String(n).padStart(2, '0');
        return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    }

    function parseIssue(issue) {
        try { return JSON.parse(issue.body); } catch(e) { return null; }
    }

    async function loadComments() {
        try {
            const issues = await SiteAPI.fetchIssues('article-comment');
            const comments = (issues || []).map(function(issue) {
                const data = parseIssue(issue);
                if (!data || data.page !== pageKey) return null;
                data.issue = issue;
                return data;
            }).filter(Boolean);

            if (!comments.length) {
                list.innerHTML = '<li class="article-comment-empty">暂无评论，来写第一条吧。</li>';
                return;
            }

            list.innerHTML = comments.map(function(item) {
                return '<li class="article-comment-item">' +
                    '<div class="article-comment-meta"><strong>' + esc(item.nickname || '匿名') + '</strong><span>' + esc(item.date || '') + '</span></div>' +
                    '<div class="article-comment-content">' + esc(item.content || '') + '</div>' +
                    '</li>';
            }).join('');
        } catch(e) {
            list.innerHTML = '<li class="article-comment-empty">评论加载失败，请稍后重试。</li>';
        }
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', async function() {
            const nickname = nicknameInput.value.trim();
            const content = contentInput.value.trim();
            if (!nickname) { nicknameInput.focus(); return; }
            if (!content) { contentInput.focus(); return; }

            submitBtn.disabled = true;
            submitBtn.textContent = '发布中...';
            try {
                localStorage.setItem('david_article_comment_nickname', nickname);
                const body = JSON.stringify({
                    page: pageKey,
                    nickname: nickname,
                    content: content,
                    date: formatDate()
                });
                await SiteAPI.createIssue('Comment: ' + nickname + ' @ ' + pageKey, body, ['article-comment']);
                contentInput.value = '';
                await loadComments();
            } catch(e) {
                alert('评论发布失败: ' + e.message);
            }
            submitBtn.disabled = false;
            submitBtn.textContent = '发布评论';
        });
    }

    const savedName = localStorage.getItem('david_article_comment_nickname');
    if (savedName) nicknameInput.value = savedName;
    loadComments();
})();
