let observer: IntersectionObserver | undefined;
let pageEvents: AbortController | undefined;

function announce(message: string) {
  const region = document.querySelector('#announcement');
  if (region) region.textContent = message;
}
function setActiveSection(id: string) {
  document.querySelectorAll<HTMLAnchorElement>('[data-section-link]').forEach(link => {
    if (link.dataset.sectionLink === id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Also works on a local HTTP LAN preview where Clipboard API is unavailable.
    const field = document.createElement('textarea');
    field.value = text;
    field.style.cssText = 'position:fixed;inset:0 auto auto -9999px';
    document.body.append(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    return copied;
  }
}
function initializePage() {
  pageEvents?.abort();
  pageEvents = new AbortController();
  const { signal } = pageEvents;
  observer?.disconnect();
  document.documentElement.classList.remove('is-navigating');

  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
  if (sections.length) {
    const nearest = [...sections].reverse().find(section => section.getBoundingClientRect().top < innerHeight * .4) || sections[0];
    setActiveSection(nearest.id);
    observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActiveSection(visible[0].target.id);
    }, { rootMargin: '-10% 0px -65% 0px', threshold: 0 });
    sections.forEach(section => observer!.observe(section));
  }

  document.querySelectorAll<HTMLButtonElement>('[data-copy-code]').forEach(button => button.addEventListener('click', async () => {
    const text = button.closest('.code-block')?.querySelector('code')?.textContent || '';
    const success = await copyText(text);
    const message = success ? 'Copied' : 'Copy manually';
    const original = button.innerHTML;
    button.textContent = message;
    announce(message);
    setTimeout(() => { if (button.isConnected) button.innerHTML = original; }, 2000);
  }, { signal }));
}

document.addEventListener('astro:before-preparation', () => document.documentElement.classList.add('is-navigating'));
document.addEventListener('astro:before-swap', () => {
  observer?.disconnect();
  pageEvents?.abort();
});
document.addEventListener('astro:page-load', initializePage);
