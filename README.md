# Nessaid Android Studio website

The site for the developer account's apps and games, published by GitHub Pages at
**https://nessaid-android.github.io**.

Plain HTML, one stylesheet and three scripts. There is no build step: what is
committed to `main` is what is served, a minute or two after the push.

## Layout of the repository

```
index.html                  home: hero, then a row of cards per section
apps/index.html             all apps
cards/index.html            all card games
games/index.html            all other games: puzzles, arcade and the rest
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

## The three sections

A product's `section` in `catalog.js` is the first part of its URL and the
folder its pages live in. There are three:

| Section | URL | What goes in it |
|---|---|---|
| `apps` | `/apps/` | Tools: alarms, the calculator |
| `cards` | `/cards/` | The card-table games, all built on PhoneNet's shared card table |
| `games` | `/games/` | Everything else: puzzles, arcade games, Blank Atlas |

The header, the footer and the help centre are all driven by `sections` in
`catalog.js`, in the order it lists them, so a fourth section would be one entry
there plus a `<section>/index.html` and a line in `SECTIONS` in `tools/site.py`.

**`together` is not a section.** It marks the games played on nearby phones with
no internet, which `/play-together/` lists: every card game, and Blank Atlas,
which is in `games`.

Current slugs:

- `apps/battery-alarm`, `apps/alarm-clock`, `apps/location-alarm`, `apps/calculator`
- `cards/rummy`, `cards/teen-patti`, `cards/twenty-eight`, `cards/callbreak`, `cards/poker`, `cards/bridge`,
  `cards/gin-rummy`, `cards/spades`, `cards/euchre`, `cards/29`, `cards/big-two`, `cards/dou-dizhu`,
  `cards/canasta`, `cards/durak`, `cards/truco`, `cards/tien-len`
- `games/2048-puzzle`, `games/brick-game`, `games/archery`, `games/nest-hoppers`, `games/bb-roll`, `games/marble-solitaire`, `games/blank-atlas`

**A slug is part of a URL that Play listings and people link to, so never rename
one** once it is published. The same goes for moving a product between sections:
the card games moved from `/games/<slug>/` to `/cards/<slug>/` while none of them
was on Play, which is the only time it is free.

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

For a YouTube Short (youtube.com/shorts/ID), add `short: true` so it plays in a
vertical frame.

It appears on the product's Videos page. To put a video inside a help topic or on
the product page instead, add:

```html
<div class="yt" data-yt="dQw4w9WgXcQ" data-title="Set an alarm in 60 seconds"></div>
```

(`class="yt short"` for a Short.)

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

The first argument is the section: `apps`, `cards` or `games`.

Add an entry to `products` in `catalog.js`, write the long description in the new
`index.html`, put a 512px icon at `assets/img/apps/new-app.png`, then `check` and
`sitemap`.

### Running ads

A dialog - a picture, a title, a description, OK, Cancel and a "Don't show
these again" tick - put up inside the apps, with no release of any of them. Two files
each:

| File | Who reads it |
|---|---|
| its entry in `tools/running_ads.json`, published in `published.json` | every app, once a day: enough to know it is not for it |
| `assets/data/running_ads/<id>.json`, and its picture beside it | the apps it is for, ahead of the moment |

```bash
python tools/site.py runningad christmas-2026 greeting   # starts the second file
# fill it in; put the picture beside it; add the entry to tools/running_ads.json
python tools/site.py published                           # checks both, writes published.json
```

The entry:

```json
[
  { "id": "cards-on-battery-alarm", "from": "2026-12-01", "to": "2026-12-31", "region": "all",
    "receiver": "battery-alarm", "type": "app", "apps": "cards", "when": "on_interstitial" },
  { "id": "christmas-2026", "from": "2026-12-24", "to": "2026-12-26", "region": "all",
    "receiver": "all", "type": "greeting", "when": "on_start" }
]
```

| Key | |
|---|---|
| `id` | lowercase letters, digits, hyphens; the content's file name. **A new campaign is a new id**: a phone counts by id what it has been shown |
| `from`, `to` | first and last day, by each phone's own date. Both are needed |
| `region` | `all`, or countries: `"IN,AE"`, `"all,!US"`. A phone that gives no country gets only `all` |
| `receiver` | the apps it is shown **in**: `all`, `games` (card games too), `cards`, `utilities`, slugs, packages; `!` takes away, `"games,!bowling"` |
| `type` | what kind of ad. `app` advertises `apps`; `greeting`, `notification` and `tip` are messages, and say what their content says |
| `apps` | type `app` alone: **whose** ads, written as `receiver` is. Each showing is about one of them that is on Play and not on the phone; with none, it is not shown |
| `when` | `on_start` (as the app is opened; the default), `on_interstitial` (in the place of a full-screen ad), or both with a comma |
| `priority` | optional, 0: the higher is tried first when two are due |

The content, every key optional but `id` (a message needs `texts`):

| Key | |
|---|---|
| `texts` | language to `title`, `description`, `ok`, `cancel` - and `never`, and a `picture` of its own. A language not there gets its base (`pt` for `pt-BR`), else English; a message with neither is not shown there |
| `picture` | a `.png`, `.webp` or `.jpg` beside the file, at most 1 MB, wider than tall. **A new picture is a new name**: phones keep the one they have |
| `operation` | what OK does: `{"type": "none"}`, `{"type": "play", "package": "..."}`, `{"type": "open", "package": "..."}` (the app if it is there, else its listing), `{"type": "url", "url": "https://..."}`. With no package it is the advertised app, or in a message the app showing it, also written `"host"` |
| `rate` | over the default, key by key; below |
| `color` | `#RRGGBB`, the OK button |
| `apps` | type `app`: slug to a `picture`, `texts`, `operation` and `color` of that app's own |

**A type `app` needs no words.** What it leaves out is the app's own, in all 26
languages: its name, line and description, its icon, "Get it on Google Play".
In what it does say, `{app}`, `{line}` and `{description}` stand for those.

**How often** is `running_ads_rate` in `tools/house_settings.json` for every
ad, and `rate` in an ad's content for that one, key by key:

| Key | | Built in |
|---|---|---|
| `after_days` | days after the app was installed, 0..90 | 2 |
| `per_day` | most showings of the ad in a day, 1..10 | 1 |
| `every_hours` | least hours from one showing of it to the next, 1..1440 | 72 |
| `times` | most showings of it in all, 0..100; 0 is no limit | 0 |
| `gap_hours` | least hours from any other running ad, 0..720 | 4 |

Each is counted by one app on one phone: the apps share nothing, so a greeting
to `all` is shown by every one of them a phone has.

What the buttons do: OK does the operation, if there is one, and closes; Cancel
closes. Either way the ad is shown again at its next slot, as its rate allows.
"Don't show these again", ticked, counts whichever of them it is left by: that
app shows no ad of that **type** again, newer ones included, and goes on with
the other types, the network's ads and the house ads. To take one back, remove its entry and
publish: the apps hear within a day.

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
- **`app-ads.txt`** is at the root, beside `index.html`, and lists the new AdMob
  account, `pub-5158357676798815`. It holds only the lines AdMob gives, with no
  comments, and one file covers every app whose Play listing names this site.
  **If Battery Alarm or 2048 Puzzle point their listing here before they move to
  the new AdMob account**, add the old account's line too, or their ads lose
  verification: `google.com, pub-3432813586143969, DIRECT, f08c47fec0942fa0`.

## Still to decide

- **Privacy policies** exist for Battery Alarm, Alarm Clock Ultimate, Location
  Alarm, Nessaid Calculator, 2048 Puzzle, Nessaid Brick Game, Archery, Nest
  Hoppers, BB Roll and Nessaid Bowling only.
  Each other product needs one before it goes on Play.
- **Icons** come from each product's own repo, at
  `publishing/store-assets/icon-512.png` (the card games' from
  `phonenet/games/<game>/publishing/`, drawn by `games/tools/card_icons.py`); copy
  it here when it changes. A product with no store icon yet has `icon: null` in
  `catalog.js`, and `site.js` draws its initials on the brand gradient instead.
- **The old `/games/<slug>/` addresses of Rummy, Teen Patti and Twenty Eight**
  now 404. None of the three was on Play, so no listing broke, but the three
  pages may be in Google's index; if that matters, add a one-line meta-refresh
  `index.html` at each old path. Note that `tools/site.py check` would then
  report those folders as not being in `catalog.js`.
