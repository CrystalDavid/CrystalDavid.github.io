// Site API - GitHub Issues backend
(function() {
    'use strict';
    const REPO_OWNER = 'CrystalDavid';
    const REPO_NAME = 'CrystalDavid.github.io';
    const API_PROXY = 'https://david-comment-api.crystaldavid.deno.net';
    const PWD_HASH = 'da3fb9830dbd1b3ee2e799a06b3d8b486e5285fc508264f87777905827510551';

    function _token(explicitToken) {
        const token = (explicitToken || '').trim();
        if (!token) throw new Error('需要 GitHub token');
        return token;
    }

    function _headers(explicitToken) {
        return {
            'Authorization': 'Bearer ' + _token(explicitToken),
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
        };
    }

    function _adminHeaders(adminPassword) {
        return {
            'X-Admin-Password': (adminPassword || '').trim(),
            'Accept': 'application/vnd.github+json'
        };
    }

    async function hashStr(str) {
        const buf = new TextEncoder().encode(str);
        const hash = await crypto.subtle.digest('SHA-256', buf);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async function verifyPassword(input) {
        const h = await hashStr(input);
        return h === PWD_HASH;
    }

    async function fetchIssues(label) {
        const url = API_PROXY + '/github/issues?label=' + encodeURIComponent(label) + '&state=open&per_page=50&_=' + Date.now();
        try {
            const res = await fetch(url, { cache: 'no-store', mode: 'cors', credentials: 'omit' });
            if (!res.ok) return [];
            return res.json();
        } catch (e) {
            console.warn('GitHub issue 内容源暂时不可用，继续加载静态内容:', e);
            return [];
        }
    }

    async function createIssue(title, body, labels, explicitToken) {
        const token = _token(explicitToken);
        const url = API_PROXY + '/github/issues';
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: title, body: body, labels: labels })
        });
        if (!res.ok) throw new Error('Failed to create issue: ' + res.status);
        return res.json();
    }

    async function createIssueAdmin(title, body, labels, adminPassword) {
        const url = API_PROXY + '/github/issues';
        const res = await fetch(url, {
            method: 'POST',
            headers: Object.assign(_adminHeaders(adminPassword), { 'Content-Type': 'application/json' }),
            body: JSON.stringify({ title: title, body: body, labels: labels })
        });
        if (!res.ok) throw new Error('Failed to create issue: ' + res.status);
        return res.json();
    }

    async function getReactions(issueNumber) {
        const url = API_PROXY + '/github/issues/' + issueNumber + '/reactions';
        const res = await fetch(url, {
            headers: { 'Accept': 'application/vnd.github+json' }
        });
        if (!res.ok) return [];
        return res.json();
    }

    async function addReaction(issueNumber, reaction, explicitToken) {
        const token = _token(explicitToken);
        const url = API_PROXY + '/github/issues/' + issueNumber + '/reactions';
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github+json'
            },
            body: JSON.stringify({ content: reaction })
        });
        return res.json();
    }

    async function closeIssue(issueNumber, explicitToken) {
        const token = _token(explicitToken);
        const url = API_PROXY + '/github/issues/' + issueNumber;
        const res = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ state: 'closed' })
        });
        if (!res.ok) throw new Error('Failed to close issue: ' + res.status);
        return res.json();
    }

    async function closeIssueAdmin(issueNumber, adminPassword) {
        const url = API_PROXY + '/github/issues/' + issueNumber;
        const res = await fetch(url, {
            method: 'PATCH',
            headers: Object.assign(_adminHeaders(adminPassword), { 'Content-Type': 'application/json' }),
            body: JSON.stringify({ state: 'closed' })
        });
        if (!res.ok) throw new Error('Failed to close issue: ' + res.status);
        return res.json();
    }

    async function uploadFile(file, explicitToken) {
        const token = _token(explicitToken);
        const reader = new FileReader();
        const base64 = await new Promise(function(resolve) {
            reader.onload = function() { resolve(reader.result.split(',')[1]); };
            reader.readAsDataURL(file);
        });
        const filename = 'uploads/' + Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const url = API_PROXY + '/github/content?path=' + encodeURIComponent(filename);
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Upload media: ' + file.name,
                content: base64
            })
        });
        if (!res.ok) throw new Error('Upload failed: ' + res.status);
        const data = await res.json();
        return data.content.download_url;
    }

    function textToBase64(text) {
        const bytes = new TextEncoder().encode(text);
        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
        }
        return btoa(binary);
    }

    async function fileToBase64(file) {
        return new Promise(function(resolve, reject) {
            const reader = new FileReader();
            reader.onload = function() {
                const result = String(reader.result || '');
                resolve(result.split(',')[1] || '');
            };
            reader.onerror = function() { reject(reader.error); };
            reader.readAsDataURL(file);
        });
    }

    function normalizeRepoPath(path) {
        return String(path || '')
            .replace(/^https:\/\/raw\.githubusercontent\.com\/CrystalDavid\/CrystalDavid\.github\.io\/main\//i, '')
            .replace(/^https:\/\/github\.com\/CrystalDavid\/CrystalDavid\.github\.io\/blob\/main\//i, '')
            .replace(/^\/+/, '')
            .replace(/\\/g, '/');
    }

    function contentUrl(path) {
        return API_PROXY + '/github/content?path=' + encodeURIComponent(normalizeRepoPath(path));
    }

    async function getContentSha(path, token) {
        const repoPath = normalizeRepoPath(path);
        if (!repoPath) return null;
        const url = contentUrl(repoPath) + '&ref=main&_=' + Date.now();
        const res = await fetch(url, { headers: _headers(token) });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('读取仓库文件失败: ' + res.status);
        const data = await res.json();
        return data.sha || null;
    }

    async function getRepositoryFile(path) {
        const repoPath = normalizeRepoPath(path);
        if (!repoPath) throw new Error('缺少仓库文件路径');
        const res = await fetch(contentUrl(repoPath) + '&ref=main&_=' + Date.now(), {
            cache: 'no-store',
            mode: 'cors',
            credentials: 'omit'
        });
        if (!res.ok) throw new Error('读取仓库文件失败: ' + res.status);
        return res.json();
    }

    async function putContent(path, base64Content, message, token) {
        const repoPath = normalizeRepoPath(path);
        const sha = await getContentSha(repoPath, token);
        const body = {
            message: message,
            content: base64Content,
            branch: 'main'
        };
        if (sha) body.sha = sha;
        const url = contentUrl(repoPath);
        const res = await fetch(url, {
            method: 'PUT',
            headers: Object.assign(_headers(token), { 'Content-Type': 'application/json' }),
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const detail = await res.text().catch(function() { return ''; });
            throw new Error('提交仓库文件失败: ' + res.status + ' ' + detail);
        }
        return res.json();
    }

    async function deleteRepositoryFile(path, message, token) {
        const repoPath = normalizeRepoPath(path);
        const sha = await getContentSha(repoPath, token);
        if (!sha) return { deleted: false, path: repoPath };
        const url = contentUrl(repoPath);
        const res = await fetch(url, {
            method: 'DELETE',
            headers: Object.assign(_headers(token), { 'Content-Type': 'application/json' }),
            body: JSON.stringify({
                message: message || ('Delete file: ' + repoPath),
                sha: sha,
                branch: 'main'
            })
        });
        if (res.status === 404) return { deleted: false, path: repoPath };
        if (!res.ok) {
            const detail = await res.text().catch(function() { return ''; });
            throw new Error('删除仓库文件失败: ' + res.status + ' ' + detail);
        }
        return res.json();
    }

    async function saveRepositoryTextAdmin(path, text, message, adminPassword) {
        return putContentAdmin(path, textToBase64(text), message, adminPassword);
    }

    async function putContentAdmin(path, base64Content, message, adminPassword) {
        const repoPath = normalizeRepoPath(path);
        let current = null;
        try {
            current = await getRepositoryFile(repoPath);
        } catch (e) {}
        const body = {
            message: message || ('Update file: ' + repoPath),
            content: base64Content,
            branch: 'main'
        };
        if (current && current.sha) body.sha = current.sha;
        const res = await fetch(contentUrl(repoPath), {
            method: 'PUT',
            headers: Object.assign(_adminHeaders(adminPassword), { 'Content-Type': 'application/json' }),
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const detail = await res.text().catch(function() { return ''; });
            throw new Error('提交仓库文件失败: ' + res.status + ' ' + detail);
        }
        return res.json();
    }

    async function uploadRepositoryFileAdmin(file, path, message, adminPassword) {
        const base64 = await fileToBase64(file);
        const data = await putContentAdmin(path, base64, message || ('Upload file: ' + file.name), adminPassword);
        return {
            path: path,
            url: '/' + path.replace(/^source\//, ''),
            html_url: data.content && data.content.html_url
        };
    }

    async function uploadFileAdmin(file, adminPassword) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._\-\u4e00-\u9fa5]/g, '_');
        const path = 'source/uploads/' + Date.now() + '-' + safeName;
        const uploaded = await uploadRepositoryFileAdmin(file, path, 'Upload media: ' + file.name, adminPassword);
        return uploaded.url;
    }

    async function publishMarkdownPostAdmin(path, markdown, message, adminPassword) {
        return putContentAdmin(path, textToBase64(markdown), message || ('Publish article: ' + path), adminPassword);
    }

    async function deleteRepositoryFileAdmin(path, message, adminPassword) {
        const repoPath = normalizeRepoPath(path);
        for (let attempt = 0; attempt < 3; attempt++) {
            let current;
            try {
                current = await getRepositoryFile(repoPath);
            } catch (e) {
                return { deleted: false, path: repoPath };
            }
            const res = await fetch(contentUrl(repoPath) + '&_=' + Date.now(), {
                method: 'DELETE',
                headers: Object.assign(_adminHeaders(adminPassword), { 'Content-Type': 'application/json' }),
                body: JSON.stringify({
                    message: message || ('Delete file: ' + repoPath),
                    sha: current.sha,
                    branch: 'main'
                })
            });
            if (res.status === 404) return { deleted: false, path: repoPath };
            if (res.ok) return res.json();
            const detail = await res.text().catch(function() { return ''; });
            if (res.status !== 409 || attempt === 2) {
                throw new Error('删除仓库文件失败: ' + res.status + ' ' + detail);
            }
            await new Promise(function(resolve) { setTimeout(resolve, 450 + attempt * 450); });
        }
    }

    async function uploadRepositoryFile(file, path, message, token) {
        const base64 = await fileToBase64(file);
        const data = await putContent(path, base64, message || ('Upload file: ' + file.name), token);
        return {
            path: path,
            url: '/' + path.replace(/^source\//, ''),
            html_url: data.content && data.content.html_url
        };
    }

    async function publishMarkdownPost(path, markdown, message, token) {
        return putContent(path, textToBase64(markdown), message || ('Publish article: ' + path), token);
    }

    async function dispatchPagesWorkflow(token) {
        const url = API_PROXY + '/github/dispatch-pages';
        const res = await fetch(url, {
            method: 'POST',
            headers: Object.assign(_headers(token), { 'Content-Type': 'application/json' }),
            body: JSON.stringify({ ref: 'main' })
        });
        if (res.status === 204) return true;
        if (res.status === 404 || res.status === 403) return false;
        if (!res.ok) throw new Error('触发 GitHub Actions 失败: ' + res.status);
        return true;
    }

    async function dispatchPagesWorkflowAdmin(adminPassword) {
        const url = API_PROXY + '/github/dispatch-pages';
        const res = await fetch(url, {
            method: 'POST',
            headers: Object.assign(_adminHeaders(adminPassword), { 'Content-Type': 'application/json' }),
            body: JSON.stringify({ ref: 'main' })
        });
        if (res.status === 204) return true;
        if (res.status === 404 || res.status === 403) return false;
        if (!res.ok) throw new Error('触发 GitHub Actions 失败: ' + res.status);
        return true;
    }

    // CloudBase reactions
    async function getReactionsFromCloudBase(page) {
        if (!window.DavidCloudBaseAPI || !window.DavidCloudBaseAPI.enabled()) {
            throw new Error('CloudBase 未启用，请检查 cloudbase-config.js 和 SDK 引入。');
        }
        return window.DavidCloudBaseAPI.getReactions(page);
    }

    async function addReactionToCloudBase(page, reaction) {
        if (!window.DavidCloudBaseAPI || !window.DavidCloudBaseAPI.enabled()) {
            throw new Error('CloudBase 未启用，请检查 cloudbase-config.js 和 SDK 引入。');
        }
        return window.DavidCloudBaseAPI.addReaction(page, reaction);
    }

    // Expose API
    window.SiteAPI = {
        verifyPassword: verifyPassword,
        fetchIssues: fetchIssues,
        createIssue: createIssue,
        createIssueAdmin: createIssueAdmin,
        closeIssue: closeIssue,
        closeIssueAdmin: closeIssueAdmin,
        getReactions: getReactions,
        addReaction: addReaction,
        getReactionsFromCloudBase: getReactionsFromCloudBase,
        addReactionToCloudBase: addReactionToCloudBase,
        uploadFile: uploadFile,
        uploadFileAdmin: uploadFileAdmin,
        getRepositoryFile: getRepositoryFile,
        uploadRepositoryFile: uploadRepositoryFile,
        uploadRepositoryFileAdmin: uploadRepositoryFileAdmin,
        publishMarkdownPost: publishMarkdownPost,
        publishMarkdownPostAdmin: publishMarkdownPostAdmin,
        deleteRepositoryFile: deleteRepositoryFile,
        saveRepositoryTextAdmin: saveRepositoryTextAdmin,
        deleteRepositoryFileAdmin: deleteRepositoryFileAdmin,
        dispatchPagesWorkflow: dispatchPagesWorkflow,
        dispatchPagesWorkflowAdmin: dispatchPagesWorkflowAdmin,
        REACTIONS_MAP: {
            '👍': '+1',
            '❤️': 'heart',
            '😂': 'laugh',
            '🎉': 'hooray',
            '🚀': 'rocket'
        }
    };
})();
