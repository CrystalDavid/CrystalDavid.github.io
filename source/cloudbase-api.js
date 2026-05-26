(function() {
    'use strict';

    const config = window.DAVID_CLOUDBASE_CONFIG || {};
    const enabled = !!config.enabled && !!config.env && config.env.indexOf('请替换') === -1;
    const functionName = config.functionName || 'comment-api';
    let app;
    let authReady;
    let db;

    function available() {
        return enabled && typeof window.cloudbase !== 'undefined';
    }

    function normalizeKey(value) {
        return String(value || '/').trim().slice(0, 180) || '/';
    }

    function init() {
        if (!available()) throw new Error('CloudBase is not enabled');
        if (!app) {
            app = window.cloudbase.init({
                env: config.env,
                region: config.region || 'ap-shanghai'
            });
            db = app.database();
        }
        if (!authReady) {
            const auth = app.auth({ persistence: 'local' });
            authReady = auth.getLoginState().then(function(state) {
                if (state) return state;
                return auth.signInAnonymously();
            });
        }
        return authReady.then(function() {
            return { app: app, db: db };
        });
    }

    async function call(action, data) {
        const ctx = await init();
        const res = await ctx.app.callFunction({
            name: functionName,
            data: Object.assign({ action: action }, data || {})
        });
        const result = res && res.result ? res.result : res;
        if (!result || result.ok === false) {
            throw new Error((result && result.error) || 'CloudBase request failed');
        }
        return result;
    }

    async function listComments(pages) {
        const result = await call('listComments', {
            pages: (Array.isArray(pages) ? pages : [pages]).map(normalizeKey)
        });
        return result.comments || [];
    }

    async function createComment(payload) {
        const result = await call('createComment', {
            page: normalizeKey(payload.page),
            nickname: payload.nickname,
            content: payload.content
        });
        return result.comment;
    }

    async function deleteComment(payload, adminPassword) {
        return call('deleteComment', {
            id: payload.id,
            adminPassword: adminPassword || ''
        });
    }

    async function getReactions(target) {
        const result = await call('getReactions', { target: normalizeKey(target) });
        return result.reactions || {};
    }

    async function addReaction(target, reaction) {
        const result = await call('addReaction', {
            target: normalizeKey(target),
            reaction: reaction
        });
        return result.count || 1;
    }

    function watchComments(pages, onChange, onError) {
        if (!available()) return null;
        const normalized = (Array.isArray(pages) ? pages : [pages]).map(normalizeKey);
        const state = {};
        const stops = [];

        init().then(function(ctx) {
            normalized.forEach(function(page) {
                const watcher = ctx.db.collection('comments')
                    .where({ page: page, status: 'visible' })
                    .orderBy('createdAt', 'desc')
                    .limit(80)
                    .watch({
                        onChange: function(snapshot) {
                            state[page] = snapshot.docs || [];
                            const seen = {};
                            const merged = Object.keys(state).reduce(function(all, key) {
                                return all.concat(state[key] || []);
                            }, []).filter(function(item) {
                                const id = item._id || item.id;
                                if (!id || seen[id]) return false;
                                seen[id] = true;
                                return true;
                            }).sort(function(a, b) {
                                return (b.createdAt || 0) - (a.createdAt || 0);
                            });
                            onChange(merged.map(normalizeComment));
                        },
                        onError: onError || function() {}
                    });
                stops.push(watcher);
            });
        }).catch(onError || function() {});

        return function closeWatchers() {
            stops.forEach(function(watcher) {
                if (watcher && typeof watcher.close === 'function') watcher.close();
            });
        };
    }

    function watchReactions(target, onChange, onError) {
        if (!available()) return null;
        let watcher;
        init().then(function(ctx) {
            watcher = ctx.db.collection('reactions')
                .where({ target: normalizeKey(target) })
                .watch({
                    onChange: function(snapshot) {
                        const reactions = {};
                        (snapshot.docs || []).forEach(function(item) {
                            reactions[item.reaction] = item.count || 0;
                        });
                        onChange(reactions);
                    },
                    onError: onError || function() {}
                });
        }).catch(onError || function() {});
        return function closeWatcher() {
            if (watcher && typeof watcher.close === 'function') watcher.close();
        };
    }

    function normalizeComment(item) {
        return {
            id: item._id || item.id,
            page: item.page,
            nickname: item.nickname,
            content: item.content,
            created_at: item.createdAt ? new Date(item.createdAt).toISOString() : item.created_at
        };
    }

    window.DavidCloudBaseAPI = {
        enabled: available,
        listComments: listComments,
        createComment: createComment,
        deleteComment: deleteComment,
        getReactions: getReactions,
        addReaction: addReaction,
        watchComments: watchComments,
        watchReactions: watchReactions
    };
})();
