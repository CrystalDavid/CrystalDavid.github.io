let pageEvents: AbortController | undefined;
let frame = 0;
let restoredHref: string | undefined;

function initializePage() {
  pageEvents?.abort();
  cancelAnimationFrame(frame);
  frame = 0;
  pageEvents = new AbortController();
  const { signal } = pageEvents;
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-section-link]'));
  if (!sections.length) return;

  let activeId = '';
  let selectedId: string | undefined;
  let positionsDirty = true;
  let sectionTops: number[] = [];
  let anchorOffset = 0;
  const setActive = (id: string) => {
    if (id === activeId) return;
    activeId = id;
    links.forEach(link => {
      if (link.dataset.sectionLink === id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const update = () => {
    frame = 0;
    if (positionsDirty) {
      anchorOffset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      sectionTops = sections.map(section => section.getBoundingClientRect().top + scrollY);
      positionsDirty = false;
    }
    if (selectedId) return setActive(selectedId);
    const atBottom = scrollY > 0 && scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
    let index = sections.length - 1;
    if (!atBottom) while (index > 0 && sectionTops[index] > scrollY + anchorOffset + 1) index--;
    setActive(sections[index].id);
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const measure = () => { positionsDirty = true; schedule(); };
  const selectHash = () => {
    const id = location.hash.slice(1);
    selectedId = restoredHref === location.href ? undefined : sections.find(section => section.id === id)?.id;
    schedule();
  };
  // Keep the clicked destination selected during native smooth scrolling.
  const resumeTracking = () => { selectedId = undefined; schedule(); };
  links.forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    restoredHref = undefined;
    selectedId = link.dataset.sectionLink;
    if (selectedId) setActive(selectedId);
  }, { signal }));
  window.addEventListener('scroll', schedule, { passive: true, signal });
  window.addEventListener('resize', () => { selectedId = undefined; measure(); }, { signal });
  window.addEventListener('hashchange', selectHash, { signal });
  window.addEventListener('popstate', event => { if (event.state) resumeTracking(); }, { signal });
  window.addEventListener('pageshow', event => {
    if (event.persisted) restoredHref = location.href;
    selectHash();
  }, { signal });
  for (const event of ['wheel', 'touchstart', 'pointerdown']) window.addEventListener(event, resumeTracking, { passive: true, signal });
  window.addEventListener('keydown', event => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) resumeTracking();
  }, { signal });
  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(document.querySelector('.site-shell')!);
  signal.addEventListener('abort', () => resizeObserver.disconnect(), { once: true });
  document.fonts.ready.then(() => { if (!signal.aborted) measure(); });
  selectHash();
}

// History may restore a manually scrolled position different from the URL hash.
window.addEventListener('popstate', event => { restoredHref = event.state ? location.href : undefined; });
document.addEventListener('astro:before-swap', () => {
  pageEvents?.abort();
  cancelAnimationFrame(frame);
  frame = 0;
});
document.addEventListener('astro:page-load', initializePage);
