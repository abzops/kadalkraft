# Connecting the enquiry form

The default is live rendering with an empty `FORM_ENDPOINT`. Email and WhatsApp are available; the online form remains hidden. Set only public form-routing values in `config.js`, never private API tokens or passwords.

## Formspree

1. In the owner's Formspree account, create a form and confirm the destination inbox.
2. Copy its endpoint, in the format `https://formspree.io/f/ACTUAL_FORM_ID`.
3. Set `FORM_ENDPOINT` to that real endpoint. Leave `FORM_ACCESS_KEY` empty and `DRAFT_MODE` false.
4. Configure provider-side spam controls and allowed domains/origins where offered. The client honeypot is only an additional filter.
5. Update the enquiry privacy details in the facts file and the notice with the actual provider, purposes and retention arrangements.
6. Test deliberately with the owner's permission; confirm receipt in the destination inbox before calling the real service verified.

The site sends JSON using POST and asks for a JSON response. See [Formspree's JavaScript guide](https://help.formspree.io/articles/building-your-form/submit-forms-with-javascript-ajax) and [their fetch example](https://formspree.io/blog/formspree-ajax/).

## Web3Forms alternative

1. Create the owner's public form access key for the intended inbox.
2. Set `FORM_ENDPOINT` to `https://api.web3forms.com/submit`.
3. Set `FORM_ACCESS_KEY` to that public routing key. A missing key leaves the fallback visible.
4. Complete provider-side spam/domain configuration and the same privacy and receipt checks above.

The payload includes `access_key` when configured. See the [provider-maintained API reference](https://github.com/surjithctly/web3forms-docs/blob/main/getting-started/api-reference.md).

## Behaviour and validation

Fields: name, company, optional phone, email, product, approximate monthly quantity with unit, delivery location in Kerala, optional frequency and notes. Required fields have visible labels and adjacent errors. Product options are limited to the three confirmed categories and a multiple-products option. Quantity needs a positive number and unit. The form includes an off-screen honeypot, blocks double submission and times out after 15 seconds. Client-side checks are not a substitute for the provider's server-side validation and abuse protection.

A successful HTTP JSON acknowledgement (or 204 response) shows success. HTTP errors, provider error flags, unrecognised responses and timeouts show a failure while preserving the entries. No success is shown for an unconfigured endpoint or honeypot rejection. A failed attempt does not prove whether the provider received it; review the inbox before retrying if necessary.

The local build was checked against a local mock endpoint only. No provider account was created and no real enquiry was sent. Localhost HTTP endpoints are accepted only from a local page for testing; hosted pages require HTTPS. The config rejects obvious example/placeholder endpoints. Draft previews never send, even when an endpoint exists.

## Live versus draft

`DRAFT_MODE: false` is the saved default. Set it true only to review local placeholders. A remote host ignores true and renders live. The mode flag changes presentation; it is not access control for the HTML source. Draft data must never contain secrets or private partner material.
