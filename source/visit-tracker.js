(function() {
    'use strict';

    function getPageKind(path) {
        if (path === '/' || path === '/index.html') return 'home';
        if (path.indexOf('/about') === 0) return 'about';
        if (path.indexOf('/article') === 0) return path.split('/').filter(Boolean).length > 1 ? 'article-detail' : 'article';
        if (path.indexOf('/agent') === 0) return 'agent';
        if (path.indexOf('/musings') === 0) return 'musings';
        return 'page';
    }

    function sendVisit(payload) {
        if (!window.DavidCloudBaseAPI || !window.DavidCloudBaseAPI.enabled()) return;
        window.DavidCloudBaseAPI.recordVisit(payload);
    }

    function recordVisit() {
        const path = window.location.pathname || '/';
        sendVisit({
            actionType: 'pageview',
            path: path,
            pageKind: getPageKind(path),
            title: document.title || '',
            referrer: document.referrer || '',
            language: navigator.language || '',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
            screen: window.screen ? [window.screen.width, window.screen.height].join('x') : '',
            userAgent: navigator.userAgent || ''
        });
    }

    function bindActionTracking() {
        document.addEventListener('click', function(event) {
            const target = event.target && event.target.closest ? event.target.closest('a, button') : null;
            if (!target) return;
            const label = (target.textContent || target.getAttribute('title') || '').replace(/\s+/g, ' ').trim().slice(0, 80);
            const href = target.getAttribute('href') || target.dataset.pageKey || target.dataset.commentKey || '';
            sendVisit({
                actionType: 'click',
                path: window.location.pathname || '/',
                pageKind: getPageKind(window.location.pathname || '/'),
                title: document.title || '',
                target: href,
                targetText: label,
                language: navigator.language || '',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
                userAgent: navigator.userAgent || ''
            });
        }, true);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            recordVisit();
            bindActionTracking();
        });
    } else {
        recordVisit();
        bindActionTracking();
    }
})();
