/*
  Decides mobile or desktop layout before the page paints.

  Loaded synchronously in <head> on every page, and deliberately tiny. It sets
  two attributes on <html>:

    data-view-pref  what the visitor chose: auto | mobile | desktop
    data-layout     what is actually applied: mobile | desktop

  On "auto" the layout follows the window width, and site.js keeps following
  it as the window is resized or a phone is rotated. The stylesheet only ever
  reads data-layout, so the toggle and the responsive behaviour are one
  mechanism.

  "Desktop" on a phone also widens the viewport, which is what a browser's own
  "Desktop site" does: without it the desktop grid would be squeezed into 400px
  and read worse than the mobile layout it replaced.
*/
(function () {
  var KEY = 'nas-view';
  var BREAKPOINT = 900;
  var DESKTOP_VIEWPORT = 'width=1200';

  function read() {
    try {
      var v = localStorage.getItem(KEY);
      return v === 'mobile' || v === 'desktop' ? v : 'auto';
    } catch (e) {
      return 'auto';
    }
  }

  // The screen, not the window: a desktop browser in a narrow window keeps its
  // own viewport. Not "pointer: coarse" as well - an emulator, a phone with a
  // mouse or a stylus reports a fine pointer and would then be squeezed.
  function screenIsNarrow() {
    return Math.min(screen.width, screen.height) < BREAKPOINT;
  }

  function apply(pref) {
    var root = document.documentElement;
    var viewport = document.querySelector('meta[name="viewport"]');
    if (viewport && !viewport.hasAttribute('data-original')) {
      viewport.setAttribute('data-original', viewport.getAttribute('content'));
    }

    var layout;
    if (pref === 'auto') {
      layout = window.matchMedia('(min-width: ' + BREAKPOINT + 'px)').matches ? 'desktop' : 'mobile';
    } else {
      layout = pref;
    }

    if (viewport) {
      var wide = pref === 'desktop' && screenIsNarrow();
      viewport.setAttribute('content', wide ? DESKTOP_VIEWPORT : viewport.getAttribute('data-original'));
    }

    root.setAttribute('data-view-pref', pref);
    root.setAttribute('data-layout', layout);
  }

  window.NASLayout = {
    KEY: KEY,
    BREAKPOINT: BREAKPOINT,
    read: read,
    apply: apply,
    set: function (pref) {
      try {
        if (pref === 'auto') localStorage.removeItem(KEY); else localStorage.setItem(KEY, pref);
      } catch (e) { /* private mode: the choice lasts for this page only */ }
      apply(pref);
    }
  };

  apply(read());
})();
