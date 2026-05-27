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

        if (!els.list.querySelector('.msg-item') && !isReplyFormOpen(wall)) {
            els.list.innerHTML = '<li class="article-comment-empty">加载中...</li>';
        }
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
            if (!els.list.querySelector('.msg-item')) {
                els.list.innerHTML = '<li class="article-comment-empty">留言服务暂时连接失败，请稍后重试。</li>';
            }
        }
    }

    function getCommentsSignature(comments, primaryPage) {
        return JSON.stringify({
            admin: !!adminPassword,
            page: primaryPage,
            items: comments.map(function(comment) {
                return {
                    id: comment.id || '',
                    page: comment.page || primaryPage,
                    parent: comment.parent_id || comment.parentId || '',
                    replyTo: comment.reply_to_nickname || comment.replyToNickname || '',
                    nickname: comment.nickname || '',
                    content: comment.content || '',
                    created: comment.created_at || '',
                    reactions: comment.reactions || {}
                };
            })
        });
    }

    function isReplyFormOpen(wall) {
        return Array.from(wall.querySelectorAll('.msg-reply-form[data-open="true"]')).some(function(form) {
            return form.style.display !== 'none';
        });
    }

    function shouldDeferRender(wall) {
        return isReplyFormOpen(wall);
    }

    function flushPendingComments(wall) {
        const pending = wall._pendingComments;
        if (!pending) return;
        wall._pendingComments = null;
        renderComments(wall, pending.comments, pending.primaryPage, { force: true });
    }

    function renderComments(wall, comments, primaryPage, options) {
        options = options || {};
        const els = getElements(wall);
        if (!els.list) return;
        const signature = getCommentsSignature(comments, primaryPage);
        if (!options.force && signature === wall.dataset.commentsSignature) return;
        if (!options.force && shouldDeferRender(wall)) {
            wall._pendingComments = { comments: comments, primaryPage: primaryPage };
            return;
        }

        const replyDraft = captureReplyDraft(wall);
        const threads = buildCommentThreads(comments);
        wall.dataset.commentsSignature = signature;
        if (!threads.length) {
            els.list.innerHTML = '<li class="article-comment-empty">暂无评论，来写第一条吧。</li>';
            return;
        }

        els.list.innerHTML = '';
        threads.forEach(function(thread) {
            const comment = thread.root;
            const item = document.createElement('li');
            item.className = 'msg-item';
            item.dataset.commentId = comment.id || '';
            const initial = (comment.nickname || '?').charAt(0).toUpperCase();
            const commentKey = (comment.page || primaryPage) + ':' + comment.id;

            item.innerHTML = [
                '<div class="msg-header">',
                '<div class="msg-avatar">' + escapeHtml(initial) + '</div>',
                '<span class="msg-nickname">' + escapeHtml(comment.nickname || '匿名') + '</span>',
                '<span class="msg-time">' + escapeHtml(formatTime(comment.created_at)) + '</span>',
                '</div>',
                '<div class="msg-content">' + escapeHtml(comment.content || '') + '</div>',
                '<div class="msg-actions">',
                '<div class="msg-reactions">',
                EMOJIS.map(function(emoji) {
                    const apiName = EMOJI_MAP[emoji];
                    const count = comment.reactions && comment.reactions[apiName] ? comment.reactions[apiName] : 0;
                    return '<button class="msg-reaction-btn" data-comment-key="' + escapeHtml(commentKey) + '" data-reaction="' + apiName + '">' + emoji + '<span class="count">' + (count > 0 ? count : '') + '</span></button>';
                }).join(''),
                '</div>',
                '<button class="msg-reply-btn" type="button" data-page="' + escapeHtml(comment.page || primaryPage) + '" data-parent-id="' + escapeHtml(comment.id || '') + '" data-reply-to="' + escapeHtml(comment.nickname || '匿名') + '">回复</button>',
                '</div>',
                '<div class="msg-reply-form" data-reply-form="' + escapeHtml(comment.id || '') + '" style="display:none;"></div>',
                renderReplies(thread.replies, comment, primaryPage),
                adminPassword ? '<button class="msg-delete-btn" type="button" data-page="' + escapeHtml(comment.page || primaryPage) + '" data-id="' + escapeHtml(comment.id || '') + '" data-created="' + escapeHtml(comment.created_at || '') + '" title="删除"><i class="fa-solid fa-trash"></i></button>' : ''
            ].join('');
            els.list.appendChild(item);
        });
        bindReactionButtons(wall);
        bindReplyButtons(wall);
        bindDeleteButtons(wall);
        if (replyDraft) restoreReplyDraft(wall, replyDraft);
        startReactionRealtime(wall);
        if (window.DavidButtonMotion) window.DavidButtonMotion.enhance(wall);
    }

    function buildCommentThreads(comments) {
        const byId = {};
        comments.forEach(function(comment) {
            if (comment.id) byId[comment.id] = comment;
        });
        const roots = [];
        const repliesByParent = {};
        comments.forEach(function(comment) {
            const parentId = comment.parent_id || comment.parentId || '';
            if (parentId && byId[parentId]) {
                if (!repliesByParent[parentId]) repliesByParent[parentId] = [];
                repliesByParent[parentId].push(comment);
            } else {
                roots.push(comment);
            }
        });
        roots.sort(function(a, b) {
            return new Date(b.created_at) - new Date(a.created_at);
        });
        return roots.map(function(root) {
            const replies = repliesByParent[root.id] || [];
            replies.sort(function(a, b) {
                return new Date(a.created_at) - new Date(b.created_at);
            });
            return { root: root, replies: replies };
        });
    }

    function renderReplies(replies, root, primaryPage) {
        if (!replies.length) return '';
        return [
            '<div class="msg-reply-thread">',
            replies.map(function(reply) {
                const page = reply.page || root.page || primaryPage;
                const replyTo = reply.reply_to_nickname || reply.replyToNickname || root.nickname || '匿名';
                return [
                    '<div class="msg-reply-item" data-reply-id="' + escapeHtml(reply.id || '') + '">',
                    '<div class="msg-reply-line">',
                    '<span class="reply-name">' + escapeHtml(reply.nickname || '匿名') + '</span>',
                    '<span class="reply-word"> 回复 </span>',
                    '<span class="reply-target">' + escapeHtml(replyTo) + '</span>',
                    '<span class="reply-time">' + escapeHtml(formatTime(reply.created_at)) + '</span>',
                    '<button class="msg-reply-btn msg-reply-inline-btn" type="button" data-page="' + escapeHtml(page) + '" data-parent-id="' + escapeHtml(root.id || '') + '" data-reply-to="' + escapeHtml(reply.nickname || '匿名') + '">回复</button>',
                    adminPassword ? '<button class="msg-delete-btn msg-reply-delete-btn" type="button" data-page="' + escapeHtml(page) + '" data-id="' + escapeHtml(reply.id || '') + '" data-created="' + escapeHtml(reply.created_at || '') + '" title="删除"><i class="fa-solid fa-trash"></i></button>' : '',
                    '</div>',
                    '<div class="msg-reply-content">' + escapeHtml(reply.content || '') + '</div>',
                    '</div>'
                ].join('');
            }).join(''),
            '</div>'
        ].join('');
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
            const item = btn.closest('.msg-reply-item') || btn.closest('.msg-item');
            if (!item) return;
            btn.addEventListener('click', async function() {
                if (!confirm('确定删除这条留言吗？')) return;
                btn.disabled = true;
                try {
                    const page = btn.dataset.page || getCommentPages(wall)[0] || window.location.pathname;
                    await cloudApi().deleteComment({ id: btn.dataset.id, page: page }, adminPassword);
                    runPowderDelete(item, function() { item.remove(); });
                } catch (e) {
                    btn.disabled = false;
                    alert('删除失败：' + e.message);
                }
            });
        });
    }

    function bindReplyButtons(wall) {
        const els = getElements(wall);
        if (!els.list) return;
        els.list.querySelectorAll('.msg-reply-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                showReplyForm(wall, {
                    page: btn.dataset.page || getCommentPages(wall)[0] || window.location.pathname,
                    parentId: btn.dataset.parentId || '',
                    replyToNickname: btn.dataset.replyTo || '匿名'
                });
            });
        });
    }

    function captureReplyDraft(wall) {
        const form = wall.querySelector('.msg-reply-form[data-open="true"]');
        if (!form || form.dataset.submitted === 'true') return null;
        const nickname = form.querySelector('.msg-reply-nickname');
        const content = form.querySelector('.msg-reply-content-input');
        return {
            page: form.dataset.page || getCommentPages(wall)[0] || window.location.pathname,
            parentId: form.dataset.parentId || '',
            replyToNickname: form.dataset.replyToNickname || '匿名',
            nickname: nickname ? nickname.value : '',
            content: content ? content.value : '',
            focus: document.activeElement === nickname ? 'nickname' : (document.activeElement === content ? 'content' : '')
        };
    }

    function restoreReplyDraft(wall, draft) {
        draft.forceOpen = true;
        showReplyForm(wall, draft, true);
    }

    function showReplyForm(wall, options) {
        const form = wall.querySelector('[data-reply-form="' + cssEscape(options.parentId) + '"]');
        if (!form) return;
        const isOpen = form.dataset.open === 'true' && form.style.display !== 'none';
        if (!options.forceOpen && isOpen && form.dataset.replyToNickname === (options.replyToNickname || '匿名')) {
            form.style.display = 'none';
            form.innerHTML = '';
            delete form.dataset.open;
            flushPendingComments(wall);
            return;
        }
        wall.querySelectorAll('.msg-reply-form').forEach(function(item) {
            if (item !== form) {
                item.style.display = 'none';
                item.innerHTML = '';
                delete item.dataset.open;
            }
        });
        const saved = localStorage.getItem(NICKNAME_KEY) || '';
        const draftNickname = options.nickname || saved;
        const draftContent = options.content || '';
        form.innerHTML = [
            '<div class="msg-reply-form-title">回复 ' + escapeHtml(options.replyToNickname) + '</div>',
            '<input class="msg-reply-nickname" type="text" maxlength="20" placeholder="你的昵称" value="' + escapeHtml(draftNickname) + '">',
            '<textarea class="msg-reply-content-input" maxlength="500" placeholder="写下你的回复...">' + escapeHtml(draftContent) + '</textarea>',
            '<div class="msg-reply-form-actions">',
            '<button class="msg-reply-submit" type="button">发布回复</button>',
            '<button class="msg-reply-cancel" type="button">取消</button>',
            '</div>'
        ].join('');
        form.style.display = 'block';
        form.dataset.open = 'true';
        form.dataset.page = options.page || '';
        form.dataset.parentId = options.parentId || '';
        form.dataset.replyToNickname = options.replyToNickname || '匿名';
        delete form.dataset.submitted;

        const nickname = form.querySelector('.msg-reply-nickname');
        const content = form.querySelector('.msg-reply-content-input');
        const submit = form.querySelector('.msg-reply-submit');
        [nickname, content].forEach(function(input) {
            input.addEventListener('compositionstart', function() {
                form.dataset.composing = 'true';
            });
            input.addEventListener('compositionend', function() {
                delete form.dataset.composing;
            });
        });
        form.querySelector('.msg-reply-cancel').addEventListener('click', function() {
            form.style.display = 'none';
            form.innerHTML = '';
            delete form.dataset.open;
            flushPendingComments(wall);
        });
        submit.addEventListener('click', async function() {
            const name = nickname.value.trim();
            const text = content.value.trim();
            if (!name) {
                nickname.focus();
                return;
            }
            if (!text) {
                content.focus();
                return;
            }
            localStorage.setItem(NICKNAME_KEY, name);
            submit.disabled = true;
            submit.textContent = '发布中...';
            try {
                form.dataset.submitted = 'true';
                await cloudApi().createComment({
                    page: options.page,
                    nickname: name,
                    content: text,
                    parentId: options.parentId,
                    replyToNickname: options.replyToNickname
                });
                form.style.display = 'none';
                form.innerHTML = '';
                delete form.dataset.open;
                await loadComments(wall);
            } catch (error) {
                delete form.dataset.submitted;
                alert('回复失败：留言服务暂时连接失败，请稍后重试。');
                submit.disabled = false;
                submit.textContent = '发布回复';
            }
        });
        if (options.focus === 'nickname') {
            nickname.focus();
        } else {
            content.focus();
            const end = content.value.length;
            content.setSelectionRange(end, end);
        }
    }

    function runPowderDelete(element, done) {
        if (window.DavidPowderBurst) {
            window.DavidPowderBurst(element, done);
            return;
        }
        element.classList.add('shattering');
        setTimeout(done, 900);
    }

    function bindWall(wall) {
        if (wall.dataset.commentWallReady === 'true') return;
        const els = getElements(wall);
        if (!els.nickname || !els.content || !els.submit || !els.list) return;
        wall.dataset.commentWallReady = 'true';
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
                    renderComments(wall, [comment].concat(readCurrentComments(els.list)), page, { force: true });
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
        bind: function(root) {
            const scope = root || document;
            scope.querySelectorAll('[data-comment-wall]').forEach(bindWall);
        },
        reload: function() {
            document.querySelectorAll('[data-comment-wall]').forEach(loadComments);
        }
    };
})();

