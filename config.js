/* Public configuration. Never put secret credentials in this file. */

window.KADALKRAFT_CONFIG = Object.freeze({

  DRAFT_MODE: false, // The only draft/live switch. Draft works on local hosts only.

  FORM_ENDPOINT: '', // Optional: set a real HTTPS endpoint to enable the enquiry form.

  FORM_ACCESS_KEY: '' // Web3Forms public access key only, if that provider is used.

});

(function () {

  const local = ['localhost', '127.0.0.1', '[::1]', '::1', ''].includes(location.hostname);

  const draft = local && window.KADALKRAFT_CONFIG.DRAFT_MODE === true;

  document.documentElement.dataset.mode = draft ? 'draft' : 'live';

})();

