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
                    setTimeout(function() { el.remove(); }, 1100);
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

    function getAdminToken() {
        const tokenEl = document.getElementById('post-token');
        let token = tokenEl ? tokenEl.value.trim() : '';
        if (!token) token = prompt('请输入 GitHub token，用于提交这次管理操作') || '';
        token = token.trim();
        if (!token) throw new Error('缺少 GitHub token');
        return token;
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

    if (postFile && postFileName) {
        postFile.addEventListener('change', function() {
            postFileName.textContent = this.files && this.files[0] ? this.files[0].name : '未选择文件';
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
                const adminToken = getAdminToken();

                // Auto-generate date for all post types
                const now = new Date();
                const pad = n => String(n).padStart(2, '0');
                bodyData.date = now.getFullYear() + '/' + pad(now.getMonth()+1) + '/' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());

                // Handle file upload for musings
                if (mediaFileEl && mediaFileEl.files && mediaFileEl.files[0]) {
                    adminPush.textContent = '上传文件中...';
                    const mediaUrl = await SiteAPI.uploadFile(mediaFileEl.files[0], adminToken);
                    bodyData.media = mediaUrl;
                }

                await SiteAPI.createIssue(title, JSON.stringify(bodyData), [LABEL], adminToken);

                // Clear form
                document.getElementById('post-title').value = '';
                document.getElementById('post-desc').value = '';
                if (linkEl) linkEl.value = '';
                if (tagsEl) tagsEl.value = '';
                if (mediaFileEl) mediaFileEl.value = '';

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
        if (!file) throw new Error('请选择 Markdown、PDF 或 Word 文件');
        if (!adminPassword) throw new Error('请先通过管理员验证');

        adminPush.textContent = '解析文件中...';
        const extracted = await extractDocumentText(file);
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        const dateText = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
        const slug = normalizeSlug(title || file.name);
        const datePrefix = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
        let sourceFile = file;
        if (!/\.pdf$/i.test(file.name)) {
            adminPush.textContent = '生成 PDF 中...';
            sourceFile = await markdownToPdfFile(extracted, title, slug);
        }
        const safeFileName = sourceFile.name.replace(/[^a-zA-Z0-9._\-\u4e00-\u9fa5]/g, '_');
        const assetDir = 'source/assets/articles/' + datePrefix + '-' + slug;
        const filePath = assetDir + '/' + safeFileName;
        const postPath = 'source/_posts/' + datePrefix + '-' + slug + '.md';
        const tags = tagsEl ? tagsEl.value.split(',').map(function(t) { return t.trim(); }).filter(Boolean) : [];

        adminPush.textContent = '上传原 PDF 中...';
        const uploaded = await SiteAPI.uploadRepositoryFileAdmin(sourceFile, filePath, 'Upload article source: ' + title, adminPassword);
        const markdown = buildMarkdownPost({
            title: title,
            description: desc,
            date: dateText,
            tags: tags,
            sourceUrl: uploaded.url,
            sourceFileName: sourceFile.name,
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

    async function extractDocumentText(file) {
        const lower = file.name.toLowerCase();
        if (lower.endsWith('.md') || lower.endsWith('.markdown')) return extractMarkdownText(file);
        if (lower.endsWith('.pdf')) return extractPdfText(file);
        if (lower.endsWith('.docx')) return extractDocxText(file);
        if (lower.endsWith('.doc')) {
            return '暂不支持在浏览器内解析旧版 .doc 正文，请另存为 .docx 后上传。\n\n原文件已随文章上传。';
        }
        throw new Error('仅支持 Markdown、PDF、DOCX 或 DOC 文件');
    }

    async function extractMarkdownText(file) {
        return file.text();
    }

    async function markdownToPdfFile(markdown, title, slug) {
        if (!window.html2pdf) {
            throw new Error('PDF 生成库加载失败，请刷新后重试');
        }
        const wrap = document.createElement('div');
        wrap.style.position = 'fixed';
        wrap.style.left = '0';
        wrap.style.top = '0';
        wrap.style.width = '794px';
        wrap.style.minHeight = '1123px';
        wrap.style.padding = '56px';
        wrap.style.boxSizing = 'border-box';
        wrap.style.background = '#ffffff';
        wrap.style.color = '#222222';
        wrap.style.fontFamily = '"Noto Sans SC", "Microsoft YaHei", Arial, sans-serif';
        wrap.style.fontSize = '15px';
        wrap.style.lineHeight = '1.8';
        wrap.style.opacity = '0.01';
        wrap.style.pointerEvents = 'none';
        wrap.style.zIndex = '0';
        wrap.innerHTML = '<h1 style="font-size:28px;margin:0 0 24px;color:#1e3e3f;">' + escapeHtml(title) + '</h1>' + markdownToHtml(markdown);
        document.body.appendChild(wrap);
        try {
            if (document.fonts && document.fonts.ready) await document.fonts.ready;
            await new Promise(function(resolve) { requestAnimationFrame(function() { requestAnimationFrame(resolve); }); });
            const blob = await window.html2pdf()
                .set({
                    margin: 0,
                    filename: slug + '.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: {
                        scale: 2,
                        useCORS: true,
                        backgroundColor: '#ffffff',
                        windowWidth: 794
                    },
                    jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
                })
                .from(wrap)
                .outputPdf('blob');
            return new File([blob], slug + '.pdf', { type: 'application/pdf' });
        } finally {
            wrap.remove();
        }
    }

    function markdownToHtml(markdown) {
        const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
        const out = [];
        let paragraph = [];
        let inCode = false;
        let codeLines = [];

        function flushParagraph() {
            if (!paragraph.length) return;
            out.push('<p style="margin:0 0 14px;">' + escapeHtml(paragraph.join('\n')).replace(/\n/g, '<br>') + '</p>');
            paragraph = [];
        }

        function flushCode() {
            if (!codeLines.length) return;
            out.push('<pre style="background:#f7f8fb;border-radius:12px;padding:14px 16px;overflow:auto;margin:18px 0;"><code>' + escapeHtml(codeLines.join('\n')) + '</code></pre>');
            codeLines = [];
        }

        lines.forEach(function(line) {
            if (/^```/.test(line.trim())) {
                if (inCode) {
                    flushCode();
                    inCode = false;
                } else {
                    flushParagraph();
                    inCode = true;
                }
                return;
            }
            if (inCode) {
                codeLines.push(line);
                return;
            }
            const heading = line.match(/^(#{1,6})\s+(.+)$/);
            if (heading) {
                flushParagraph();
                const level = Math.min(heading[1].length + 1, 4);
                out.push('<h' + level + ' style="margin:24px 0 10px;color:#3e76b7;">' + escapeHtml(heading[2]) + '</h' + level + '>');
                return;
            }
            if (!line.trim()) {
                flushParagraph();
                return;
            }
            paragraph.push(line);
        });
        flushParagraph();
        flushCode();
        return out.join('');
    }

    async function extractPdfText(file) {
        if (!window.pdfjsLib) throw new Error('PDF 解析库加载失败，请刷新后重试');
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const buffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
        const pages = [];
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const text = content.items.map(function(item) { return item.str; }).join(' ').replace(/\s+/g, ' ').trim();
            if (text) pages.push('## 第 ' + i + ' 页\n\n' + text);
        }
        return pages.join('\n\n');
    }

    async function extractDocxText(file) {
        if (!window.mammoth) throw new Error('Word 解析库加载失败，请刷新后重试');
        const buffer = await file.arrayBuffer();
        const result = await window.mammoth.convertToMarkdown({ arrayBuffer: buffer });
        return (result.value || '').trim();
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
        const body = (options.body || '').trim() || '正文解析为空，请打开原文件查看完整内容。';
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
            'source_file: ' + yamlEscape(options.sourceUrl),
            '---',
            '',
            options.description ? '> ' + options.description : '',
            '',
            '<a class="source-file-btn" href="' + escapeAttr(options.sourceUrl) + '" target="_blank" rel="noopener">查看原 PDF</a>',
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
