/* Google Analytics, only with consent.
 *
 * Nothing is loaded from Google and no cookie is set until the visitor clicks
 * Accept. The choice is remembered in this browser (localStorage, which is
 * strictly necessary for that one job) and can be changed at any time from any
 * element marked data-cookie-settings, e.g. the "Cookie settings" footer link.
 * Withdrawing deletes the _ga cookies and stops tracking.
 */
(function () {
  var ID = 'G-TFR9FWYZGK';
  var KEY = 'qes_analytics';
  var loaded = false;

  function getChoice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setChoice(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }

  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(s);
  }

  function clearAnalyticsCookies() {
    var host = location.hostname;
    var parts = host.split('.');
    var domains = ['', host, '.' + host, '.' + parts.slice(-2).join('.')];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0) {
        domains.forEach(function (d) {
          document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }

  function choose(v, box) {
    setChoice(v);
    if (box) box.parentNode.removeChild(box);
    if (v === 'granted') {
      window['ga-disable-' + ID] = false;
      loadAnalytics();
    } else {
      // Stand the tag down first: GA4 sends a last hit on page unload that
      // could otherwise rewrite a cookie we have just deleted.
      window['ga-disable-' + ID] = true;
      clearAnalyticsCookies();
      // gtag cannot be unloaded from a page it already runs on.
      if (loaded) location.reload();
    }
  }

  function showBanner() {
    if (document.getElementById('qes-consent')) return;
    var box = document.createElement('div');
    box.id = 'qes-consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Cookie choice');
    box.innerHTML =
      '<p>We’d like to use Google Analytics cookies to see which pages people ' +
      'read, so we can improve them. Nothing is tracked unless you say yes. ' +
      '<a href="/legal.html#cookies">Details</a></p>' +
      '<div class="qes-btns">' +
      '<button type="button" data-choice="denied">No thanks</button>' +
      '<button type="button" data-choice="granted">Accept</button>' +
      '</div>';
    var css = document.createElement('style');
    css.textContent =
      '#qes-consent{position:fixed;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));' +
      'max-width:560px;margin:0 auto;z-index:9999;background:#111;color:#eee;border:1px solid #333;' +
      'border-radius:8px;padding:14px 16px;font:14px/1.45 system-ui,-apple-system,sans-serif;' +
      'box-shadow:0 6px 24px rgba(0,0,0,.4)}' +
      '#qes-consent p{margin:0 0 12px}' +
      '#qes-consent a{color:#5BE12C}' +
      '#qes-consent .qes-btns{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}' +
      '#qes-consent button{font:inherit;cursor:pointer;padding:8px 16px;border-radius:6px;' +
      'border:1px solid #5BE12C;background:transparent;color:#eee;min-width:110px}' +
      '#qes-consent button:focus-visible{outline:2px solid #5BE12C;outline-offset:2px}';
    box.appendChild(css);
    box.addEventListener('click', function (e) {
      var v = e.target && e.target.getAttribute && e.target.getAttribute('data-choice');
      if (v) choose(v, box);
    });
    document.body.appendChild(box);
  }

  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('[data-cookie-settings]');
    if (t) { e.preventDefault(); showBanner(); }
  });

  var choice = getChoice();
  if (choice === 'denied') {
    // Sweep anything a withdrawn tag managed to rewrite on its way out.
    window['ga-disable-' + ID] = true;
    clearAnalyticsCookies();
  }
  if (choice === 'granted') loadAnalytics();
  function init() { if (choice !== 'granted' && choice !== 'denied') showBanner(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
