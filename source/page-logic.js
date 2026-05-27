// Page logic for Article, Agent, Musings
(function() {
    'use strict';
    const script = document.querySelector('script[data-label]');
    const LABEL = script ? script.getAttribute('data-label') : '';
    const grid = document.getElementById('posts-grid');
    const EMOJI_MAP = { '👍': '+1', '❤️': 'heart', '😂': 'laugh', '🎉': 'hooray', '🚀': 'rocket' };
    const EMOJIS = Object.keys(EMOJI_MAP);
    const ADMIN_ONLY_DIR = 'source/_admin_posts';
    let isAdmin = false;
    let adminPassword = '';

    async function loadPosts() {
        try {
            const hexoPosts = LABEL === 'article' ? await fetchHexoPosts() : [];
            const issues = await SiteAPI.fetchIssues(LABEL);
            const items = hexoPosts.concat(issues || []);
            items.sort(function(a, b) {
                return new Date(getItemDate(b)) - new Date(getItemDate(a));
            });

            if (!items || items.length === 0) {
                grid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-inbox"></i><p>暂无内容</p></div>';
                return;
            }
            grid.innerHTML = '';

            // Load all reactions from CloudBase
            const reactionsPromises = items.map(function(item) {
                const data = parseBody(item.body);
                const pageKey = getPageKey(item, data);
                return SiteAPI.getReactionsFromCloudBase(pageKey).catch(function(e) {
                    console.warn('表情计数加载失败:', e);
                    return {};
                });
            });
            const allReactions = await Promise.all(reactionsPromises);

            for (let i = 0; i < items.length; i++) {
                const card = createCard(items[i], allReactions[i] || {});
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

    function getPageKey(issue, data) {
        // Generate unique page key for reactions
        if (issue._hexo) {
            return data.link || issue._postPath || issue.title;
        }
        return LABEL + ':' + issue.number;
    }

    function createCard(issue, reactions) {
        const data = parseBody(issue.body);
        const el = document.createElement('div');
        el.className = 'post-card';
        const pageKey = getPageKey(issue, data);

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
            const count = reactions[apiName] || 0;
            html += '<button class="reaction-btn" data-page-key="' + escapeHtml(pageKey) + '" data-reaction="' + apiName + '">' + emoji + '<span class="r-count">' + (count > 0 ? count : '') + '</span></button>';
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
                const pageKey = this.dataset.pageKey;
                const countEl = this.querySelector('.r-count');

                // 乐观更新：立即显示+1
                const currentCount = parseInt(countEl.textContent) || 0;
                const optimisticCount = currentCount + 1;
                countEl.textContent = optimisticCount;
                btn.disabled = true;

                try {
                    const newCount = await SiteAPI.addReactionToCloudBase(pageKey, reaction);
                    // 使用服务器返回的真实计数
                    countEl.textContent = newCount > 0 ? newCount : '';
                } catch(e) {
                    // 失败时回滚
                    countEl.textContent = currentCount > 0 ? currentCount : '';
                    console.error('添加表情失败:', e);
                } finally {
                    btn.disabled = false;
                }
            });
        });
        startReactionRealtime(el, pageKey);
        if (window.DavidButtonMotion) window.DavidButtonMotion.enhance(el);

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
                    runPowderDelete(el, function() { el.remove(); });
                } catch(e) { alert('删除失败: ' + e.message); }
            });
        }

        return el;
    }

    function startReactionRealtime(card, pageKey) {
        if (!window.DavidCloudBaseAPI || !window.DavidCloudBaseAPI.enabled()) return;
        window.DavidCloudBaseAPI.watchReactions(pageKey, function(reactions) {
            card.querySelectorAll('.reaction-btn').forEach(function(btn) {
                const countEl = btn.querySelector('.r-count');
                const count = reactions[btn.dataset.reaction] || 0;
                countEl.textContent = count > 0 ? count : '';
            });
        }, function(error) {
            console.warn('CloudBase 表情实时监听失败:', error);
        });
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

    function runPowderDelete(element, done) {
        if (window.DavidPowderBurst) {
            window.DavidPowderBurst(element, done);
            return;
        }
        element.classList.add('shattering');
        setTimeout(done, 900);
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
    const postAdminOnly = document.getElementById('post-admin-only');
    const adminOnlySection = document.getElementById('admin-only-section');
    const adminOnlyList = document.getElementById('admin-only-list');

    if (postAdminOnly) {
        postAdminOnly.addEventListener('click', function() {
            const active = this.getAttribute('aria-pressed') !== 'true';
            this.setAttribute('aria-pressed', active ? 'true' : 'false');
            this.classList.toggle('active', active);
        });
    }

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
                ensureAdminStatus();
                // Reload posts with delete buttons
                await loadPosts();
                if (LABEL === 'article') await loadAdminOnlyArticles();
            } else {
                adminPwd.style.borderColor = '#ff4444';
                setTimeout(function() { adminPwd.style.borderColor = ''; }, 1500);
            }
        });

        adminPwd.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') adminLoginBtn.click();
        });
    }

    function ensureAdminStatus() {
        if (!adminForm || adminForm.querySelector('.admin-status')) return;
        const status = document.createElement('div');
        status.className = 'admin-status';
        const labelName = LABEL === 'article' ? '文章' : LABEL === 'agent' ? 'Agent 项目' : '内容';
        status.textContent = '管理员模式已开启，可以编辑和发布' + labelName + '，保存后会自动触发 GitHub Pages 构建。';
        adminForm.insertBefore(status, adminForm.firstChild);
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
                    const adminOnly = postAdminOnly && postAdminOnly.getAttribute('aria-pressed') === 'true';
                    if (adminOnly) {
                        await publishAdminOnlyArticle(title, desc);
                        await loadAdminOnlyArticles();
                    } else {
                        await publishHexoArticle(title, desc);
                        await loadPosts();
                    }
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

    async function publishAdminOnlyArticle(title, desc) {
        const fileEl = document.getElementById('post-file');
        const tagsEl = document.getElementById('post-tags');
        const file = fileEl && fileEl.files ? fileEl.files[0] : null;
        if (!file) throw new Error('请选择 Markdown 文件');
        if (!/\.(md|markdown)$/i.test(file.name)) throw new Error('只支持上传 Markdown (.md) 文件');
        if (!adminPassword) throw new Error('请先通过管理员验证');

        adminPush.textContent = '读取管理员文章中...';
        const extracted = stripMarkdownFrontMatter(await extractMarkdownText(file));
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        const dateText = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
        const slug = normalizeSlug(title || file.name);
        const datePrefix = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
        const postPath = ADMIN_ONLY_DIR + '/' + datePrefix + '-' + slug + '.md';
        const inputTags = tagsEl ? tagsEl.value.split(',').map(function(t) { return t.trim(); }).filter(Boolean) : [];
        const tags = ['仅管理员可见'].concat(inputTags.filter(function(tag) { return tag !== '仅管理员可见'; }));

        const markdown = buildMarkdownPost({
            title: title,
            description: desc,
            date: dateText,
            tags: tags,
            adminOnly: true,
            body: extracted
        });

        adminPush.textContent = '提交管理员文章中...';
        await SiteAPI.publishMarkdownPostAdmin(postPath, markdown, 'Publish admin-only article: ' + title, adminPassword);
        clearArticleForm();
        alert('仅管理员可见文章已保存，刷新管理员列表后可见。');
    }

    function clearArticleForm() {
        const titleEl = document.getElementById('post-title');
        const descEl = document.getElementById('post-desc');
        const tagsEl = document.getElementById('post-tags');
        const fileEl = document.getElementById('post-file');
        if (titleEl) titleEl.value = '';
        if (descEl) descEl.value = '';
        if (tagsEl) tagsEl.value = '';
        if (fileEl) fileEl.value = '';
        if (postFileName) postFileName.textContent = '未选择文件';
        if (postAdminOnly) {
            postAdminOnly.setAttribute('aria-pressed', 'false');
            postAdminOnly.classList.remove('active');
        }
    }

    async function loadAdminOnlyArticles() {
        if (!adminOnlySection || !adminOnlyList || LABEL !== 'article') return;
        adminOnlySection.style.display = 'block';
        adminOnlyList.innerHTML = '<div class="admin-only-loading">加载管理员文章中...</div>';
        try {
            const cards = [await buildVisitorLogCard()];
            const entries = await SiteAPI.listRepositoryDirectoryAdmin(ADMIN_ONLY_DIR, adminPassword);
            const files = entries.filter(function(entry) {
                return entry && entry.type === 'file' && /\.md$/i.test(entry.name || '');
            });
            const posts = await Promise.all(files.map(readAdminOnlyPost));
            posts.filter(Boolean).sort(function(a, b) {
                return new Date(b.date || 0) - new Date(a.date || 0);
            }).forEach(function(post) {
                cards.push(renderAdminOnlyCard(post));
            });
            adminOnlyList.innerHTML = cards.join('') || '<div class="admin-only-empty">暂无仅管理员可见文章</div>';
            bindAdminOnlyToggles();
            if (window.DavidButtonMotion) window.DavidButtonMotion.enhance(adminOnlySection);
        } catch (e) {
            adminOnlyList.innerHTML = '<div class="admin-only-empty">管理员文章加载失败：' + escapeHtml(e.message) + '</div>';
        }
    }

    async function readAdminOnlyPost(entry) {
        try {
            const data = await SiteAPI.getRepositoryFileAdmin(entry.path, adminPassword);
            const markdown = decodeRepositoryContent(data.content || '');
            const parsed = parseMarkdownPost(markdown);
            return Object.assign(parsed, {
                title: parsed.title || entry.name,
                path: entry.path,
                markdown: markdown
            });
        } catch (e) {
            console.warn('管理员文章读取失败:', entry && entry.path, e);
            return null;
        }
    }

    async function buildVisitorLogCard() {
        let logs = [];
        try {
            if (window.DavidCloudBaseAPI && window.DavidCloudBaseAPI.enabled()) {
                logs = await window.DavidCloudBaseAPI.listVisitLogs(adminPassword);
            }
        } catch (e) {
            console.warn('访问日志读取失败:', e);
        }
        const lines = [
            '# 网站访问 IP 属地记录',
            '',
            '> 这篇管理员文章永久置顶，用来查看访客打开了哪些页面、文章或功能。',
            '',
            '| 访问时间 | IP 属地 | IP | 行为 | 页面 | 点击/目标 | 标题 |',
            '| --- | --- | --- | --- | --- | --- | --- |'
        ];
        (logs || []).slice(0, 120).forEach(function(log) {
            lines.push('| ' + [
                formatDate(log.created_at),
                log.location || '待解析',
                log.ip || '未知',
                log.action_type || 'pageview',
                log.path || '/',
                (log.target_text || log.target || '').replace(/\|/g, '/'),
                (log.title || '').replace(/\|/g, '/')
            ].map(function(value) { return String(value || '').replace(/\n/g, ' '); }).join(' | ') + ' |');
        });
        if (!logs.length) lines.push('| 暂无记录 | - | - | - | - | - | - |');
        return renderAdminOnlyCard({
            title: '网站访问 IP 属地记录',
            date: new Date().toISOString(),
            tags: ['仅管理员可见', '永久置顶', '访问日志'],
            description: '记录访问时间、IP 属地、访问页面/文章/Agent 等行为。',
            markdown: lines.join('\n'),
            pinned: true
        });
    }

    function decodeRepositoryContent(content) {
        const clean = String(content || '').replace(/\s/g, '');
        const binary = atob(clean);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return new TextDecoder('utf-8').decode(bytes);
    }

    function parseMarkdownPost(markdown) {
        const result = { title: '', date: '', tags: [], description: '', body: markdown || '' };
        const text = String(markdown || '').replace(/\r\n/g, '\n');
        const match = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
        if (!match) return result;
        result.body = match[2] || '';
        const lines = match[1].split('\n');
        let currentList = '';
        lines.forEach(function(line) {
            const pair = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
            if (pair) {
                currentList = pair[1];
                const key = pair[1];
                const value = unquoteYaml(pair[2]);
                if (key === 'title') result.title = value;
                if (key === 'date') result.date = value;
                if (key === 'description') result.description = value;
                return;
            }
            const listItem = line.match(/^\s*-\s*(.*)$/);
            if (listItem && currentList === 'tags') result.tags.push(unquoteYaml(listItem[1]));
        });
        return result;
    }

    function unquoteYaml(value) {
        return String(value || '').trim().replace(/^["']|["']$/g, '').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }

    function renderAdminOnlyCard(post) {
        const tags = Array.isArray(post.tags) ? post.tags : String(post.tags || '').split(',').map(function(t) { return t.trim(); }).filter(Boolean);
        return [
            '<article class="admin-only-card' + (post.pinned ? ' pinned' : '') + '">',
            '<div class="admin-only-meta">',
            post.pinned ? '<span class="admin-only-pin"><i class="fa-solid fa-thumbtack"></i> 永久置顶</span>' : '<span class="admin-only-pin"><i class="fa-solid fa-lock"></i> 仅管理员可见</span>',
            '<span>' + escapeHtml(formatDate(post.date || new Date().toISOString())) + '</span>',
            '</div>',
            '<h4>' + escapeHtml(post.title || '未命名管理员文章') + '</h4>',
            post.description ? '<p>' + escapeHtml(post.description) + '</p>' : '',
            '<div class="post-card-tags">' + tags.map(function(tag) { return '<span>#' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
            '<button class="admin-only-preview-btn" type="button"><i class="fa-solid fa-file-lines"></i> 查看 Markdown</button>',
            '<pre class="admin-only-markdown" style="display:none;">' + escapeHtml(post.markdown || post.body || '') + '</pre>',
            '</article>'
        ].join('');
    }

    function bindAdminOnlyToggles() {
        adminOnlyList.querySelectorAll('.admin-only-preview-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const pre = btn.parentElement.querySelector('.admin-only-markdown');
                if (!pre) return;
                const open = pre.style.display !== 'none';
                pre.style.display = open ? 'none' : 'block';
                btn.innerHTML = open ? '<i class="fa-solid fa-file-lines"></i> 查看 Markdown' : '<i class="fa-solid fa-eye-slash"></i> 收起 Markdown';
                if (window.DavidButtonMotion) window.DavidButtonMotion.enhance(btn);
            });
        });
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
            options.adminOnly ? 'adminOnly: true' : '',
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
