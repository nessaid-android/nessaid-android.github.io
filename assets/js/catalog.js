/*
  The catalog: the one place a product's name, short description, status,
  Play link, help topics and videos are written down.

  Everything that lists products reads this - the home page, /apps/, /games/,
  the footer, the help centre and each product page's header and side panel.
  Change a name or a status here and every page agrees.

  What is NOT here: a product's long description, features and screenshots.
  Those are static HTML in /<section>/<slug>/index.html, so they read without
  JavaScript and search engines index them.

  Fields
    slug      folder name under /apps/ or /games/. Never change it once a Play
              listing or a link points at it.
    section   'apps' or 'games'
    name      display name
    tagline   one line under the name on the product page
    short     one or two sentences, for cards
    icon      '/assets/img/<section>/<slug>.png', or null for generated initials
    status    'available' | 'coming-soon' | 'in-development'
    play      Android package name once it is on Google Play, else null.
              The Play button appears only when this is set.
    privacy   true when /<section>/<slug>/privacy.html exists
    tags      a few words for the cards
    facts     [label, value] pairs for the Details panel
    help      [{ slug, title, summary }] - each is /<section>/<slug>/help/<topic slug>.html
    videos    [{ youtube: 'VIDEO_ID', title, summary }]

  Adding a help topic or a video is one entry here plus, for a topic, one
  page made from /templates/help-topic.html. See README.md.
*/
window.NAS_CATALOG = {
  studio: {
    name: 'Nessaid Android Studio',
    tagline: 'Useful Android apps and card-table games that get the details right.',
    // Published on every privacy policy and the website privacy page. The
    // policy pages also carry it in their static HTML, so it reads without
    // JavaScript; change it here AND in those pages (see README.md).
    contactEmail: 'nessaid.android@gmail.com'
  },

  nav: [
    { label: 'Home', href: '/' },
    { label: 'Apps', href: '/apps/' },
    { label: 'Games', href: '/games/' },
    { label: 'Help', href: '/help/' }
  ],

  sections: {
    apps: { title: 'Apps' },
    games: { title: 'Games' }
  },

  products: [
    // ------------------------------------------------------------- apps
    {
      slug: 'battery-alarm',
      section: 'apps',
      name: 'Battery Alarm',
      tagline: 'An alarm for your battery, at the levels you choose.',
      short: 'Sounds an alarm when your battery drops below, rises above or leaves a range you set, with sound, speech and vibration.',
      icon: '/assets/img/apps/battery-alarm.png',
      status: 'available',
      play: 'com.nessaid.nessbatalarm',
      privacy: true,
      tags: ['Battery', 'Alerts'],
      facts: [['Requires', 'Android 8.0 or later'], ['Languages', '26'], ['Price', 'Free, contains ads']],
      help: [],
      videos: []
    },
    {
      slug: 'alarm-clock',
      section: 'apps',
      name: 'Alarm Clock Ultimate',
      tagline: 'Alarms, timers and stopwatches that ring when they should.',
      short: 'An alarm clock with real repeat schedules, per-alarm sound and snooze settings, dismissal challenges, timers and stopwatches.',
      icon: null,
      status: 'in-development',
      play: null,
      privacy: false,
      tags: ['Alarms', 'Timers'],
      facts: [['Requires', 'Android 8.0 or later'], ['Languages', '26']],
      help: [],
      videos: []
    },
    {
      slug: 'location-alarm',
      section: 'apps',
      name: 'Location Alarm',
      tagline: 'Wake up at your stop, not three stops later.',
      short: 'Rings when you arrive at or leave a place you pick on the map, with a GPS panel and a track recorder.',
      icon: null,
      status: 'in-development',
      play: null,
      privacy: false,
      tags: ['Location', 'Travel'],
      facts: [['Requires', 'Android 8.0 or later'], ['Languages', '26']],
      help: [],
      videos: []
    },
    {
      slug: 'calculator',
      section: 'apps',
      name: 'Nessaid Calculator',
      tagline: 'A calculator that looks and works like the real thing.',
      short: 'Basic, scientific, programmer and statistics modes on an LCD-style display, with unit, finance and currency tools.',
      icon: null,
      status: 'in-development',
      play: null,
      privacy: false,
      tags: ['Maths', 'Finance'],
      facts: [['Requires', 'Android 8.0 or later'], ['Languages', '13']],
      help: [],
      videos: []
    },

    // ------------------------------------------------------------ games
    {
      slug: '2048-puzzle',
      section: 'games',
      name: '2048 Puzzle',
      tagline: 'The sliding-tile classic, played to the target you pick.',
      short: 'Slide and merge tiles to reach 2048 - or any target from 128 to 16384 - with undo and twelve colour themes.',
      icon: '/assets/img/games/2048-puzzle.png',
      status: 'available',
      play: 'com.nessaid.puzzle2048',
      privacy: true,
      tags: ['Puzzle', 'Single player'],
      facts: [['Requires', 'Android 8.0 or later'], ['Languages', '9'], ['Price', 'Free, contains ads']],
      help: [],
      videos: []
    },
    {
      slug: 'rummy',
      section: 'games',
      name: 'Rummy',
      tagline: 'Indian 13-card rummy around one table of phones.',
      short: 'Indian 13-card rummy for two to six players on phones in the same room, with bots to fill empty seats.',
      icon: null,
      status: 'in-development',
      play: null,
      privacy: false,
      tags: ['Cards', 'Local multiplayer'],
      facts: [['Requires', 'Android 7.0 or later'], ['Players', '2 to 6'], ['Real money', 'None']],
      help: [],
      videos: []
    },
    {
      slug: 'teen-patti',
      section: 'games',
      name: 'Teen Patti',
      tagline: 'Three cards, blind or seen, on phones around the room.',
      short: 'Classic three-card Teen Patti for two to six nearby phones, played for chips that are only ever part of the game.',
      icon: null,
      status: 'in-development',
      play: null,
      privacy: false,
      tags: ['Cards', 'Local multiplayer'],
      facts: [['Requires', 'Android 7.0 or later'], ['Players', '2 to 6'], ['Real money', 'None']],
      help: [],
      videos: []
    },
    {
      slug: 'twenty-eight',
      section: 'games',
      name: 'Twenty Eight',
      tagline: 'The trick-taking game of Kerala, bid, trump and all.',
      short: 'Twenty-eight for four players in two pairs or six in two threes, on nearby phones, with bots to fill empty seats.',
      icon: null,
      status: 'in-development',
      play: null,
      privacy: false,
      tags: ['Cards', 'Local multiplayer'],
      facts: [['Requires', 'Android 7.0 or later'], ['Players', '4 or 6'], ['Real money', 'None']],
      help: [],
      videos: []
    }
  ]
};
