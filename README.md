# Nessaid Android Studio website

The site for the developer account's apps and games, published by GitHub Pages at
**https://nessaid-android.github.io**.

Plain HTML, one stylesheet and three scripts. There is no build step: what is
committed to `main` is what is served, a minute or two after the push.

## Layout of the repository

```
index.html                  home: hero, app cards, game cards
apps/index.html             all apps
games/index.html            all games
help/index.html             help centre: every product's topics and videos
privacy/index.html          the website's own privacy page
404.html                    page not found
<section>/<slug>/
    index.html              product page: long description, features, screenshots
    help/index.html         the product's help topics (listed from catalog.js)
    help/<topic>.html       one help topic
    videos/index.html       the product's how-to videos (listed from catalog.js)
    privacy.html            the app's privacy policy, where one exists
assets/css/site.css         every style, light and dark, mobile and desktop
assets/js/layout.js         picks mobile or desktop layout before the page paints
assets/js/catalog.js        THE list of products: names, short text, status, help, videos
assets/js/site.js           header, footer, cards, product header, help and video lists
assets/img/                 logo, favicon, product icons
templates/                  starting points for new pages (not linked, not indexed)
tools/site.py               creates pages from the templates; sitemap; checks
sitemap.xml, robots.txt     for search engines
.nojekyll                   serve files as they are, without Jekyll
```

Current slugs: `apps/battery-alarm`, `apps/alarm-clock`, `apps/location-alarm`,
`apps/calculator`, `games/2048-puzzle`, `games/rummy`, `games/teen-patti`,
`games/twenty-eight`. **A slug is part of a URL that Play listings and people
link to, so never rename one** once it is published.

## Where each thing is written

| To change | Edit |
|---|---|
| A product's name, tagline, short description, status, Play link, facts | `assets/js/catalog.js` |
| A product's long description, features, screenshots | `<section>/<slug>/index.html`, between `LONG:START` and `LONG:END` |
| The list of help topics or videos | the product's `help` / `videos` arrays in `catalog.js` |
| A help topic's content | `<section>/<slug>/help/<topic>.html` |
| Header links | `nav` in `catalog.js` |
| Colours, spacing | the tokens at the top of `assets/css/site.css` |
| The contact address, `nessaid.android@gmail.com` | `studio.contactEmail` in `catalog.js`, and the `data-contact` line in each `privacy.html`, `privacy/index.html` and `templates/privacy.html` |

Short text lives only in the catalog, and long text only on the product page, so
neither can drift out of step with a copy of itself.

## Mobile and desktop

Every page has a layout switch: **Auto**, **Mobile** or **Desktop**. It is in the
header on desktop, in the menu on mobile, and in the footer on both.

- **Auto** follows the window: the desktop layout from 900px wide, the mobile
  layout below it, and it switches as a window is resized or a phone is rotated.
- **Mobile** or **Desktop** forces that layout on every page, remembered in the
  browser's local storage. Desktop on a phone widens the viewport, like a
  browser's own "desktop site", so the wide layout is shown at a readable scale.
  Mobile on a computer shows the page at phone width in the middle of the window.

How it works: `layout.js` sets `data-layout="mobile"` or `"desktop"` on `<html>`
before anything is drawn. The stylesheet is mobile-first, and everything wider is
written under `html[data-layout="desktop"]`. So there is one set of mobile rules
and one set of desktop rules, and the switch and the automatic behaviour use the
same attribute. Without JavaScript, pages show the mobile layout, which reads
correctly at any width.

## Common jobs

All commands run from the repository root, with Python 3.

### Preview before pushing

```bash
python tools/site.py serve
```

Then open http://localhost:8000. Pages use root-relative links (`/assets/...`),
so opening an HTML file directly from disk shows it unstyled; always use the
server.

### Add a help topic

```bash
python tools/site.py topic apps battery-alarm set-up-your-first-alarm "Set up your first alarm"
```

1. Write the page it creates, `apps/battery-alarm/help/set-up-your-first-alarm.html`.
2. List it in `catalog.js`, in that product's `help` array:
   ```js
   help: [
     { slug: 'set-up-your-first-alarm', title: 'Set up your first alarm', summary: 'Choose a level and how the alarm sounds.' }
   ],
   ```
3. `python tools/site.py check` and `python tools/site.py sitemap`.

### Add a how-to video

Upload it to YouTube, take the ID from its address (the part after `v=`), and add
it to the product's `videos` array:

```js
videos: [
  { youtube: 'dQw4w9WgXcQ', title: 'Set an alarm in 60 seconds', summary: 'From install to your first alarm.' }
],
```

It appears on the product's Videos page. To put a video inside a help topic or on
the product page instead, add:

```html
<div class="yt" data-yt="dQw4w9WgXcQ" data-title="Set an alarm in 60 seconds"></div>
```

Videos show as a thumbnail and load nothing from YouTube until someone presses
play, and then from YouTube's privacy-enhanced domain. The website privacy page
says so; keep it true if this changes.

### Publish a product on Google Play

In `catalog.js`: set `status: 'available'` and `play: '<package name>'`. The
Google Play button appears on its page and card. For a product not yet out but
announced, `status: 'coming-soon'`.

### Add a privacy policy

```bash
python tools/site.py privacy apps location-alarm
```

Fill in `apps/location-alarm/privacy.html` against what the shipped build
actually does - permissions from the manifest, whether ads are on, what is stored.
Then set `privacy: true` for the product in `catalog.js`, which links it from the
product's pages. The Play listing's privacy policy URL is then
`https://nessaid-android.github.io/apps/location-alarm/privacy.html`.

### Add a product

```bash
python tools/site.py product apps new-app "New App" "One or two sentences for cards."
```

Add an entry to `products` in `catalog.js`, write the long description in the new
`index.html`, put a 512px icon at `assets/img/apps/new-app.png`, then `check` and
`sitemap`.

### Screenshots

Put them in `assets/img/<section>/<slug>/` and uncomment the Screenshots block in
the product page. Phone screenshots at their native size are fine; the strip
scrolls sideways and scales them to one height.

## Publishing checklist

- `python tools/site.py check` reports nothing.
- `python tools/site.py sitemap` after adding or removing pages.
- Previewed with `serve`, at Auto, Mobile and Desktop.
- A privacy page changed? Update its "Last updated" date.
- Commit and push to `main`. The Actions tab shows the deploy.

## Google Play and AdMob

- **Website** field on every Play listing: `https://nessaid-android.github.io`
- **Privacy policy** field: that product's `privacy.html` address.
- **`app-ads.txt`** goes at the root of this repository, beside `index.html`, once
  the new AdMob account gives a publisher ID. It holds only the line AdMob gives,
  with no comments. One file covers every app in the developer account.

## Still to decide

- **Privacy policies** exist for Battery Alarm and 2048 Puzzle only. Each other
  product needs one before it goes on Play.
- **Icons** exist for every product. Each comes from its own repo's
  `publishing/store-assets/icon-512.png` (the card games' from
  `phonenet/games/<game>/publishing/`, drawn by `games/tools/card_icons.py`); copy
  it here when it changes.
- **Rummy Express, Teen Patti Express and Twenty Eight Express** have package names under
  `io.github.saithalavi`. A package name cannot change once published, so decide
  before their first release whether they should move under `com.nessaid`.
