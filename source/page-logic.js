// Page logic for Article, Agent, Musings
(function() {
    'use strict';
    const script = document.querySelector('script[data-label]');
    const LABEL = script ? script.getAttribute('data-label') : '';
    const grid = document.getElementById('posts-grid');
    const EMOJI_MAP = { '👍': '+1', '❤️': 'heart', '😂': 'laugh', '🎉': 'hooray', '🚀': 'rocket' };
    const EMOJIS = Object.keys(EMOJI_MAP);
    let isAdmin = false;
    let adminPassword = '';

    async function loadPosts() {
        try {
            const issues = await SiteAPI.fetchIssues(LABEL);
            const hexoPosts = LABEL === 'article' ? await fetchHexoPosts() : [];
            const items = hexoPosts.concat(issues || []);
            items.sort(function(a, b) {
                return new Date(getItemDate(b)) - new Date(getItemDate(a));
            });

            if (!items || items.length === 0) {
                grid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-inbox"></i><p>暂无内容</p></div>';
                return;
            }
            grid.innerHTML = '';
            for (const item of items) {
                const card = createCard(item);
                grid.appendChild(card);
            }
        } catch (e) {
            grid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-exclamation-circle"></i><p>加载失败</p></div>';
        }
    }

    async function fetchHexoPosts() {
        try {
            const res = await fetch('/article-data.json', { cache: 'no-store' });
            if (!res.ok) return [];
            const posts = await res.json();
            return posts.map(function(post, index) {
                return {
                    number: null,
                    title: post.title,
                    body: JSON.stringify(post),
                    created_at: post.date || new Date().toISOString(),
                    reactions: {},
                    _hexo: true,
                    _hexoIndex: index,
                    _postPath: post.postPath || '',
                    _sourceFile: post.sourceFile || ''
                };
            });
        } catch (e) {
            return [];
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
        html += '<div class="post-card-date"><i class="fa-solid fa-calendar fa-fw"></i> ' + (data.date || formatDate(issue.created_at)) + '</div>';

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
            html += '<a class="post-card-link" href="' + escapeHtml(data.link) + '">进入 -></a>';
        }

        html += '<div class="reaction-bar">';
        EMOJIS.forEach(function(emoji) {
            const apiName = EMOJI_MAP[emoji];
            const count = issue._hexo ? getLocalReactionCount(data.link || issue.title, apiName) : countReaction(issue.reactions, apiName);
            const keyAttr = issue._hexo ? ' data-local-key="' + escapeHtml(data.link || issue.title) + '"' : ' data-issue="' + issue.number + '"';
            html += '<button class="reaction-btn" ' + keyAttr + ' data-reaction="' + apiName + '">' + emoji + '<span class="r-count">' + (count > 0 ? count : '') + '</span></button>';
        });
        html += '</div>';

        // Admin delete button
        if (isAdmin && ((issue._hexo && issue._postPath) || (!issue._hexo && issue.number))) {
            html += '<button class="admin-delete-btn" data-kind="' + (issue._hexo ? 'hexo' : 'issue') + '" data-issue="' + (issue.number || '') + '" title="删除"><i class="fa-solid fa-trash"></i></button>';
        }

        el.innerHTML = html;

        // Bind reaction clicks
        el.querySelectorAll('.reaction-btn').forEach(function(btn) {
            btn.addEventListener('click', async function() {
                const reaction = this.dataset.reaction;
                const countEl = this.querySelector('.r-count');
                if (this.dataset.localKey) {
                    const cur = addLocalReaction(this.dataset.localKey, reaction);
                    countEl.textContent = cur > 0 ? cur : '';
                    return;
                }
                const issueNum = this.dataset.issue;
                try {
                    await SiteAPI.addReaction(parseInt(issueNum), reaction);
                    const cur = parseInt(countEl.textContent) || 0;
                    countEl.textContent = cur + 1;
                } catch(e) {}
            });
        });

        // Admin delete
        const delBtn = el.querySelector('.admin-delete-btn');
        if (delBtn) {
            delBtn.addEventListener('click', async function() {
                if (!confirm('确定删除这篇内容吗？')) return;
                try {
                    this.disabled = true;
                    if (this.dataset.kind === 'hexo') {
                        await deleteHexoArticle(issue, data, adminPassword);
                        rememberDeletedArticle(issue, data);
                        triggerPagesBuildAdmin(adminPassword);
                    } else {
                        await SiteAPI.closeIssueAdmin(parseInt(this.dataset.issue), adminPassword);
                        rememberDeletedIssue(LABEL, this.dataset.issue);
                    }
                    el.classList.add('shattering');
                    setTimeout(function() { el.remove(); }, 900);
                } catch(e) { alert('删除失败: ' + e.message); }
            });
        }

        return el;
    }

    function countReaction(reactions, name) {
        if (!reactions) return 0;
        return reactions[name] || 0;
    }

    function localReactionStorageKey(key, reaction) {
        return 'david_article_reaction_' + encodeURIComponent(key || '') + '_' + reaction;
    }

    function getLocalReactionCount(key, reaction) {
        return parseInt(localStorage.getItem(localReactionStorageKey(key, reaction))) || 0;
    }

    function addLocalReaction(key, reaction) {
        const storageKey = localReactionStorageKey(key, reaction);
        const next = (parseInt(localStorage.getItem(storageKey)) || 0) + 1;
        localStorage.setItem(storageKey, String(next));
        return next;
    }

    function deletedArticlesKey() {
        return 'david_deleted_articles';
    }

    function rememberDeletedArticle(issue, data) {
        const deleted = JSON.parse(localStorage.getItem(deletedArticlesKey()) || '[]');
        const keys = [
            issue._postPath || data.postPath || '',
            issue._sourceFile || data.sourceFile || '',
            data.link || ''
        ].filter(Boolean);
        keys.forEach(function(key) {
            if (deleted.indexOf(key) === -1) deleted.push(key);
        });
        localStorage.setItem(deletedArticlesKey(), JSON.stringify(deleted));
    }

    function deletedIssuesKey() {
        return 'david_deleted_issues';
    }

    function rememberDeletedIssue(label, issueNumber) {
        const deleted = JSON.parse(localStorage.getItem(deletedIssuesKey()) || '[]');
        const key = String(label || '') + ':' + String(issueNumber || '');
        if (deleted.indexOf(key) === -1) deleted.push(key);
        localStorage.setItem(deletedIssuesKey(), JSON.stringify(deleted));
    }

    function getItemDate(item) {
        const data = parseBody(item.body);
        return data.date || item.created_at || '';
    }

    function repoPathFromSourceUrl(url) {
        const clean = String(url || '').split('?')[0].split('#')[0];
        if (!clean) return '';
        const assetIndex = clean.indexOf('/assets/');
        if (assetIndex >= 0) return 'source' + clean.slice(assetIndex);
        if (clean.indexOf('/assets/') === 0) return 'source' + clean;
        if (clean.indexOf('assets/') === 0) return 'source/' + clean;
        if (clean.indexOf('source/') === 0) return clean;
        return '';
    }

    async function deleteHexoArticle(issue, data, password) {
        const postPath = issue._postPath || data.postPath || '';
        const sourcePath = repoPathFromSourceUrl(issue._sourceFile || data.sourceFile || '');
        if (sourcePath) {
            await SiteAPI.deleteRepositoryFileAdmin(sourcePath, 'Delete article source: ' + (data.title || issue.title), password);
        }
        if (!postPath) throw new Error('找不到文章 Markdown 路径');
        await SiteAPI.deleteRepositoryFileAdmin(postPath, 'Delete article: ' + (data.title || issue.title), password);
    }

    function triggerPagesBuild(token) {
        SiteAPI.dispatchPagesWorkflow(token).catch(function(e) {
            console.warn(e);
        });
    }

    function triggerPagesBuildAdmin(password) {
        SiteAPI.dispatchPagesWorkflowAdmin(password).catch(function(e) {
            console.warn(e);
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatDate(isoStr) {
        var d = new Date(isoStr);
        var pad = function(n){return String(n).padStart(2,'0');};
        return d.getFullYear()+'/'+pad(d.getMonth()+1)+'/'+pad(d.getDate())+' '+pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
    }

    // Admin panel logic
    const adminToggle = document.getElementById('admin-toggle');
    const adminLogin = document.getElementById('admin-login');
    const adminForm = document.getElementById('admin-form');
    const adminPwd = document.getElementById('admin-pwd');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminPush = document.getElementById('admin-push');
    const postFile = document.getElementById('post-file');
    const postFileName = document.getElementById('post-file-name');
    const postMediaFile = document.getElementById('post-media-file');
    const postMediaFileName = document.getElementById('post-media-file-name');

    if (postFile && postFileName) {
        postFile.addEventListener('change', function() {
            postFileName.textContent = this.files && this.files[0] ? this.files[0].name : '未选择文件';
        });
    }

    if (postMediaFile && postMediaFileName) {
        postMediaFile.addEventListener('change', function() {
            postMediaFileName.textContent = this.files && this.files[0] ? this.files[0].name : '未选择文件';
        });
    }

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
                isAdmin = true;
                adminPassword = pwd;
                adminLogin.style.display = 'none';
                adminToggle.style.display = 'none';
                adminForm.style.display = 'block';
                // Reload posts with delete buttons
                await loadPosts();
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
                if (LABEL === 'article') {
                    await publishHexoArticle(title, desc);
                    await loadPosts();
                    adminPush.disabled = false;
                    adminPush.textContent = '生成 Hexo 文章并发布';
                    return;
                }

                const bodyData = { title: title, content: desc };

                // Article/Agent specific fields
                const linkEl = document.getElementById('post-link');
                const tagsEl = document.getElementById('post-tags');
                if (linkEl) bodyData.link = linkEl.value.trim();
                if (tagsEl) bodyData.tags = tagsEl.value.trim();

                // Musings specific fields - auto date
                const dateEl = document.getElementById('post-date');
                const mediaFileEl = document.getElementById('post-media-file');
                if (!adminPassword) throw new Error('请先通过管理员验证');

                // Auto-generate date for all post types
                const now = new Date();
                const pad = n => String(n).padStart(2, '0');
                bodyData.date = now.getFullYear() + '/' + pad(now.getMonth()+1) + '/' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());

                // Handle file upload for musings
                if (mediaFileEl && mediaFileEl.files && mediaFileEl.files[0]) {
                    adminPush.textContent = '上传文件中...';
                    const mediaUrl = await SiteAPI.uploadFileAdmin(mediaFileEl.files[0], adminPassword);
                    bodyData.media = mediaUrl;
                }

                await SiteAPI.createIssueAdmin(title, JSON.stringify(bodyData), [LABEL], adminPassword);

                // Clear form
                document.getElementById('post-title').value = '';
                document.getElementById('post-desc').value = '';
                if (linkEl) linkEl.value = '';
                if (tagsEl) tagsEl.value = '';
                if (mediaFileEl) mediaFileEl.value = '';
                if (postMediaFileName) postMediaFileName.textContent = '未选择文件';

                // Reload posts
                await loadPosts();
            } catch(e) {
                alert('发布失败: ' + e.message);
            }

            adminPush.disabled = false;
            adminPush.textContent = LABEL === 'article' ? '生成 Hexo 文章并发布' : 'Push 发布';
        });
    }

    async function publishHexoArticle(title, desc) {
        const fileEl = document.getElementById('post-file');
        const tagsEl = document.getElementById('post-tags');
        const file = fileEl && fileEl.files ? fileEl.files[0] : null;
        if (!file) throw new Error('请选择 Markdown 文件');
        if (!/\.(md|markdown)$/i.test(file.name)) throw new Error('只支持上传 Markdown (.md) 文件');
        if (!adminPassword) throw new Error('请先通过管理员验证');

        adminPush.textContent = '读取 Markdown 中...';
        const extracted = stripMarkdownFrontMatter(await extractMarkdownText(file));
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        const dateText = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
        const slug = normalizeSlug(title || file.name);
        const datePrefix = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
        const postPath = 'source/_posts/' + datePrefix + '-' + slug + '.md';
        const tags = tagsEl ? tagsEl.value.split(',').map(function(t) { return t.trim(); }).filter(Boolean) : [];

        const markdown = buildMarkdownPost({
            title: title,
            description: desc,
            date: dateText,
            tags: tags,
            body: extracted
        });

        adminPush.textContent = '提交 Markdown 中...';
        await SiteAPI.publishMarkdownPostAdmin(postPath, markdown, 'Publish article: ' + title, adminPassword);

        adminPush.textContent = '触发构建中...';
        try {
            await SiteAPI.dispatchPagesWorkflowAdmin(adminPassword);
        } catch (e) {
            console.warn(e);
        }

        document.getElementById('post-title').value = '';
        document.getElementById('post-desc').value = '';
        if (tagsEl) tagsEl.value = '';
        if (fileEl) fileEl.value = '';
        if (postFileName) postFileName.textContent = '未选择文件';

        alert('文章已提交到 GitHub。GitHub Pages 构建完成后会出现在 Article 页面。');
    }

    async function extractMarkdownText(file) {
        return file.text();
    }

    function stripMarkdownFrontMatter(markdown) {
        const text = String(markdown || '').replace(/\r\n/g, '\n');
        if (!text.startsWith('---\n')) return text.trim();
        return text.replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
    }

    function normalizeSlug(value) {
        const base = String(value || '')
            .replace(/\.[^.]+$/, '')
            .trim()
            .toLowerCase()
            .replace(/[\s_]+/g, '-')
            .replace(/[^a-z0-9\-\u4e00-\u9fa5]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        return base || 'article';
    }

    function buildMarkdownPost(options) {
        const tagLines = options.tags.length ? options.tags.map(function(tag) { return '  - ' + yamlEscape(tag); }).join('\n') : '  - Article';
        const body = (options.body || '').trim() || '正文为空。';
        return [
            '---',
            'title: ' + yamlEscape(options.title),
            'date: ' + options.date,
            'tags:',
            tagLines,
            'categories:',
            '  - Article',
            'description: ' + yamlEscape(options.description || ''),
            'comments: true',
            '---',
            '',
            options.description ? '> ' + options.description : '',
            '',
            body
        ].filter(function(line, index, arr) {
            return line !== '' || arr[index - 1] !== '';
        }).join('\n') + '\n';
    }

    function yamlEscape(value) {
        return '"' + String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
    }

    function escapeAttr(value) {
        return String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // Load on page ready
    loadPosts();
})();
