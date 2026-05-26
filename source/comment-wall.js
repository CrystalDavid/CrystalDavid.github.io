(function() {
    'use strict';

    const NICKNAME_KEY = 'david_comment_nickname';
    const PWD_HASH = 'da3fb9830dbd1b3ee2e799a06b3d8b486e5285fc508264f87777905827510551';
    const EMOJIS = ['👍', '❤️', '😂', '🎉', '🚀'];
    const EMOJI_MAP = { '👍': '+1', '❤️': 'heart', '😂': 'laugh', '🎉': 'hooray', '🚀': 'rocket' };
    let adminPassword = '';
    const reactionWatchers = {};

    function cloudApi() {
        if (window.DavidCloudBaseAPI && window.DavidCloudBaseAPI.enabled()) return window.DavidCloudBaseAPI;
        throw new Error('CloudBase 未启用，请检查 cloudbase-config.js 和 SDK 引入。');
    }

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

    function unique(values) {
        return values.filter(function(value, index, arr) {
            return value && arr.indexOf(value) === index;
        });
    }

    function getCommentPages(wall) {
        const aliases = (wall.dataset.commentAliases || '')
            .split(',')
            .map(function(item) { return item.trim(); })
            .filter(Boolean);
        return unique([wall.dataset.commentPage || window.location.pathname].concat(aliases, [window.location.pathname]));
    }

    async function setAdminPassword(password) {
        adminPassword = password || '';
        if (adminPassword) {
            document.body.classList.add('comment-admin-mode');
        } else {
            document.body.classList.remove('comment-admin-mode');
        }
        const walls = Array.from(document.querySelectorAll('[data-comment-wall]'));
        await Promise.all(walls.map(loadComments));
    }

    async function loadComments(wall) {
        const pages = getCommentPages(wall);
        const primaryPage = pages[0] || window.location.pathname;
        const els = getElements(wall);
        if (!els.list) return;

        els.list.innerHTML = '<li class="article-comment-empty">加载中...</li>';
        try {
            const api = cloudApi();
            const groups = [await api.listComments(pages)];

            const seen = {};
            const comments = groups.flat().filter(function(comment) {
                const key = (comment.page || primaryPage) + '|' + comment.created_at + '|' + comment.id;
                if (seen[key]) return false;
                seen[key] = true;
                return true;
            }).sort(function(a, b) {
                return new Date(b.created_at) - new Date(a.created_at);
            });

            // Load reactions for each comment
            const reactionsPromises = comments.map(async function(comment) {
                const commentKey = (comment.page || primaryPage) + ':' + comment.id;
                try {
                    return await api.getReactions(commentKey);
                } catch (e) {
                    return {};
                }
            });
            const allReactions = await Promise.all(reactionsPromises);
            comments.forEach(function(comment, index) {
                comment.reactions = allReactions[index];
            });

            renderComments(wall, comments, primaryPage);
        } catch (error) {
            els.list.innerHTML = '<li class="article-comment-empty">留言服务暂时连接失败，请稍后重试。</li>';
        }
    }

    function renderComments(wall, comments, primaryPage) {
        const els = getElements(wall);
        if (!els.list) return;
        if (!comments.length) {
            els.list.innerHTML = '<li class="article-comment-empty">暂无评论，来写第一条吧。</li>';
            return;
        }

        els.list.innerHTML = '';
        comments.forEach(function(comment) {
            const item = document.createElement('li');
            item.className = 'msg-item';
            const initial = (comment.nickname || '?').charAt(0).toUpperCase();
            const commentKey = (comment.page || primaryPage) + ':' + comment.id;

            item.innerHTML = [
                '<div class="msg-header">',
                '<div class="msg-avatar">' + escapeHtml(initial) + '</div>',
                '<span class="msg-nickname">' + escapeHtml(comment.nickname || '匿名') + '</span>',
                '<span class="msg-time">' + escapeHtml(formatTime(comment.created_at)) + '</span>',
                '</div>',
                '<div class="msg-content">' + escapeHtml(comment.content || '') + '</div>',
                '<div class="msg-reactions">',
                EMOJIS.map(function(emoji) {
                    const apiName = EMOJI_MAP[emoji];
                    const count = comment.reactions && comment.reactions[apiName] ? comment.reactions[apiName] : 0;
                    return '<button class="msg-reaction-btn" data-comment-key="' + escapeHtml(commentKey) + '" data-reaction="' + apiName + '">' + emoji + '<span class="count">' + (count > 0 ? count : '') + '</span></button>';
                }).join(''),
                '</div>',
                adminPassword ? '<button class="msg-delete-btn" type="button" data-page="' + escapeHtml(comment.page || primaryPage) + '" data-id="' + escapeHtml(comment.id || '') + '" data-created="' + escapeHtml(comment.created_at || '') + '" title="删除"><i class="fa-solid fa-trash"></i></button>' : ''
            ].join('');
            els.list.appendChild(item);
        });
        bindReactionButtons(wall);
        bindDeleteButtons(wall);
        startReactionRealtime(wall);
    }

    function cssEscape(value) {
        if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
        return String(value || '').replace(/["\\]/g, '\\$&');
    }

    async function refreshCommentReactions(wall, commentKey) {
        const els = getElements(wall);
        if (!els.list) return;
        try {
            const reactions = await cloudApi().getReactions(commentKey);
            els.list.querySelectorAll('[data-comment-key="' + cssEscape(commentKey) + '"]').forEach(function(btn) {
                const count = reactions[btn.dataset.reaction] || 0;
                const countEl = btn.querySelector('.count');
                if (countEl) countEl.textContent = count > 0 ? count : '';
                btn.classList.toggle('active', count > 0);
            });
        } catch (e) {
            console.warn('刷新表情计数失败:', e);
        }
    }

    function bindReactionButtons(wall) {
        const els = getElements(wall);
        if (!els.list) return;
        els.list.querySelectorAll('.msg-reaction-btn').forEach(function(btn) {
            btn.addEventListener('click', async function() {
                const commentKey = this.dataset.commentKey;
                const reaction = this.dataset.reaction;
                const countEl = this.querySelector('.count');

                // 乐观更新：立即显示+1
                const currentCount = parseInt(countEl.textContent) || 0;
                const optimisticCount = currentCount + 1;
                countEl.textContent = optimisticCount;
                btn.disabled = true;

                try {
                    const count = await cloudApi().addReaction(commentKey, reaction);
                    countEl.textContent = count > 0 ? count : '';
                    btn.classList.add('active');
                    await refreshCommentReactions(wall, commentKey);
                } catch (e) {
                    // 失败时回滚
                    countEl.textContent = currentCount > 0 ? currentCount : '';
                    console.error('添加表情失败:', e);
                } finally {
                    btn.disabled = false;
                }
            });
        });
    }

    function bindDeleteButtons(wall) {
        const els = getElements(wall);
        if (!els.list || !adminPassword) return;
        els.list.querySelectorAll('.msg-delete-btn').forEach(function(btn) {
            const item = btn.closest('.msg-item');
            if (!item) return;
            btn.addEventListener('click', async function() {
                if (!confirm('确定删除这条留言吗？')) return;
                btn.disabled = true;
                try {
                    const page = btn.dataset.page || getCommentPages(wall)[0] || window.location.pathname;
                    await cloudApi().deleteComment({ id: btn.dataset.id, page: page }, adminPassword);
                    item.classList.add('shattering');
                    setTimeout(function() { item.remove(); }, 900);
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
            const page = getCommentPages(wall)[0] || window.location.pathname;
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
                const comment = await cloudApi().createComment({ page, nickname, content });
                els.content.value = '';
                if (comment) {
                    renderComments(wall, [comment].concat(readCurrentComments(els.list)), page);
                }
                await loadComments(wall);
            } catch (error) {
                alert('发布失败：留言服务暂时连接失败，请稍后重试。');
            } finally {
                els.submit.disabled = false;
                els.submit.textContent = oldText;
            }
        });

        loadComments(wall);
        startCommentRealtime(wall);
        setInterval(function() { loadComments(wall); }, 300000);
    }

    function startCommentRealtime(wall) {
        const api = cloudApi();
        if (wall.dataset.cloudbaseWatchReady === 'true') return;
        wall.dataset.cloudbaseWatchReady = 'true';
        const pages = getCommentPages(wall);
        const primaryPage = pages[0] || window.location.pathname;
        api.watchComments(pages, async function(comments) {
            const allReactions = await Promise.all(comments.map(async function(comment) {
                try {
                    return await api.getReactions((comment.page || primaryPage) + ':' + comment.id);
                } catch (e) {
                    return {};
                }
            }));
            comments.forEach(function(comment, index) {
                comment.reactions = allReactions[index];
            });
            renderComments(wall, comments, primaryPage);
        }, function(error) {
            console.warn('CloudBase 实时监听失败，保留轮询兜底:', error);
        });
    }

    function startReactionRealtime(wall) {
        const api = cloudApi();
        const els = getElements(wall);
        if (!els.list) return;
        els.list.querySelectorAll('.msg-reaction-btn').forEach(function(btn) {
            const commentKey = btn.dataset.commentKey;
            if (!commentKey || reactionWatchers[commentKey]) return;
            reactionWatchers[commentKey] = api.watchReactions(commentKey, function(reactions) {
                els.list.querySelectorAll('[data-comment-key="' + cssEscape(commentKey) + '"]').forEach(function(reactionBtn) {
                    const count = reactions[reactionBtn.dataset.reaction] || 0;
                    const countEl = reactionBtn.querySelector('.count');
                    if (countEl) countEl.textContent = count > 0 ? count : '';
                    reactionBtn.classList.toggle('active', count > 0);
                });
            }, function(error) {
                console.warn('评论表情实时监听失败:', error);
            });
        });
    }

    function readCurrentComments(list) {
        return Array.from(list.querySelectorAll('.msg-item')).map(function(item) {
            return {
                page: item.querySelector('.msg-delete-btn')?.dataset.page || '',
                id: item.querySelector('.msg-delete-btn')?.dataset.id || '',
                created_at: item.querySelector('.msg-delete-btn')?.dataset.created || '',
                nickname: item.querySelector('.msg-nickname')?.textContent || '',
                content: item.querySelector('.msg-content')?.textContent || ''
            };
        }).filter(function(comment) {
            return comment.created_at && comment.id;
        });
    }

    function setupCommentAdmin(wall) {
        if (wall.dataset.commentAdminReady === 'true') return;
        wall.dataset.commentAdminReady = 'true';
        if (document.getElementById('about-admin-panel')) return;
        if (document.querySelector('[data-article-admin]')) return;

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
                await setAdminPassword(value);
                tools.style.display = 'none';
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
        setAdminPassword(e.detail && e.detail.password ? e.detail.password : '');
    });

    window.DavidCommentWall = {
        setAdminPassword: setAdminPassword,
        reload: function() {
            document.querySelectorAll('[data-comment-wall]').forEach(loadComments);
        }
    };
})();

