/*
  Everything a page shares, built from /assets/js/catalog.js.

  A page is plain HTML with a few empty placeholders; this file fills them. The
  placeholders, so a new page knows what it can ask for:

    <header id="site-header">          the bar: brand, nav, layout toggle
    <footer id="site-footer">          links to every product, layout toggle
    <div data-catalog="apps|games|all"> product cards
    <div data-product-hero>             icon, name, tagline, Play button  (needs body[data-product])
    <nav data-product-subnav>           Overview / Help / Videos / Privacy (body[data-page] marks the current one)
    <aside data-product-aside>          install panel and facts
    <ul data-help-list>                 a product's help topics
    <div data-video-list>               a product's how-to videos
    <div data-help-hub>                 every product's help and videos
    <div class="yt" data-yt="ID" data-title="...">   one YouTube video, loaded on click
    <span data-contact>                 the contact address from the catalog
    <span data-year>                    this year

  Built with DOM calls and textContent throughout, never innerHTML with catalog
  text, so a quote or an angle bracket in a description cannot break a page.

  The long description of each product is NOT here. It is static HTML in the
  product's own index.html, so it reads without JavaScript and search engines
  see it.
*/
(function () {
  'use strict';

  var C = window.NAS_CATALOG;
  if (!C) {
    console.error('catalog.js did not load before site.js');
    return;
  }

  var SVG = {
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg>',
    auto: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 2v14a7 7 0 0 1 0-14z"/></svg>',
    mobile: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 3v13h10V5z"/></svg>',
    desktop: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 4h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-7v2h3v2H7v-2h3v-2H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1 2v9h16V6z"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 3.5v17a1 1 0 0 0 1.5.86l14.7-8.5a1 1 0 0 0 0-1.72L5.5 2.64A1 1 0 0 0 4 3.5z"/></svg>'
  };

  // ------------------------------------------------------------ helpers

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'text') node.textContent = v;
        else if (k === 'html') node.innerHTML = v; // only ever our own SVG constants
        else if (k === 'class') node.className = v;
        else node.setAttribute(k, v === true ? '' : v);
      });
    }
    (children || []).forEach(function (child) {
      if (child === null || child === undefined) return;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  }

  function productUrl(p) { return '/' + p.section + '/' + p.slug + '/'; }
  function helpUrl(p) { return productUrl(p) + 'help/'; }
  function videosUrl(p) { return productUrl(p) + 'videos/'; }
  function privacyUrl(p) { return p.privacy ? productUrl(p) + 'privacy.html' : null; }
  function playUrl(p) { return p.play ? 'https://play.google.com/store/apps/details?id=' + encodeURIComponent(p.play) : null; }

  function bySection(section) {
    return C.products.filter(function (p) { return section === 'all' || p.section === section; });
  }

  function find(slug) {
    for (var i = 0; i < C.products.length; i++) if (C.products[i].slug === slug) return C.products[i];
    return null;
  }

  var STATUS_LABEL = {
    'available': 'On Google Play',
    'coming-soon': 'Coming soon',
    'in-development': 'In development'
  };

  function statusBadge(p) {
    return el('span', { class: 'badge ' + p.status, text: STATUS_LABEL[p.status] || p.status });
  }

  function icon(p, cls) {
    if (p.icon) {
      return el('img', { class: cls, src: p.icon, alt: '', width: 128, height: 128, loading: 'lazy' });
    }
    // No artwork yet: initials on the brand gradient, so a card never has a hole.
    var initials = p.name.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
    return el('div', { class: cls + ' icon-fallback', 'aria-hidden': 'true', text: initials });
  }

  function currentPath() {
    var path = location.pathname.replace(/index\.html$/, '');
    return path.endsWith('/') ? path : path;
  }

  // -------------------------------------------------------- layout toggle

  var toggles = [];

  function viewToggle(withLabels) {
    var group = el('div', { class: 'view-toggle', role: 'group', 'aria-label': 'Page layout' });
    [['auto', 'Auto'], ['mobile', 'Mobile'], ['desktop', 'Desktop']].forEach(function (opt) {
      var button = el('button', {
        type: 'button',
        'data-view': opt[0],
        title: opt[1] + ' layout',
        'aria-label': opt[1] + ' layout'
      });
      button.appendChild(el('span', { html: SVG[opt[0]] }).firstChild);
      button.appendChild(el('span', { class: withLabels ? '' : 'label', text: opt[1] }));
      button.addEventListener('click', function () {
        window.NASLayout.set(opt[0]);
        syncToggles();
      });
      group.appendChild(button);
    });
    toggles.push(group);
    return group;
  }

  function syncToggles() {
    var pref = document.documentElement.getAttribute('data-view-pref') || 'auto';
    toggles.forEach(function (group) {
      group.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-view') === pref));
      });
    });
  }

  // On Auto, keep following the window: a rotated phone or a resized window.
  var wide = window.matchMedia('(min-width: ' + window.NASLayout.BREAKPOINT + 'px)');
  var onWidth = function () {
    if (window.NASLayout.read() === 'auto') window.NASLayout.apply('auto');
  };
  if (wide.addEventListener) wide.addEventListener('change', onWidth); else wide.addListener(onWidth);

  // --------------------------------------------------------------- header

  function renderHeader() {
    var host = document.getElementById('site-header');
    if (!host) return;
    host.className = 'site-header';
    host.textContent = '';

    var path = currentPath();
    var nav = el('nav', { class: 'site-nav', id: 'site-nav', 'aria-label': 'Main' });
    var list = el('ul');
    C.nav.forEach(function (item) {
      var current = item.href === '/' ? path === '/' : path.indexOf(item.href) === 0;
      list.appendChild(el('li', null, [
        el('a', { href: item.href, 'aria-current': current ? 'page' : null, text: item.label })
      ]));
    });
    nav.appendChild(list);
    // The layout switch, inside the menu panel. Shown only in the mobile
    // layout, where the header bar has no room for it; see site.css.
    nav.appendChild(el('div', { class: 'nav-view' }, [el('p', { text: 'Page layout' }), viewToggle(true)]));

    var menu = el('button', {
      type: 'button', class: 'icon-btn', id: 'menu-button',
      'aria-controls': 'site-nav', 'aria-expanded': 'false', 'aria-label': 'Menu', html: SVG.menu
    });
    menu.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        menu.setAttribute('aria-expanded', 'false');
        menu.focus();
      }
    });

    var brand = el('a', { class: 'brand', href: '/' }, [
      el('img', { src: '/assets/img/logo.svg', alt: '', width: 40, height: 40 }),
      el('span', { text: C.studio.name })
    ]);

    var bar = el('div', { class: 'wrap bar' }, [brand, nav, viewToggle(false), menu]);
    host.appendChild(bar);
  }

  // --------------------------------------------------------------- footer

  function renderFooter() {
    var host = document.getElementById('site-footer');
    if (!host) return;
    host.className = 'site-footer';
    host.textContent = '';

    function column(title, links) {
      return el('div', null, [
        el('h2', { text: title }),
        el('ul', null, links.map(function (l) { return el('li', null, [el('a', { href: l[1], text: l[0] })]); }))
      ]);
    }

    var cols = el('div', { class: 'wrap cols' }, [
      el('div', { class: 'brand-col' }, [
        el('strong', { text: C.studio.name }),
        el('p', { text: C.studio.tagline })
      ]),
      column('Apps', bySection('apps').map(function (p) { return [p.name, productUrl(p)]; })),
      column('Games', bySection('games').map(function (p) { return [p.name, productUrl(p)]; })),
      column('Studio', [['Help centre', '/help/'], ['Website privacy', '/privacy/']]
        .concat(C.studio.contactEmail ? [['Contact', 'mailto:' + C.studio.contactEmail]] : []))
    ]);

    var base = el('div', { class: 'wrap base' }, [
      el('span', { text: '© ' + new Date().getFullYear() + ' ' + C.studio.name }),
      viewToggle(true)
    ]);

    host.appendChild(cols);
    host.appendChild(base);
  }

  // ---------------------------------------------------------------- cards

  function renderCatalogs() {
    document.querySelectorAll('[data-catalog]').forEach(function (host) {
      host.textContent = '';
      host.classList.add('grid');
      bySection(host.getAttribute('data-catalog')).forEach(function (p) {
        var meta = el('div', { class: 'meta' }, [statusBadge(p)].concat(
          (p.tags || []).map(function (t) { return el('span', { class: 'tag', text: t }); })
        ));
        host.appendChild(el('a', { class: 'card', href: productUrl(p) }, [
          icon(p, 'icon'),
          el('div', null, [el('h3', { text: p.name }), el('p', { text: p.short }), meta])
        ]));
      });
    });
  }

  // -------------------------------------------------------- product pages

  function renderProduct() {
    var slug = document.body.getAttribute('data-product');
    if (!slug) return;
    var p = find(slug);
    if (!p) {
      console.error('No product "' + slug + '" in catalog.js');
      return;
    }
    var page = document.body.getAttribute('data-page') || 'overview';

    var hero = document.querySelector('[data-product-hero]');
    if (hero) {
      hero.textContent = '';
      hero.classList.add('product-hero');
      hero.appendChild(icon(p, 'icon'));
      var badges = el('div', { class: 'meta actions' }, [statusBadge(p)]);
      hero.appendChild(el('div', null, [
        el(page === 'overview' ? 'h1' : 'p', { class: page === 'overview' ? '' : 'h1-like', text: p.name }),
        el('p', { class: 'tagline', text: p.tagline }),
        badges
      ]));
    }

    var subnav = document.querySelector('[data-product-subnav]');
    if (subnav) {
      subnav.textContent = '';
      subnav.classList.add('subnav');
      subnav.setAttribute('aria-label', p.name);
      var items = [['overview', 'Overview', productUrl(p)], ['help', 'Help', helpUrl(p)], ['videos', 'Videos', videosUrl(p)]];
      if (p.privacy) items.push(['privacy', 'Privacy', privacyUrl(p)]);
      items.forEach(function (i) {
        subnav.appendChild(el('a', { href: i[2], 'aria-current': page === i[0] ? 'page' : null, text: i[1] }));
      });
    }

    var aside = document.querySelector('[data-product-aside]');
    if (aside) {
      aside.textContent = '';
      aside.classList.add('product-aside');

      var get = el('div', { class: 'panel' }, [el('h2', { text: p.section === 'games' ? 'Get the game' : 'Get the app' })]);
      if (p.play) {
        get.appendChild(el('a', { class: 'btn btn-primary', href: playUrl(p), rel: 'noopener', html: SVG.play }, []));
        get.lastChild.appendChild(document.createTextNode(' Google Play'));
      } else {
        get.appendChild(el('p', { text: p.status === 'coming-soon' ? 'Coming to Google Play soon.' : 'In development. Not on Google Play yet.' }));
      }
      aside.appendChild(get);

      var facts = el('dl', { class: 'facts' });
      (p.facts || []).forEach(function (f) {
        facts.appendChild(el('dt', { text: f[0] }));
        facts.appendChild(el('dd', { text: f[1] }));
      });
      if (facts.childNodes.length) {
        aside.appendChild(el('div', { class: 'panel' }, [el('h2', { text: 'Details' }), facts]));
      }

      var links = [['Help topics', helpUrl(p)], ['How-to videos', videosUrl(p)]];
      if (p.privacy) links.push(['Privacy policy', privacyUrl(p)]);
      aside.appendChild(el('div', { class: 'panel' }, [
        el('h2', { text: 'Support' }),
        el('ul', null, links.map(function (l) { return el('li', null, [el('a', { href: l[1], text: l[0] })]); }))
      ]));
    }

    renderHelpList(p);
    renderVideoList(p);
  }

  function renderHelpList(p) {
    var host = document.querySelector('[data-help-list]');
    if (!host) return;
    host.textContent = '';
    if (!p.help || !p.help.length) {
      host.replaceWith(el('p', { class: 'notice', text: 'Help topics for ' + p.name + ' are being written. Check back soon.' }));
      return;
    }
    host.classList.add('topic-list');
    p.help.forEach(function (t) {
      host.appendChild(el('li', null, [
        el('a', { href: helpUrl(p) + t.slug + '.html' }, [el('strong', { text: t.title }), el('span', { text: t.summary || '' })])
      ]));
    });
  }

  function renderVideoList(p) {
    var host = document.querySelector('[data-video-list]');
    if (!host) return;
    host.textContent = '';
    if (!p.videos || !p.videos.length) {
      host.replaceWith(el('p', { class: 'notice', text: 'How-to videos for ' + p.name + ' are on the way.' }));
      return;
    }
    host.classList.add('video-list');
    p.videos.forEach(function (v) {
      host.appendChild(el('article', null, [
        el('div', { class: 'yt', 'data-yt': v.youtube, 'data-title': v.title }),
        el('h3', { text: v.title }),
        el('p', { text: v.summary || '' })
      ]));
    });
  }

  function renderHelpHub() {
    document.querySelectorAll('[data-help-hub]').forEach(function (host) {
      host.textContent = '';
      ['apps', 'games'].forEach(function (section) {
        host.appendChild(el('h2', { text: C.sections[section].title }));
        var list = el('ul', { class: 'topic-list' });
        bySection(section).forEach(function (p) {
          var topics = (p.help || []).length;
          var videos = (p.videos || []).length;
          var summary = (topics ? topics + ' help topic' + (topics === 1 ? '' : 's') : 'Help coming soon')
            + ' · ' + (videos ? videos + ' video' + (videos === 1 ? '' : 's') : 'videos coming soon');
          list.appendChild(el('li', null, [
            el('a', { href: helpUrl(p) }, [el('strong', { text: p.name }), el('span', { text: summary })])
          ]));
        });
        host.appendChild(list);
      });
    });
  }

  // -------------------------------------------------------------- YouTube

  /*
    A thumbnail and a button until the visitor asks for the video. Loading
    YouTube's player on page load costs every visitor several hundred
    kilobytes and sets YouTube cookies whether or not they watch - so nothing
    is fetched from youtube.com until the click, and then only from the
    privacy-enhanced domain. The website privacy page says the same.
  */
  function initVideos(root) {
    (root || document).querySelectorAll('.yt[data-yt]').forEach(function (box) {
      if (box.getAttribute('data-ready')) return;
      var id = box.getAttribute('data-yt');
      if (!/^[A-Za-z0-9_-]{6,20}$/.test(id)) return;
      var title = box.getAttribute('data-title') || 'Video';
      box.setAttribute('data-ready', '1');
      box.style.backgroundImage = 'url("https://i.ytimg.com/vi/' + id + '/hqdefault.jpg")';
      var button = el('button', { type: 'button', 'aria-label': 'Play video: ' + title }, [
        el('strong', { text: title }),
        el('span', { class: 'yt-note', text: 'Plays from YouTube' })
      ]);
      button.addEventListener('click', function () {
        box.textContent = '';
        box.appendChild(el('iframe', {
          src: 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0',
          title: title,
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          allowfullscreen: true
        }));
      });
      box.appendChild(button);
    });
  }

  // ------------------------------------------------------------ small bits

  function renderSmallBits() {
    document.querySelectorAll('[data-year]').forEach(function (n) { n.textContent = String(new Date().getFullYear()); });
    document.querySelectorAll('[data-contact]').forEach(function (n) {
      n.textContent = '';
      if (C.studio.contactEmail) {
        n.appendChild(el('a', { href: 'mailto:' + C.studio.contactEmail, text: C.studio.contactEmail }));
      } else {
        n.textContent = 'the developer contact address on our Google Play listing';
      }
    });
  }

  function start() {
    renderHeader();
    renderFooter();
    renderCatalogs();
    renderProduct();
    renderHelpHub();
    renderSmallBits();
    initVideos();
    syncToggles();
  }

  window.NASite = { initVideos: initVideos, catalog: C };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
