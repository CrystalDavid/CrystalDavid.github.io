hexo.extend.generator.register('article_data', function(locals) {
  const posts = locals.posts
    .sort('-date')
    .toArray()
    .filter(function(post) {
      if (!post.published) return false;
      if (!post.categories || !post.categories.length) return true;
      return post.categories.toArray().some(function(category) {
        return String(category.name).toLowerCase() === 'article';
      });
    })
    .map(function(post) {
      const tags = post.tags ? post.tags.toArray().map(function(tag) { return tag.name; }) : [];
      const summary = post.description || stripHtml(post.excerpt || '').trim();
      const path = this.config.root + post.path;
      const sourcePath = post.source
        ? 'source/' + String(post.source).replace(/^source[\\/]/, '').replace(/\\/g, '/')
        : '';
      return {
        title: post.title,
        date: formatPostDate(post.date),
        content: summary,
        tags: tags.join(','),
        link: path.replace(/\/{2,}/g, '/'),
        postPath: sourcePath,
        sourceFile: post.source_file || '',
        source: 'hexo'
      };
    }, this);

  return {
    path: 'article-data.json',
    data: JSON.stringify(posts, null, 2)
  };
});

function stripHtml(value) {
  return String(value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
}

function formatPostDate(date) {
  if (date && typeof date.format === 'function') {
    return date.format('YYYY/MM/DD HH:mm:ss');
  }
  const d = new Date(date);
  const pad = function(n) { return String(n).padStart(2, '0'); };
  return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
}
