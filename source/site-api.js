// Site API - GitHub Issues backend
(function() {
    'use strict';
    const REPO_OWNER = 'CrystalDavid';
    const REPO_NAME = 'CrystalDavid.github.io';
    const PWD_HASH = 'da3fb9830dbd1b3ee2e799a06b3d8b486e5285fc508264f87777905827510551';

    // Token protection: split + reverse + base64
    const _k = [
        'ZjhaZ0FlRW5fcGhn',
        'am5YTEVMTURQMDE=',
        'UndsaU85eGFrV0o=',
        'elhqZ3Ex'
    ];

    function _d(s) { return atob(s); }
    function _r(s) { return s.split('').reverse().join(''); }

    function _getToken() {
        // Decode and reverse each part, then join
        return _r(_d(_k[0])) + _r(_d(_k[1])) + _r(_d(_k[2])) + _r(_d(_k[3]));
    }

    function _token(explicitToken) {
        return (explicitToken || '').trim() || _getToken();
    }

    function _headers(explicitToken) {
        return {
            'Authorization': 'Bearer ' + _token(explicitToken),
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
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
        const url = 'https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + '/issues?labels=' + label + '&state=open&per_page=50';
        const res = await fetch(url);
        if (!res.ok) return [];
        return res.json();
    }

    async function createIssue(title, body, labels) {
        const token = _getToken();
        const url = 'https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + '/issues';
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'token ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: title, body: body, labels: labels })
        });
        if (!res.ok) throw new Error('Failed to create issue: ' + res.status);
        return res.json();
    }

    async function getReactions(issueNumber) {
        const url = 'https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + '/issues/' + issueNumber + '/reactions';
        const res = await fetch(url, {
            headers: { 'Accept': 'application/vnd.github+json' }
        });
        if (!res.ok) return [];
        return res.json();
    }

    async function addReaction(issueNumber, reaction) {
        const token = _getToken();
        const url = 'https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + '/issues/' + issueNumber + '/reactions';
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'token ' + token,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github+json'
            },
            body: JSON.stringify({ content: reaction })
        });
        return res.json();
    }

    async function closeIssue(issueNumber) {
        const token = _getToken();
        const url = 'https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + '/issues/' + issueNumber;
        const res = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': 'token ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ state: 'closed' })
        });
        if (!res.ok) throw new Error('Failed to close issue: ' + res.status);
        return res.json();
    }

    async function uploadFile(file) {
        const token = _getToken();
        const reader = new FileReader();
        const base64 = await new Promise(function(resolve) {
            reader.onload = function() { resolve(reader.result.split(',')[1]); };
            reader.readAsDataURL(file);
        });
        const filename = 'uploads/' + Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const url = 'https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + '/contents/' + filename;
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': 'token ' + token,
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

    async function getContentSha(path, token) {
        const url = 'https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + '/contents/' + encodeURI(path) + '?ref=main';
        const res = await fetch(url, { headers: _headers(token) });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('读取仓库文件失败: ' + res.status);
        const data = await res.json();
        return data.sha || null;
    }

    async function putContent(path, base64Content, message, token) {
        const sha = await getContentSha(path, token);
        const body = {
            message: message,
            content: base64Content,
            branch: 'main'
        };
        if (sha) body.sha = sha;
        const url = 'https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + '/contents/' + encodeURI(path);
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
        const url = 'https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + '/actions/workflows/pages.yml/dispatches';
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

    // Expose API
    window.SiteAPI = {
        verifyPassword: verifyPassword,
        fetchIssues: fetchIssues,
        createIssue: createIssue,
        closeIssue: closeIssue,
        getReactions: getReactions,
        addReaction: addReaction,
        uploadFile: uploadFile,
        uploadRepositoryFile: uploadRepositoryFile,
        publishMarkdownPost: publishMarkdownPost,
        dispatchPagesWorkflow: dispatchPagesWorkflow,
        REACTIONS_MAP: {
            '👍': '+1',
            '❤️': 'heart',
            '😂': 'laugh',
            '🎉': 'hooray',
            '🚀': 'rocket'
        }
    };
})();
