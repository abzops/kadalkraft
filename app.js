'use strict';
document.body.classList.add('js');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
function closeMenu(returnFocus = false) {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
window.matchMedia('(min-width: 761px)').addEventListener('change', () => closeMenu());
document.querySelectorAll('.product-enquiry').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('#product').value = link.dataset.product;
  });
});
const form = document.querySelector('#enquiry-form');
if (form) {
  ['name', 'requirements'].forEach(id => {
    const field = document.getElementById(id);
    const validate = () => field.setCustomValidity(field.value && !field.value.trim() ? 'Please enter a value, not just spaces.' : '');
    field.addEventListener('input', validate);
  });
}
if (form) form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const product = data.get('product') || 'Seafood';
  const subject = `Kadalkraft enquiry — ${product}`;
  const body = `Hello Kadalkraft,\n\nI would like to discuss the following requirement.\n\nName: ${data.get('name').trim()}\nCompany: ${data.get('company').trim() || 'Not specified'}\nEmail: ${data.get('email').trim()}\nProduct: ${product}\n\nRequirements:\n${data.get('requirements').trim()}\n\nThank you.`;
  window.location.href = `mailto:info@kadalkraft.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  document.querySelector('#form-status').textContent = 'Continue in your email app to send your enquiry. If it did not open, email info@kadalkraft.com directly. Your details remain here.';
});
document.querySelector('#year').textContent = new Date().getFullYear();
