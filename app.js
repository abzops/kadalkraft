'use strict';

(() => {

  document.body.classList.add('js');

  const config = window.KADALKRAFT_CONFIG || {};

  const localHost = ['localhost', '127.0.0.1', '[::1]', '::1', ''].includes(location.hostname);

  const draft = config.DRAFT_MODE === true && localHost;

  document.documentElement.dataset.mode = draft ? 'draft' : 'live';

  const unresolved = /\[(?:TODO|PHOTO NEEDED)(?::[^\]]*)?\]/i;

  document.querySelectorAll('[data-pending-section], [data-content-unit], [data-photo], [data-form-state]').forEach(element => {

    element.hidden = !draft && unresolved.test(element.textContent);

  });

  document.querySelectorAll('[data-draft-only]').forEach(element => { element.hidden = !draft; });

  if (!draft) {

    // Safety net for newly added placeholders: hide the smallest meaningful unit.

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

    const pending = [];

    while (walker.nextNode()) {

      const node = walker.currentNode;

      if (unresolved.test(node.textContent) && !node.parentElement.closest('script,style,[hidden]')) pending.push(node.parentElement);

    }

    pending.forEach(element => { (element.closest('tr,[data-form-state],[data-content-unit],section') || element).hidden = true; });

  }

  document.querySelectorAll('table').forEach(table => {

    if (!draft && !table.querySelector('tbody tr:not([hidden])')) table.hidden = true;

  });

  document.querySelectorAll('[data-section-link]').forEach(link => {

    const url = new URL(link.href, location.href);

    const target = url.hash ? document.getElementById(url.hash.slice(1)) : null;

    if (target) link.hidden = Boolean(target.closest('[hidden]'));

    else if (draft) link.hidden = false;

  });

  const menuButton = document.querySelector('.menu-toggle');

  const navigation = document.querySelector('#main-nav');

  const closeMenu = (focus = false) => {

    if (!menuButton || !navigation) return;

    menuButton.setAttribute('aria-expanded', 'false');

    navigation.classList.remove('is-open');

    if (focus) menuButton.focus();

  };

  if (menuButton && navigation) {

    menuButton.addEventListener('click', () => {

      const expanded = menuButton.getAttribute('aria-expanded') !== 'true';

      menuButton.setAttribute('aria-expanded', String(expanded));

      navigation.classList.toggle('is-open', expanded);

    });

    document.querySelector('.site-header').addEventListener('focusout', event => { if (!event.currentTarget.contains(event.relatedTarget)) closeMenu(); });
    document.querySelector('.mobile-enquiry')?.addEventListener('click', () => closeMenu());
    navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });

    document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });

    document.addEventListener('keydown', event => { if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true); });

    matchMedia('(min-width: 950px)').addEventListener('change', () => closeMenu());

  }

  let endpoint = null;

  try {

    const raw = String(config.FORM_ENDPOINT || '').trim();

    if (raw && !unresolved.test(raw) && !/YOUR_|REPLACE_|FORM_ENDPOINT/i.test(raw)) {

      const url = new URL(raw);

      const localEndpoint = ['localhost', '127.0.0.1', '[::1]', '::1'].includes(url.hostname);

      const keyRequired = url.hostname === 'api.web3forms.com';

      const keyReady = Boolean(config.FORM_ACCESS_KEY) && !/YOUR_|REPLACE_|\[TODO/i.test(config.FORM_ACCESS_KEY);

      if ((!keyRequired || keyReady) && (url.protocol === 'https:' || (localHost && localEndpoint && url.protocol === 'http:'))) endpoint = url.href;

    }

  } catch { /* An invalid or unset endpoint leaves the contact fallback intact. */ }

  const canSend = Boolean(endpoint) && !draft;

  document.querySelectorAll('[data-endpoint-only]').forEach(element => { element.hidden = !canSend; });

  const form = document.querySelector('#enquiry-form');

  const fallback = document.querySelector('#contact-fallback');

  if (form) {

    form.hidden = !(canSend || draft);

    if (fallback) fallback.hidden = canSend;

    const submitButton = document.querySelector('#submit-enquiry');

    submitButton.disabled = !canSend;

    const setup = document.querySelector('[data-form-setup]');

    if (setup) setup.hidden = !draft;

    const fields = [...form.querySelectorAll('input:not([name="_gotcha"]),select,textarea')];

    const status = document.querySelector('#form-status');

    const summary = document.querySelector('#error-summary');

    let sending = false;

    let sent = false;

    const errorsFor = field => {

      const value = field.value.trim();

      if (field.required && !value) return field.id === 'product' ? 'Select the product you need.' : `Enter your ${field.labels[0].textContent.replace('*', '').trim().toLowerCase()}.`;

      if (field.id === 'email' && value && field.validity.typeMismatch) return 'Enter a valid email address.';

      if (field.id === 'phone' && value && (!/^[+\d\s().-]+$/.test(value) || value.replace(/\D/g, '').length < 7 || value.replace(/\D/g, '').length > 15)) return 'Enter a valid phone number, including the country code if needed.';

      if (field.id === 'quantity' && value && (!/[a-zA-Z]/.test(value) || !/(?:\d+(?:\.\d+)?)/.test(value) || !(parseFloat(value.replace(/,/g, '')) > 0))) return 'Include a positive quantity and unit, for example 500 kg per month.';

      if (field.maxLength > 0 && value.length > field.maxLength) return `Use no more than ${field.maxLength} characters.`;

      return '';

    };

    const showError = field => {

      const error = errorsFor(field);

      const message = document.getElementById(`${field.id}-error`);

      if (message) { message.textContent = error; message.hidden = !error; }

      field.setAttribute('aria-invalid', String(Boolean(error)));

      return error;

    };

    fields.forEach(field => {

      field.addEventListener('blur', () => showError(field));

      field.addEventListener('input', () => {

        if (field.getAttribute('aria-invalid') === 'true') showError(field);

        if (sent) { status.textContent = ''; sent = false; }

      });

    });

    form.addEventListener('submit', async event => {

      event.preventDefault();

      if (!canSend || sending) return;

      const invalid = fields.filter(field => showError(field));

      if (invalid.length) {

        summary.textContent = 'Check the highlighted fields before sending your enquiry.';

        summary.hidden = false;

        invalid[0].focus();

        return;

      }

      summary.hidden = true;

      if (form.elements._gotcha.value) {

        status.textContent = 'Your enquiry could not be sent. Please try again.';

        return;

      }

      const data = Object.fromEntries(fields.map(field => [field.name, field.value.trim()]));

      data._gotcha = '';

      data.subject = 'Kadalkraft seafood enquiry';

      if (config.FORM_ACCESS_KEY) data.access_key = config.FORM_ACCESS_KEY;

      data.email = form.elements.email.value.trim();

      sending = true;

      submitButton.disabled = true;

      form.setAttribute('aria-busy', 'true');

      status.textContent = 'Sending your enquiry…';

      const abort = new AbortController();

      const timeout = setTimeout(() => abort.abort(), 15000);

      try {

        const response = await fetch(endpoint, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: abort.signal, credentials: 'omit', referrerPolicy: 'strict-origin-when-cross-origin' });

        let result = {};

        if (response.status !== 204) {

          if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Unrecognised response');

          result = await response.json();

        }

        if (!response.ok || result.success === false || result.ok === false || result.error || result.errors) throw new Error('Enquiry was not accepted');

        status.textContent = 'Your enquiry has been sent.';

        sent = true;

        form.reset();

        fields.forEach(field => { field.removeAttribute('aria-invalid'); document.getElementById(`${field.id}-error`)?.setAttribute('hidden', ''); });

      } catch {

        status.textContent = 'Your enquiry could not be sent. Please try again, or contact us by email or WhatsApp.';

        if (fallback) fallback.hidden = false;

      } finally {

        clearTimeout(timeout);

        sending = false;

        submitButton.disabled = false;

        form.removeAttribute('aria-busy');

      }

    });

  }

  document.querySelectorAll('[data-year]').forEach(element => { element.textContent = new Date().getFullYear(); });

})();
