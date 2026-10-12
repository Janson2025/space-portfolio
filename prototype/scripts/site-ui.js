export function initSiteUi() {
  initMobileNavigation();
  initPlannedLinks();
}

function initMobileNavigation() {
  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.main-nav');
  if (!toggle || !navigation) return;

  toggle.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  navigation.addEventListener('click', (event) => {
    if (!event.target.closest('a')) return;

    navigation.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
}

function initPlannedLinks() {
  const toast = document.querySelector('.toast');
  if (!toast) return;

  let timeoutId;
  document.querySelectorAll('[data-planned]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      toast.textContent = 'This destination is on the flight plan — coming in a later prototype pass.';
      toast.classList.add('show');

      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => toast.classList.remove('show'), 2800);
    });
  });
}
