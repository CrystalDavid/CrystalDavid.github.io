// Page logic for Article, Agent, Musings
(function() {
    'use strict';
    const script = document.querySelector('script[data-label]');
    const LABEL = script ? script.getAttribute('data-label') : '';
    const grid = document.getElementById('posts-grid');
    const EMOJI_MAP = { '👍': '+1', '❤️': 'heart', '😂': 'laugh', '🎉': 'hooray', '🚀': 'rocket' };
    const EMOJIS = Object.keys(EMOJI_MAP);

    async function loadPosts() {
        try {
            const issues = await SiteAPI.fetchIssues(LABEL);
            if (!issues || issues.length === 0) {
                grid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-inbox"></i><p>暂无内容</p></div>';
                return;
            }
            grid.innerHTML = '';
            for (const issue of issues) {
                const card = createCard(issue);
                grid.appendChild(card);
            }
        } catch (e) {
            grid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-exclamation-circle"></i><p>加载失败</p></div>';
        }
    }

    function parseBody(body) {
        try { return JSON.parse(body); } catch(e) { return { content: body }; }
    }

    function createCard(issue) {
        const data = parseBody(issue.body);
        const el = document.createElement('div');
        el.className = 'post-card';

        let html = '<div class="post-card-title">' + escapeHtml(data.title || issue.title) + '</div>';
        html += '<div class="post-card-date"><i class="fa-solid fa-calendar fa-fw"></i> ' + (data.date || new Date(issue.created_at).toLocaleDateString('zh-CN')) + '</div>';

        if (data.content) {
            html += '<div class="post-card-desc">' + escapeHtml(data.content) + '</div>';
        }

        if (data.media) {
            if (data.media.match(/\.(mp4|webm)$/i)) {
                html += '<div class="post-card-media"><video src="' + escapeHtml(data.media) + '" controls></video></div>';
            } else {
                html += '<div class="post-card-media"><img src="' + escapeHtml(data.media) + '" alt=""></div>';
            }
        }

        if (data.tags) {
            const tags = data.tags.split(',').map(function(t) { return t.trim(); }).filter(Boolean);
            if (tags.length) {
                html += '<div class="post-card-tags">';
                tags.forEach(function(t) { html += '<span>#' + escapeHtml(t) + '</span>'; });
                html += '</div>';
            }
        }

        if (data.link) {
            html += '<a class="post-card-link" href="' + escapeHtml(data.link) + '" target="_blank">进入 →</a>';
        }

        // Reactions
        html += '<div class="reaction-bar">';
        EMOJIS.forEach(function(emoji) {
            const apiName = EMOJI_MAP[emoji];
            const count = countReaction(issue.reactions, apiName);
            html += '<button class="reaction-btn" data-issue="' + issue.number + '" data-reaction="' + apiName + '">' + emoji + '<span class="r-count">' + (count > 0 ? count : '') + '</span></button>';
        });
        html += '</div>';

        el.innerHTML = html;

        // Bind reaction clicks
        el.querySelectorAll('.reaction-btn').forEach(function(btn) {
            btn.addEventListener('click', async function() {
                const issueNum = this.dataset.issue;
                const reaction = this.dataset.reaction;
                const countEl = this.querySelector('.r-count');
                try {
                    await SiteAPI.addReaction(parseInt(issueNum), reaction);
                    const cur = parseInt(countEl.textContent) || 0;
                    countEl.textContent = cur + 1;
                } catch(e) {}
            });
        });

        return el;
    }

    function countReaction(reactions, name) {
        if (!reactions) return 0;
        return reactions[name] || 0;
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Admin panel logic
    const adminToggle = document.getElementById('admin-toggle');
    const adminLogin = document.getElementById('admin-login');
    const adminForm = document.getElementById('admin-form');
    const adminPwd = document.getElementById('admin-pwd');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminPush = document.getElementById('admin-push');

    if (adminToggle) {
        adminToggle.addEventListener('click', function() {
            adminLogin.style.display = adminLogin.style.display === 'none' ? 'flex' : 'none';
        });
    }

    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', async function() {
            const pwd = adminPwd.value;
            const ok = await SiteAPI.verifyPassword(pwd);
            if (ok) {
                adminLogin.style.display = 'none';
                adminToggle.style.display = 'none';
                adminForm.style.display = 'block';
            } else {
                adminPwd.style.borderColor = '#ff4444';
                setTimeout(function() { adminPwd.style.borderColor = ''; }, 1500);
            }
        });

        adminPwd.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') adminLoginBtn.click();
        });
    }

    if (adminPush) {
        adminPush.addEventListener('click', async function() {
            const title = document.getElementById('post-title').value.trim();
            const desc = document.getElementById('post-desc').value.trim();
            if (!title) return;

            adminPush.disabled = true;
            adminPush.textContent = '发布中...';

            try {
                const bodyData = { title: title, content: desc };

                // Article/Agent specific fields
                const linkEl = document.getElementById('post-link');
                const tagsEl = document.getElementById('post-tags');
                if (linkEl) bodyData.link = linkEl.value.trim();
                if (tagsEl) bodyData.tags = tagsEl.value.trim();

                // Musings specific fields
                const dateEl = document.getElementById('post-date');
                const mediaEl = document.getElementById('post-media');
                if (dateEl) bodyData.date = dateEl.value.trim() || new Date().toLocaleDateString('zh-CN');
                if (mediaEl) bodyData.media = mediaEl.value.trim();

                await SiteAPI.createIssue(title, JSON.stringify(bodyData), [LABEL]);

                // Clear form
                document.getElementById('post-title').value = '';
                document.getElementById('post-desc').value = '';
                if (linkEl) linkEl.value = '';
                if (tagsEl) tagsEl.value = '';
                if (dateEl) dateEl.value = '';
                if (mediaEl) mediaEl.value = '';

                // Reload posts
                await loadPosts();
            } catch(e) {
                alert('发布失败: ' + e.message);
            }

            adminPush.disabled = false;
            adminPush.textContent = 'Push 发布';
        });
    }

    // Load on page ready
    loadPosts();
})();
