'use strict';

(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 950px)');
  const header = document.querySelector('.site-header');
  const images = [...document.querySelectorAll('[data-scroll-image]')];
  const reveals = [...document.querySelectorAll('.reveal')];
  const hero = [...document.querySelectorAll('.hero-reveal')];
  const activeAnimations = new Set();
  const revealed = new WeakSet();
  let observer;
  let frame = 0;

  // CSS keeps everything visible; animation is only a progressive enhancement.
  const reveal = (element, delay = 0) => {
    if (preference.matches || revealed.has(element) || !element.animate) return;
    revealed.add(element);
    const animation = element.animate(
      [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 760, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }
    );
    activeAnimations.add(animation);
    animation.finished.then(
      () => activeAnimations.delete(animation),
      () => activeAnimations.delete(animation)
    );
  };

  const observeReveals = () => {
    if (preference.matches || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    reveals.forEach(element => { if (!revealed.has(element)) observer.observe(element); });
  };

  const page = new URL(location.href);
  const nav = [...document.querySelectorAll('.main-nav a[href]')].flatMap(link => {
    const target = new URL(link.getAttribute('href'), page);
    if (target.origin !== page.origin || target.pathname.replace(/index\.html$/, '') !== page.pathname.replace(/index\.html$/, '') || !target.hash) return [];
    const section = document.getElementById(target.hash.slice(1));
    return section ? [{ link, section }] : [];
  });

  const update = () => {
    frame = 0;
    if (document.visibilityState === 'hidden') return;
    const y = Math.max(0, window.scrollY);
    const height = window.innerHeight;
    const positions = nav.map(item => ({ ...item, rect: item.section.getBoundingClientRect() }));
    const imagePositions = !preference.matches && desktop.matches
      ? images.map(image => ({ image, rect: image.parentElement.getBoundingClientRect() })) : [];
    const readingLine = Math.max(64, Math.min(height * 0.35, 300));
    const current = positions.filter(item => item.rect.top <= readingLine && item.rect.bottom > 64).at(-1);

    header?.classList.toggle('scrolled', y > 8);
    positions.forEach(({ link }) => {
      if (link === current?.link) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    imagePositions.forEach(({ image, rect }) => {
      if (rect.bottom <= 0 || rect.top >= height) return;
      const offset = Math.max(-14, Math.min(14, (height / 2 - rect.top - rect.height / 2) * 0.045));
      image.style.transform = `translateY(${offset.toFixed(2)}px) scale(1.08)`;
    });
  };

  const schedule = () => {
    if (!frame && document.visibilityState !== 'hidden') frame = requestAnimationFrame(update);
  };
  const resetImages = () => images.forEach(image => { image.style.transform = ''; });
  const stopMotion = () => {
    observer?.disconnect();
    activeAnimations.forEach(animation => animation.cancel());
    activeAnimations.clear();
    resetImages();
  };

  hero.forEach((element, index) => reveal(element, Math.min(index, 4) * 90));
  observeReveals();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      activeAnimations.forEach(animation => animation.cancel());
      activeAnimations.clear();
    } else schedule();
  });
  preference.addEventListener('change', event => {
    if (event.matches) stopMotion();
    else observeReveals();
    schedule();
  });
  desktop.addEventListener('change', () => { resetImages(); schedule(); });
  schedule();
})();
