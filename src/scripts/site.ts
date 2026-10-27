const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-section-link]'));

if (sections.length) {
  let activeId = '';
  let frame = 0;
  let anchorOffset = 0;
  let observer: IntersectionObserver | undefined;
  let endObserver: IntersectionObserver | undefined;

  const update = () => {
    frame = 0;
    // Read only at section boundaries or the page end, not on every scroll frame.
    let index = sections.length - 1;
    const atEnd = window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;
    if (!atEnd) {
      while (index > 0 && sections[index].getBoundingClientRect().top > anchorOffset + 1) index--;
    }
    const id = sections[index].id;
    if (id === activeId) return;
    activeId = id;
    links.forEach(link => {
      if (link.dataset.sectionLink === id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const observeHeadings = () => {
    observer?.disconnect();
    endObserver?.disconnect();
    anchorOffset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    // Extend the observation area below the whole page. A heading's full visibility
    // then changes only at the top anchor line, including large jumps over sections.
    observer = new IntersectionObserver(schedule, {
      rootMargin: `-${anchorOffset + 1}px 0px ${document.documentElement.scrollHeight}px 0px`,
      threshold: 1,
    });
    sections.forEach(section => observer!.observe(section.querySelector('h2')!));
    // A short final section stops at the page end instead of adding empty scroll space.
    // Observe its last row at the bottom-padding line to keep the current link accurate.
    const bottom = parseFloat(getComputedStyle(document.querySelector('main')!).paddingBottom) || 0;
    endObserver = new IntersectionObserver(schedule, {
      rootMargin: `0px 0px -${Math.max(0, bottom - 1)}px 0px`,
      threshold: 1,
    });
    endObserver.observe(sections[sections.length - 1].lastElementChild!);
    schedule();
  };

  const layoutObserver = new ResizeObserver(observeHeadings);
  layoutObserver.observe(document.querySelector('.site-shell')!);
  window.addEventListener('resize', observeHeadings);
  window.addEventListener('hashchange', schedule);
  window.addEventListener('pageshow', observeHeadings);
  document.fonts.ready.then(observeHeadings);
  observeHeadings();
}
