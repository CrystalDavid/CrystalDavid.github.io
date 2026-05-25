(function() {
    'use strict';

    const PWD_HASH = 'da3fb9830dbd1b3ee2e799a06b3d8b486e5285fc508264f87777905827510551';

    async function hashStr(str) {
        const buf = new TextEncoder().encode(str);
        const hash = await crypto.subtle.digest('SHA-256', buf);
        return Array.from(new Uint8Array(hash)).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    }

    function decodeAttr(value) {
        try { return decodeURIComponent(value || ''); } catch (e) { return value || ''; }
    }

    function base64ToText(value) {
        const binary = atob(String(value || '').replace(/\s/g, ''));
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return new TextDecoder().decode(bytes);
    }

    function yamlQuote(value) {
        return '"' + String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
    }

    function removeYamlBlock(lines, key) {
        const out = [];
        for (let i = 0; i < lines.length; i++) {
            if (new RegExp('^' + key + '\\s*:').test(lines[i])) {
                i++;
                while (i < lines.length && /^\s+-\s+/.test(lines[i])) i++;
                i--;
                continue;
            }
            out.push(lines[i]);
        }
        return out;
    }

    function setYamlScalar(lines, key, value) {
        const line = key + ': ' + yamlQuote(value);
        const idx = lines.findIndex(function(item) { return new RegExp('^' + key + '\\s*:').test(item); });
        if (idx >= 0) {
            lines[idx] = line;
            return lines;
        }
        lines.unshift(line);
        return lines;
    }

    function setYamlTags(lines, tags) {
        const tagLines = tags.length ? tags.map(function(tag) { return '  - ' + yamlQuote(tag); }) : ['  - Article'];
        lines = removeYamlBlock(lines, 'tags');
        const insertAt = Math.max(lines.findIndex(function(item) { return /^date\s*:/.test(item); }) + 1, 1);
        lines.splice(insertAt, 0, 'tags:', ...tagLines);
        return lines;
    }

    function updateFrontMatter(markdown, values) {
        const text = String(markdown || '');
        if (!text.startsWith('---')) throw new Error('这篇文章没有标准 front matter，暂时不能自动编辑');
        const end = text.indexOf('\n---', 3);
        if (end < 0) throw new Error('找不到 front matter 结束位置');
        const front = text.slice(4, end).replace(/^\r?\n/, '');
        const body = text.slice(end + 4).replace(/^\r?\n/, '');
        let lines = front.split(/\r?\n/);
        lines = setYamlScalar(lines, 'title', values.title);
        lines = setYamlScalar(lines, 'description', values.description);
        lines = setYamlTags(lines, values.tags);
        return '---\n' + lines.join('\n') + '\n---\n\n' + body;
    }

    function setStatus(panel, message, type) {
        const status = panel.querySelector('.article-admin-status');
        if (!status) return;
        status.textContent = message;
        status.dataset.type = type || 'info';
    }

    async function initPanel(panel) {
        const sourcePath = decodeAttr(panel.dataset.sourcePath);
        const toggle = panel.querySelector('.article-admin-toggle');
        const login = panel.querySelector('.article-admin-login');
        const pwd = panel.querySelector('.article-admin-pwd');
        const loginBtn = panel.querySelector('.article-admin-login-btn');
        const form = panel.querySelector('.article-admin-form');
        const title = panel.querySelector('.article-edit-title');
        const desc = panel.querySelector('.article-edit-desc');
        const tags = panel.querySelector('.article-edit-tags');
        const save = panel.querySelector('.article-admin-save');
        let adminPassword = '';
        let markdown = '';

        title.value = decodeAttr(panel.dataset.currentTitle);
        desc.value = decodeAttr(panel.dataset.currentDescription);
        tags.value = decodeAttr(panel.dataset.currentTags);

        toggle.addEventListener('click', function() {
            login.style.display = login.style.display === 'none' ? 'flex' : 'none';
        });

        loginBtn.addEventListener('click', async function() {
            const value = pwd.value;
            if (await hashStr(value) !== PWD_HASH) {
                pwd.style.borderColor = '#ff4444';
                setTimeout(function() { pwd.style.borderColor = ''; }, 1500);
                return;
            }
            adminPassword = value;
            document.dispatchEvent(new CustomEvent('david-admin-login', { detail: { password: value } }));
            if (window.DavidCommentWall) window.DavidCommentWall.setAdminPassword(value);
            toggle.style.display = 'none';
            login.style.display = 'none';
            form.style.display = 'block';
            setStatus(panel, '管理员模式已开启，可以编辑这篇文章的信息，保存后会自动触发 GitHub Pages 构建。', 'ok');
            try {
                const file = await SiteAPI.getRepositoryFile(sourcePath);
                markdown = base64ToText(file.content || '');
            } catch (e) {
                setStatus(panel, '已进入管理员模式，但暂时读取不到 Markdown 原文：' + e.message, 'warn');
            }
        });

        pwd.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') loginBtn.click();
        });

        save.addEventListener('click', async function() {
            if (!sourcePath) {
                setStatus(panel, '缺少文章源文件路径，不能保存。', 'error');
                return;
            }
            if (!markdown) {
                try {
                    const file = await SiteAPI.getRepositoryFile(sourcePath);
                    markdown = base64ToText(file.content || '');
                } catch (e) {
                    setStatus(panel, '读取 Markdown 失败：' + e.message, 'error');
                    return;
                }
            }
            const next = updateFrontMatter(markdown, {
                title: title.value.trim(),
                description: desc.value.trim(),
                tags: tags.value.split(',').map(function(tag) { return tag.trim(); }).filter(Boolean)
            });
            save.disabled = true;
            save.textContent = '保存中...';
            try {
                await SiteAPI.saveRepositoryTextAdmin(sourcePath, next, 'Update article meta: ' + title.value.trim(), adminPassword);
                await SiteAPI.dispatchPagesWorkflowAdmin(adminPassword);
                markdown = next;
                setStatus(panel, '已提交修改，GitHub Pages 构建完成后线上文章会更新。', 'ok');
            } catch (e) {
                setStatus(panel, '保存失败：' + e.message, 'error');
            } finally {
                save.disabled = false;
                save.textContent = '保存文章信息';
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('[data-article-admin]').forEach(initPanel);
    });
})();
