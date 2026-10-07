/*
  The catalog: the one place a product's name, short description, status,
  Play link, help topics and videos are written down.

  Everything that lists products reads this - the home page, /apps/, /cards/,
  /games/, the footer, the help centre and each product page's header and side
  panel.
  Change a name or a status here and every page agrees.

  What is NOT here: a product's long description, features and screenshots.
  Those are static HTML in /<section>/<slug>/index.html, so they read without
  JavaScript and search engines index them.

  Fields
    slug      folder name under /apps/, /cards/ or /games/. Never change it once
              a Play listing or a link points at it.
    section   'apps', 'cards' (the card-table games) or 'games' (everything
              else: puzzles, arcade and the rest). The section is the URL, so
              moving a product between them moves its pages too.
    name      display name
    tagline   one line under the name on the product page
    short     one or two sentences, for cards
    icon      '/assets/img/<section>/<slug>.png', or null for generated initials
    status    'available' | 'coming-soon' | 'in-development'
    play      Android package name once it is on Google Play, else null.
              The Play button appears only when this is set.
    privacy   true when /<section>/<slug>/privacy.html exists
    together  true for the games friends play on nearby phones with no internet;
              these are what /play-together/ lists. Every card game is one, and
              so is Blank Atlas, which is not a card game
    tags      a few words for the cards
    facts     [label, value] pairs for the Details panel
    help      [{ slug, title, summary }] - each is /<section>/<slug>/help/<topic slug>.html
    videos    [{ youtube: 'VIDEO_ID', title, summary, short }] - short: true for
              a vertical YouTube Short

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
    { label: 'Card games', href: '/cards/' },
    { label: 'Games', href: '/games/' },
    { label: 'Play together', href: '/play-together/' },
    { label: 'Help', href: '/help/' }
  ],

  // The order here is the order the footer and the help centre use.
  sections: {
    apps: { title: 'Apps' },
    cards: { title: 'Card games' },
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
      icon: '/assets/img/apps/alarm-clock.png',
      status: 'in-development',
      play: null,
      privacy: true,
      tags: ['Alarms', 'Timers'],
      facts: [['Requires', 'Android 8.0 or later'], ['Languages', '26']],
      help: [],
      videos: [
        { youtube: 'Iz8Y4YYSXMU', short: true, title: 'What it does',
          summary: 'Alarms and when each rings next, one alarm\'s own settings and repeat rule, timers and stopwatches, and an alarm ringing over the lock screen.' }
      ]
    },
    {
      slug: 'location-alarm',
      section: 'apps',
      name: 'Location Alarm',
      tagline: 'Wake up at your stop, not three stops later.',
      short: 'Rings when you arrive at or leave a place you pick on the map, with a GPS panel and a track recorder.',
      icon: '/assets/img/apps/location-alarm.png',
      status: 'available',
      play: 'com.nessaid.locationalarm',
      privacy: true,
      tags: ['Location', 'Travel'],
      facts: [['Requires', 'Android 8.0 or later'], ['Languages', '26']],
      help: [],
      videos: [
        { youtube: '5we4YotS2sE', short: true, title: 'What it does',
          summary: 'Choosing a place on the map and setting how close counts as arriving, watching with the distance counting down, and the alarm taking over the lock screen on arrival.' }
      ]
    },
    {
      slug: 'calculator',
      section: 'apps',
      name: 'Nessaid Calculator',
      tagline: 'A calculator that looks and works like the real thing.',
      short: 'Basic, scientific, programmer and statistics modes on an LCD-style display, with unit, finance and currency tools.',
      icon: '/assets/img/apps/calculator.png',
      status: 'available',
      play: 'com.nessaid.calculator',
      privacy: true,
      tags: ['Maths', 'Finance'],
      facts: [['Requires', 'Android 8.0 or later'], ['Languages', '26']],
      help: [],
      videos: [
        { youtube: 'wZpLR8kllew', short: true, title: 'Nessaid Calculator',
          summary: 'Four calculators, converters and finance, on a display built like the real thing.' }
      ]
    },

    // ------------------------------------------------------------ cards
    // Card-table games, all built on the shared card table, all played on
    // nearby phones with no internet. See /play-together/.
    {
      slug: 'rummy',
      section: 'cards',
      name: 'Rummy Express',
      tagline: 'Indian 13-card rummy for the journey. No internet needed.',
      short: 'Indian 13-card rummy for two to six friends on their own phones, on a train, a bus or in the same room. No internet, no sign-in.',
      icon: '/assets/img/cards/rummy.png',
      status: 'in-development',
      play: null,
      privacy: false,
      together: true,
      tags: ['Cards', 'Bluetooth', 'No internet', 'Play nearby'],
      facts: [['Players', '2 to 6, bots fill the rest', ['Languages', '13']], ['Internet', 'Not needed'], ['Connects over', 'Bluetooth, Wi-Fi or Nearby'], ['Real money', 'None'], ['Requires', 'Android 7.0 or later']],
      help: [],
      videos: []
    },
    {
      slug: 'teen-patti',
      section: 'cards',
      name: 'Teen Patti Express',
      tagline: 'Three cards, blind or seen, all the way to your stop.',
      short: 'Classic three-card Teen Patti for two to six nearby phones, with no internet and chips that are only ever part of the game.',
      icon: '/assets/img/cards/teen-patti.png',
      status: 'in-development',
      play: null,
      privacy: false,
      together: true,
      tags: ['Cards', 'Bluetooth', 'No internet', 'Play nearby'],
      facts: [['Players', '2 to 6, bots fill the rest', ['Languages', '13']], ['Internet', 'Not needed'], ['Connects over', 'Bluetooth, Wi-Fi or Nearby'], ['Real money', 'None'], ['Requires', 'Android 7.0 or later']],
      help: [],
      videos: []
    },
    {
      slug: 'twenty-eight',
      section: 'cards',
      name: 'Twenty Eight Express',
      tagline: 'The trick-taking game of Kerala, for the whole compartment.',
      short: 'Twenty-eight for four players in two pairs or six in two teams, on nearby phones with no internet, and bots for any empty seat.',
      icon: '/assets/img/cards/twenty-eight.png',
      status: 'in-development',
      play: null,
      privacy: false,
      together: true,
      tags: ['Cards', 'Bluetooth', 'No internet', 'Play nearby'],
      facts: [['Players', '4 or 6, bots fill the rest', ['Languages', '6']], ['Internet', 'Not needed'], ['Connects over', 'Bluetooth or Wi-Fi'], ['Real money', 'None'], ['Requires', 'Android 7.0 or later']],
      help: [],
      videos: []
    },
    {
      slug: 'callbreak',
      section: 'cards',
      name: 'Call Break Express',
      tagline: 'Spades are trumps. Call your tricks and live with it.',
      short: 'Call Break for four players, each for themselves, on nearby phones: spades are always trumps, everybody calls the tricks they will take, and a call missed costs.',
      icon: '/assets/img/cards/callbreak.png',
      status: 'in-development',
      play: null,
      privacy: false,
      together: true,
      tags: ['Cards', 'Bluetooth', 'No internet', 'Play nearby'],
      facts: [['Players', '4, bots fill the rest', ['Languages', '13']], ['Internet', 'Not needed'], ['Connects over', 'Bluetooth, Wi-Fi or Nearby'], ['Real money', 'None'], ['Requires', 'Android 7.0 or later']],
      help: [],
      videos: []
    },
    {
      slug: 'poker',
      section: 'cards',
      name: 'Poker Express',
      tagline: 'No-limit hold’em for the table you are already sitting at.',
      short: 'No-limit Texas hold’em for two to eight nearby phones: blinds, four rounds of betting and a showdown, with chips that are only ever part of the game.',
      icon: '/assets/img/cards/poker.png',
      status: 'in-development',
      play: null,
      privacy: false,
      together: true,
      tags: ['Cards', 'Bluetooth', 'No internet', 'Play nearby'],
      facts: [['Players', '2 to 8, bots fill the rest', ['Languages', '33']], ['Internet', 'Not needed'], ['Connects over', 'Bluetooth, Wi-Fi or Nearby'], ['Real money', 'None'], ['Requires', 'Android 7.0 or later']],
      help: [],
      videos: []
    },
    {
      slug: 'bridge',
      section: 'cards',
      name: 'Bridge Express',
      tagline: 'Contract bridge for four phones, in two pairs.',
      short: 'Contract bridge for four players in two pairs on their own phones: an auction for the contract, dummy face up, and scoring deal by deal, the Chicago way.',
      icon: '/assets/img/cards/bridge.png',
      status: 'in-development',
      play: null,
      privacy: false,
      together: true,
      tags: ['Cards', 'Bluetooth', 'No internet', 'Play nearby'],
      facts: [['Players', '4 in two pairs, bots fill the rest', ['Languages', '33']], ['Internet', 'Not needed'], ['Connects over', 'Bluetooth, Wi-Fi or Nearby'], ['Real money', 'None'], ['Requires', 'Android 7.0 or later']],
      help: [],
      videos: []
    },

    // ------------------------------------------------------------ games
    // Puzzles, arcade games and everything not played with a pack of cards.
    // Blank Atlas is here and is also a 'together' game.
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
      facts: [['Requires', 'Android 8.0 or later'], ['Languages', '26'], ['Price', 'Free, contains ads']],
      help: [],
      videos: []
    },
    {
      slug: 'brick-game',
      section: 'games',
      name: 'Nessaid Brick Game',
      tagline: 'The 9999-in-1 handheld, button for button.',
      short: 'The brick handheld rebuilt as an app: a cell-matrix LCD, the buttons around it, and sixteen games, from Tetris and Snake to Race, Tank and Breaker.',
      icon: '/assets/img/games/brick-game.png',
      status: 'in-development',
      play: null,
      privacy: false,
      tags: ['Arcade', 'Retro', 'Single player'],
      facts: [['Games', '16'], ['Screen', '10x14 up to 14x28 cells'], ['Requires', 'Android 8.0 or later'], ['Languages', '26']],
      help: [],
      videos: []
    },
    {
      slug: 'archery',
      section: 'games',
      name: 'Archery',
      tagline: 'Read the flags. Hold for the drop. Loose.',
      short: 'A target down the range, a flag at each end showing the wind, and an arrow that gravity pulls down while the wind pushes it sideways. Six ends of three arrows, and four bows.',
      icon: '/assets/img/games/archery.png',
      status: 'in-development',
      play: null,
      privacy: false,
      tags: ['Sports', 'Single player'],
      facts: [['A game', 'Six ends of three arrows'], ['Bows', 'Crude, professional, recurve, compound'], ['Ranges', '18 m to 70 m, on the real face for each'], ['Requires', 'Android 8.0 or later'], ['Languages', '26']],
      help: [],
      videos: []
    },
    {
      slug: 'nest-hoppers',
      section: 'games',
      name: 'Nest Hoppers',
      tagline: 'Up the tree, basket by basket.',
      short: 'A tree, baskets hung a row apart, and an egg - or a duckling - that hops straight up from one to the next while they slide underneath. Twelve of them, ten points a basket.',
      icon: '/assets/img/games/nest-hoppers.png',
      status: 'in-development',
      play: null,
      privacy: true,
      tags: ['Arcade', 'Single player'],
      facts: [['Modes', 'Classic, Random Jungle, Arcade'], ['Climbers', 'A dozen, egg or duckling'], ['Requires', 'Android 8.0 or later'], ['Languages', '26']],
      help: [],
      videos: [
        { youtube: 'BGHdBRZK9lU', short: true, title: 'Hop an egg or a duckling up the tree',
          summary: 'Eight hops, one miss: tap to send the climber straight up as the baskets slide underneath.' }
      ]
    },
    {
      slug: 'bb-roll',
      section: 'games',
      name: 'BB Roll',
      tagline: 'Tilt the phone. Roll the bearings home.',
      short: 'The dexterity puzzle from the back of a drawer, rebuilt as real rolling physics: steel, nylon, plastic or wooden balls on a tilting dial.',
      icon: '/assets/img/games/bb-roll.png',
      status: 'coming-soon',
      play: null,
      privacy: true,
      tags: ['Puzzle', 'Single player'],
      facts: [['Requires', 'Android 8.0 or later'], ['Languages', '26'], ['Price', 'Free, contains ads']],
      help: [],
      videos: [
        { youtube: 'pAgDMfkE7fw', short: true, title: 'How to play', summary: 'Tilting, the levels, the materials, and getting every ball home.' },
        { youtube: 'sMji9NY-gN4', short: true, title: 'A whole game, start to finish', summary: 'Medium solved on a real phone, then a go at Impossible.' }
      ]
    },
    {
      slug: 'marble-solitaire',
      section: 'games',
      name: 'Marble Solitaire',
      tagline: 'Jump to take. End with one.',
      short: 'The old wooden board: a cross of holes, a glass marble in each but one. Jump to take, and finish with a single marble. Five boards, undo, redo and a hint.',
      icon: '/assets/img/games/marble-solitaire.png',
      status: 'in-development',
      play: null,
      privacy: false,
      tags: ['Puzzle', 'Single player'],
      facts: [['Boards', '5, each keeping its own game'], ['Requires', 'Android 8.0 or later'], ['Languages', '26']],
      help: [],
      videos: []
    },
    {
      slug: 'bowling',
      section: 'games',
      name: 'Nessaid Bowling',
      tagline: 'One swipe is the throw.',
      short: 'Ten pins at the end of a maple lane, and one swipe for the whole throw: where it starts, where it goes, how hard, and how it hooks. Alone, against bots, or at a table of nearby phones with no internet.',
      icon: '/assets/img/games/bowling.png',
      status: 'in-development',
      play: null,
      privacy: false,
      together: true,
      tags: ['Sports', 'Play nearby', 'No internet'],
      facts: [['Players', '1 to 4, or a table of nearby phones'], ['Frames', '10, scored the real way'], ['Views', "The bowler's, or from above"], ['Practice', 'A lane whose grip and length you set'], ['Requires', 'Android 8.0 or later'], ['Languages', '33']],
      help: [],
      videos: []
    },
    {
      slug: 'blank-atlas',
      section: 'games',
      name: 'Blank Atlas',
      tagline: 'Every name rubbed off the map. Find the place.',
      short: 'A map with no labels: find the country, find the capital, drop a pin as close as you can. Alone, or at a table of nearby phones with no internet.',
      icon: '/assets/img/games/blank-atlas.png',
      status: 'in-development',
      play: null,
      privacy: false,
      together: true,
      tags: ['Geography', 'Play nearby', 'No internet'],
      facts: [['Players', '1, or a table of nearby phones'], ['The atlas', '198 countries and 195 capitals'], ['Maps', 'Simple, OpenStreetMap or Google'], ['Internet', 'Not needed on the Simple map'], ['Requires', 'Android 8.0 or later'], ['Languages', '26']],
      help: [],
      videos: []
    }
  ]
};
