/* Page-specific interaction. The Scroll Craft engine remains unmodified. */
'use strict';
(() => {
  const main = document.querySelector('main');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 950px)');
  const kinetic = [...document.querySelectorAll('[data-sc-kinetic]')].map(el => ({ el, html: el.innerHTML }));
  let instance;
  function stop() {
    instance?.destroy();
    instance = null;
    document.querySelectorAll('[data-sc-reveal]').forEach(el => { el.style.clipPath = ''; });
    kinetic.forEach(({ el, html }) => {
      el.innerHTML = html;
      el.style.opacity = '';
      el.style.transform = '';
      el.style.pointerEvents = '';
      el.classList.remove('sc-is-split');
      el.__scSplit = null;
    });
  }
  function sync() {
    const enabled = window.ScrollCraft && !window.ScrollCraft.reduce && !reduced.matches && desktop.matches && document.visibilityState !== 'hidden';
    if (!enabled) { if (instance) stop(); return; }
    if (!instance) {
      try { instance = window.ScrollCraft.mount(main); }
      catch { stop(); }
    }
  }
  reduced.addEventListener('change', sync);
  desktop.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  sync();

  const prompt = document.querySelector('[data-catalogue-prompt]');
  if (prompt) prompt.textContent = 'Choose a product for your enquiry.';
  const hint = document.querySelector('.selection-hint');
  if (hint) hint.hidden = false;
  const choices = [...document.querySelectorAll('[data-enquiry-product]')];
  const notice = document.querySelector('.selected-product');
  const label = document.querySelector('#selected-product-label');
  const contact = document.querySelector('#contact-fallback');
  const email = contact?.querySelector('a[href^="mailto:"]');
  const whatsapp = contact?.querySelector('a[href^="https://wa.me/"]');
  const formProduct = document.querySelector('#product');
  const initial = { email: email?.getAttribute('href'), whatsapp: whatsapp?.getAttribute('href') };
  function choose(product) {
    choices.forEach(link => { link.dataset.selected = String(link.dataset.enquiryProduct === product); });
    if (notice) notice.hidden = !product;
    if (label) label.textContent = product ? `For your enquiry: ${product}` : '';
    if (formProduct) formProduct.value = product || '';
    if (!product) {
      if (email) email.setAttribute('href', initial.email);
      if (whatsapp) whatsapp.setAttribute('href', initial.whatsapp);
      return;
    }
    const message = `Hello Kadalkraft, I would like to enquire about ${product}.\n\nMy requirements:\nSpecies:\nSize or count:\nPreparation and packing:\nMonthly quantity:\nDelivery location:`;
    if (email) email.setAttribute('href', `mailto:info@kadalkraft.com?subject=${encodeURIComponent(product + ' enquiry')}&body=${encodeURIComponent(message)}`);
    if (whatsapp) whatsapp.setAttribute('href', `https://wa.me/919400568744?text=${encodeURIComponent(message)}`);
  }
  choices.forEach(link => link.addEventListener('click', () => choose(link.dataset.enquiryProduct)));
  document.querySelector('#clear-product')?.addEventListener('click', () => { choose(''); choices[0]?.focus(); });
  if ('IntersectionObserver' in window) {
    const view = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        choices.forEach(link => {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -55% 0px' });
    document.querySelectorAll('.product-card').forEach(el => view.observe(el));
  }
})();
