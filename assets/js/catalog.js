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
      status: 'available',
      play: 'com.nessaid.alarmclockultimate',
      privacy: true,
      tags: ['Alarms', 'Timers'],
      facts: [['Requires', 'Android 8.0 or later'], ['Languages', '26'], ['Price', 'Free, contains ads']],
      help: [],
      videos: [
        { youtube: 'cAR1LPF74M4', short: true, title: 'What it does',
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
      status: 'available',
      play: 'com.nessaid.expressrummy',
      privacy: true,
      together: true,
      tags: ['Cards', 'Bluetooth', 'No internet', 'Play nearby'],
      facts: [['Players', '2 to 6, bots fill the rest'], ['Languages', '13'], ['Internet', 'Not needed'], ['Connects over', 'Bluetooth, Wi-Fi or Nearby'], ['Real money', 'None'], ['Requires', 'Android 8.0 or later']],
      help: [
        { slug: 'rules', title: 'The rules of Rummy', summary: 'Thirteen cards each, from one deck or two.' },
        { slug: 'host-a-table', title: 'Host a table', summary: 'One phone hosts the table: it deals, and the others join it.' },
        { slug: 'join-a-table', title: 'Join a table', summary: 'Tap Join a table and choose the same way the host chose.' },
        { slug: 'ways-to-connect', title: 'Ways to connect', summary: 'Wi-Fi: every phone on the same Wi-Fi network.' },
        { slug: 'bots', title: 'Bots', summary: 'A bot is a player with no phone: the host\'s phone plays for it.' },
        { slug: 'lost-touch', title: 'When a phone loses touch', summary: 'If a phone drops out, the table waits for it, and the host decides: wait for that player, or drop them and play on.' },
        { slug: 'share-a-win', title: 'Sharing a win', summary: 'When you win a game, Share makes an "I won!" card with the final table, and Android\'s share sheet sends it wherever you choose.' }
      ],
      videos: [
        { youtube: 'OSVAL6mhybw', short: true, src: '/cards/rummy/videos/files/promo-1.0.0.mp4',
          title: 'Rummy Express',
          summary: 'Indian thirteen-card rummy for the phones in the room, no internet: one hosts, the others join, and bots fill a short table.' },
        { youtube: 'K6upH6t666Y', short: true, src: '/cards/rummy/videos/files/explain-hosting.mp4',
          title: 'How to host a table',
          summary: 'Choose how the phones reach each other, read the code out, seat bots if you are short of players, and start.' },
        { youtube: 'i74t194TToU', src: '/cards/rummy/videos/files/explain-bluetooth.mp4',
          title: 'Two phones over Bluetooth, no network at all',
          summary: 'Two phones never paired, with Wi-Fi and mobile data off: one hosts and reads its code out, the other types it and sits down.' },
        { youtube: 'Z3yDAIZIJzY', short: true, src: '/cards/rummy/videos/files/explain-rummy.mp4',
          title: 'How to play Indian Rummy',
          summary: 'Draw, then throw a card. Go out with every card in sets and sequences, two sequences at least and one of them without a joker.' }
      ]
    },
    {
      slug: 'teen-patti',
      section: 'cards',
      name: 'Teen Patti Express',
      tagline: 'Three cards, blind or seen, all the way to your stop.',
      short: 'Classic three-card Teen Patti for two to six nearby phones, with no internet and chips that are only ever part of the game.',
      icon: '/assets/img/cards/teen-patti.png',
      status: 'available',
      play: 'com.nessaid.expressteenpatti',
      privacy: true,
      together: true,
      tags: ['Cards', 'Bluetooth', 'No internet', 'Play nearby'],
      facts: [['Players', '2 to 6, bots fill the rest'], ['Languages', '13'], ['Internet', 'Not needed'], ['Connects over', 'Bluetooth, Wi-Fi or Nearby'], ['Real money', 'None'], ['Requires', 'Android 8.0 or later']],
      help: [
        { slug: 'rules', title: 'The rules of Teen Patti', summary: 'Three cards each, and everybody\'s boot in the pot.' },
        { slug: 'host-a-table', title: 'Host a table', summary: 'One phone hosts the table: it deals, and the others join it.' },
        { slug: 'join-a-table', title: 'Join a table', summary: 'Tap Join a table and choose the same way the host chose.' },
        { slug: 'ways-to-connect', title: 'Ways to connect', summary: 'Wi-Fi: every phone on the same Wi-Fi network.' },
        { slug: 'bots', title: 'Bots', summary: 'A bot is a player with no phone: the host\'s phone plays for it.' },
        { slug: 'lost-touch', title: 'When a phone loses touch', summary: 'If a phone drops out, the table waits for it, and the host decides: wait for that player, or drop them and play on.' },
        { slug: 'share-a-win', title: 'Sharing a win', summary: 'When you win a game, Share makes an "I won!" card with the final table, and Android\'s share sheet sends it wherever you choose.' }
      ],
      videos: [
        { youtube: 'onh0UFRbDgI', short: true, src: '/cards/teen-patti/videos/files/promo-1.0.0.mp4',
          title: 'Teen Patti Express',
          summary: 'Three-card teen patti for the phones in the room, no internet: one hosts, the others join, and bots fill a short table.' },
        { youtube: '3tEqVAYzPTc', short: true, src: '/cards/teen-patti/videos/files/explain-hosting.mp4',
          title: 'How to host a table',
          summary: 'Choose how the phones reach each other, read the code out, seat bots if you are short of players, and start.' },
        { youtube: 'p_aMVj7YijE', src: '/cards/teen-patti/videos/files/explain-bluetooth.mp4',
          title: 'Two phones over Bluetooth, no network at all',
          summary: 'Two phones never paired, with Wi-Fi and mobile data off: one hosts and reads its code out, the other types it and sits down.' },
        { youtube: 'XQNGWEotwc0', short: true, src: '/cards/teen-patti/videos/files/explain-teenpatti.mp4',
          title: 'How to play Teen Patti',
          summary: 'Bet blind at the stake, or look and bet twice it. Pack to fold; when two are left, ask for a show and the better hand takes the pot.' }
      ]
    },
    {
      slug: 'twenty-eight',
      section: 'cards',
      name: 'Twenty Eight Express',
      tagline: 'The trick-taking game of Kerala, for the whole compartment.',
      short: 'Twenty-eight for four players in two pairs or six in two teams, on nearby phones with no internet, and bots for any empty seat.',
      icon: '/assets/img/cards/twenty-eight.png',
      status: 'available',
      play: 'com.nessaid.express28',
      privacy: true,
      together: true,
      tags: ['Cards', 'Bluetooth', 'No internet', 'Play nearby'],
      facts: [['Players', '4 or 6, bots fill the rest'], ['Languages', '6'], ['Internet', 'Not needed'], ['Connects over', 'Bluetooth or Wi-Fi'], ['Real money', 'None'], ['Requires', 'Android 8.0 or later']],
      help: [
        { slug: 'rules', title: 'The rules of Twenty Eight', summary: 'Four players in two pairs, partners sitting alternately; with six, two threes.' },
        { slug: 'host-a-table', title: 'Host a table', summary: 'One phone hosts the table: it deals, and the others join it.' },
        { slug: 'join-a-table', title: 'Join a table', summary: 'Tap Join a table and choose the same way the host chose.' },
        { slug: 'ways-to-connect', title: 'Ways to connect', summary: 'Wi-Fi: every phone on the same Wi-Fi network.' },
        { slug: 'bots', title: 'Bots', summary: 'A bot is a player with no phone: the host\'s phone plays for it.' },
        { slug: 'lost-touch', title: 'When a phone loses touch', summary: 'If a phone drops out, the table waits for it, and the host decides: wait for that player, or drop them and play on.' },
        { slug: 'share-a-win', title: 'Sharing a win', summary: 'When you win a game, Share makes an "I won!" card with the final table, and Android\'s share sheet sends it wherever you choose.' }
      ],
      videos: [
        { youtube: 'xBU-h9dhjog', short: true, src: '/cards/twenty-eight/videos/files/promo-1.0.0.mp4',
          title: 'Twenty Eight Express',
          summary: 'The trick-taking game of Kerala for the phones in the room, no internet: one hosts, the others join, and bots fill a short table.' },
        { youtube: 'DB-NgvpSv9k', short: true, src: '/cards/twenty-eight/videos/files/explain-hosting.mp4',
          title: 'How to host a table',
          summary: 'Choose how the phones reach each other, read the code out, seat bots if you are short of players, and start.' },
        { youtube: '_Rk6G9l5azM', src: '/cards/twenty-eight/videos/files/explain-bluetooth.mp4',
          title: 'Two phones over Bluetooth, no network at all',
          summary: 'Two phones never paired, with Wi-Fi and mobile data off: one hosts and reads its code out, the other types it and sits down.' },
        { youtube: 'Xj6TgIF6_Ds', short: true, src: '/cards/twenty-eight/videos/files/explain-twentyeight.mp4',
          title: 'How to play Twenty Eight',
          summary: 'Bid for the trump and set it face down; follow suit, and ask for the trump when you cannot. Jacks three, nines two, aces and tens one.' }
      ]
    },
    {
      slug: 'callbreak',
      section: 'cards',
      name: 'Call Break Express',
      tagline: 'Spades are trumps. Call your tricks and live with it.',
      short: 'Call Break for four players, each for themselves, on nearby phones: spades are always trumps, everybody calls the tricks they will take, and a call missed costs.',
      icon: '/assets/img/cards/callbreak.png',
      status: 'available',
      play: 'com.nessaid.expresscallbreak',
      privacy: true,
      together: true,
      tags: ['Cards', 'Bluetooth', 'No internet', 'Play nearby'],
      facts: [['Players', '4, bots fill the rest'], ['Languages', '13'], ['Internet', 'Not needed'], ['Connects over', 'Bluetooth, Wi-Fi or Nearby'], ['Real money', 'None'], ['Requires', 'Android 8.0 or later']],
      help: [
        { slug: 'rules', title: 'The rules of Call Break', summary: 'Four players, each for themselves, with a full pack of 52: thirteen cards each, and the ace high in every suit.' },
        { slug: 'host-a-table', title: 'Host a table', summary: 'One phone hosts the table: it deals, and the others join it.' },
        { slug: 'join-a-table', title: 'Join a table', summary: 'Tap Join a table and choose the same way the host chose.' },
        { slug: 'ways-to-connect', title: 'Ways to connect', summary: 'Wi-Fi: every phone on the same Wi-Fi network.' },
        { slug: 'bots', title: 'Bots', summary: 'A bot is a player with no phone: the host\'s phone plays for it.' },
        { slug: 'lost-touch', title: 'When a phone loses touch', summary: 'If a phone drops out, the table waits for it, and the host decides: wait for that player, or drop them and play on.' },
        { slug: 'share-a-win', title: 'Sharing a win', summary: 'When you win a game, Share makes an "I won!" card with the final table, and Android\'s share sheet sends it wherever you choose.' }
      ],
      videos: [
        { youtube: '55M5iqlLC4g', short: true, src: '/cards/callbreak/videos/files/promo-1.0.0.mp4',
          title: 'Call Break Express',
          summary: 'Four phones round a table, no internet: one hosts, the others join, and spades are trumps from the first card.' },
        { youtube: 'eUg5dbcrb7U', short: true, src: '/cards/callbreak/videos/files/explain-hosting.mp4',
          title: 'How to host a table',
          summary: 'Choose how the phones reach each other, read the code out, seat bots if you are short of players, and start.' },
        { youtube: 'AwCWLPq7vqI', src: '/cards/callbreak/videos/files/explain-bluetooth.mp4',
          title: 'Two phones over Bluetooth, no network at all',
          summary: 'Two phones never paired, with Wi-Fi and mobile data off: one hosts and reads its code out, the other types it and sits down.' },
        { youtube: 'cEKKcfPnITs', short: true, src: '/cards/callbreak/videos/files/explain-callbreak.mp4',
          title: 'How to play Call Break',
          summary: 'Call the tricks you will take, then take them. Spades are always trumps; make your call and score it, fall short and lose it.' }
      ]
    },
    {
      slug: 'poker',
      section: 'cards',
      name: 'Poker Express',
      tagline: 'No-limit hold’em for the table you are already sitting at.',
      short: 'No-limit Texas hold’em for two to eight nearby phones: blinds, four rounds of betting and a showdown, with chips that are only ever part of the game.',
      icon: '/assets/img/cards/poker.png',
      status: 'available',
      play: 'com.nessaid.expresspoker',
      privacy: true,
      together: true,
      tags: ['Cards', 'Bluetooth', 'No internet', 'Play nearby'],
      facts: [['Players', '2 to 8, bots fill the rest'], ['Languages', '33'], ['Internet', 'Not needed'], ['Connects over', 'Bluetooth, Wi-Fi or Nearby'], ['Real money', 'None'], ['Requires', 'Android 8.0 or later']],
      help: [
        { slug: 'rules', title: 'The rules of Poker', summary: 'No-limit Texas hold\'em for two to eight.' },
        { slug: 'host-a-table', title: 'Host a table', summary: 'One phone hosts the table: it deals, and the others join it.' },
        { slug: 'join-a-table', title: 'Join a table', summary: 'Tap Join a table and choose the same way the host chose.' },
        { slug: 'ways-to-connect', title: 'Ways to connect', summary: 'Wi-Fi: every phone on the same Wi-Fi network.' },
        { slug: 'bots', title: 'Bots', summary: 'A bot is a player with no phone: the host\'s phone plays for it.' },
        { slug: 'lost-touch', title: 'When a phone loses touch', summary: 'If a phone drops out, the table waits for it, and the host decides: wait for that player, or drop them and play on.' },
        { slug: 'share-a-win', title: 'Sharing a win', summary: 'When you win a game, Share makes an "I won!" card with the final table, and Android\'s share sheet sends it wherever you choose.' }
      ],
      videos: [
        { youtube: 'yH1wSFznnMk', short: true, src: '/cards/poker/videos/files/promo-1.0.0.mp4',
          title: 'Poker Express',
          summary: "No-limit Texas hold'em for the phones in the room, no internet: one hosts, the others join, and bots fill a short table." },
        { youtube: 'svf1Txf8wXw', short: true, src: '/cards/poker/videos/files/explain-hosting.mp4',
          title: 'How to host a table',
          summary: 'Choose how the phones reach each other, read the code out, seat bots if you are short of players, and start.' },
        { youtube: '8QlSx_fdqUo', src: '/cards/poker/videos/files/explain-bluetooth.mp4',
          title: 'Two phones over Bluetooth, no network at all',
          summary: 'Two phones never paired, with Wi-Fi and mobile data off: one hosts and reads its code out, the other types it and sits down.' },
        { youtube: 'clWrHyDG0hE', short: true, src: '/cards/poker/videos/files/explain-poker.mp4',
          title: "How to play Texas hold'em",
          summary: 'Two cards each and five shared: fold, check, call, bet or raise in four rounds, and the best five of your seven take the pot.' }
      ]
    },
    {
      slug: 'bridge',
      section: 'cards',
      name: 'Bridge Express',
      tagline: 'Contract bridge for four phones, in two pairs.',
      short: 'Contract bridge for four players in two pairs on their own phones: an auction for the contract, dummy face up, and scoring deal by deal, the Chicago way.',
      icon: '/assets/img/cards/bridge.png',
      status: 'available',
      play: 'com.nessaid.expressbridge',
      privacy: true,
      together: true,
      tags: ['Cards', 'Bluetooth', 'No internet', 'Play nearby'],
      facts: [['Players', '4 in two pairs, bots fill the rest'], ['Languages', '33'], ['Internet', 'Not needed'], ['Connects over', 'Bluetooth, Wi-Fi or Nearby'], ['Real money', 'None'], ['Requires', 'Android 8.0 or later']],
      help: [
        { slug: 'rules', title: 'The rules of Bridge', summary: 'Four players in two pairs, partners opposite.' },
        { slug: 'host-a-table', title: 'Host a table', summary: 'One phone hosts the table: it deals, and the others join it.' },
        { slug: 'join-a-table', title: 'Join a table', summary: 'Tap Join a table and choose the same way the host chose.' },
        { slug: 'ways-to-connect', title: 'Ways to connect', summary: 'Wi-Fi: every phone on the same Wi-Fi network.' },
        { slug: 'bots', title: 'Bots', summary: 'A bot is a player with no phone: the host\'s phone plays for it.' },
        { slug: 'lost-touch', title: 'When a phone loses touch', summary: 'If a phone drops out, the table waits for it, and the host decides: wait for that player, or drop them and play on.' },
        { slug: 'share-a-win', title: 'Sharing a win', summary: 'When you win a game, Share makes an "I won!" card with the final table, and Android\'s share sheet sends it wherever you choose.' }
      ],
      videos: [
        { youtube: 'KZcX-iJQpbU', short: true, src: '/cards/bridge/videos/files/promo-1.0.0.mp4',
          title: 'Bridge Express',
          summary: 'Contract bridge for four phones in two pairs, no internet: one hosts, the others join, and bots fill a short table.' },
        { youtube: 'ZvepDxMLGYA', short: true, src: '/cards/bridge/videos/files/explain-hosting.mp4',
          title: 'How to host a table',
          summary: 'Choose how the phones reach each other, read the code out, seat bots if you are short of players, and start.' },
        { youtube: 'FS1wnZOscqc', src: '/cards/bridge/videos/files/explain-bluetooth.mp4',
          title: 'Two phones over Bluetooth, no network at all',
          summary: 'Two phones never paired, with Wi-Fi and mobile data off: one hosts and reads its code out, the other types it and sits down.' },
        { youtube: 'i9pwp1GxyBQ', short: true, src: '/cards/bridge/videos/files/explain-bridge.mp4',
          title: 'How to play contract bridge',
          summary: "Bid for the contract, lay dummy face up, and play both hands as declarer: scored deal by deal, the Chicago way." }
      ]
    },
    {
      slug: 'gin-rummy',
      section: 'cards',
      name: 'Gin Rummy Express',
      tagline: 'Gin rummy for two phones, or one against a bot.',
      short: 'Gin rummy for two players on their own phones, or one against a bot: draw, discard, knock or go gin, played to 100 with the American bonuses.',
      icon: '/assets/img/cards/gin-rummy.png',
      status: 'in-development',
      play: null,
      privacy: true,
      together: true,
      tags: ['Cards', 'Bluetooth', 'No internet', 'Play nearby'],
      facts: [['Players', '2, or 1 against a bot'], ['Languages', '33'], ['Internet', 'Not needed'], ['Connects over', 'Bluetooth, Wi-Fi or Nearby'], ['Real money', 'None'], ['Requires', 'Android 8.0 or later']],
      help: [
        { slug: 'rules', title: 'The rules of Gin Rummy', summary: 'Two players, one deck of 52, ten cards each.' },
        { slug: 'host-a-table', title: 'Host a table', summary: 'One phone hosts the table: it deals, and the others join it.' },
        { slug: 'join-a-table', title: 'Join a table', summary: 'Tap Join a table and choose the same way the host chose.' },
        { slug: 'ways-to-connect', title: 'Ways to connect', summary: 'Wi-Fi: every phone on the same Wi-Fi network.' },
        { slug: 'bots', title: 'Bots', summary: 'A bot is a player with no phone: the host\'s phone plays for it.' },
        { slug: 'lost-touch', title: 'When a phone loses touch', summary: 'If a phone drops out, the table waits for it, and the host decides: wait for that player, or drop them and play on.' },
        { slug: 'share-a-win', title: 'Sharing a win', summary: 'When you win a game, Share makes an "I won!" card with the final table, and Android\'s share sheet sends it wherever you choose.' }
      ],
      videos: [
        { youtube: 'gHfe4UFtbDo', short: true, src: '/cards/gin-rummy/videos/files/promo-1.0.0.mp4',
          title: 'Gin Rummy Express',
          summary: 'Gin rummy for two phones in a room, or one against a bot, no internet: one hosts, the other joins.' },
        { youtube: 'kf0S4-H1NA4', short: true, src: '/cards/gin-rummy/videos/files/explain-hosting.mp4',
          title: 'How to host a table',
          summary: 'Choose how the phones reach each other and open the table, read its code out or let the other scan it, seat a bot if nobody else is coming, and start.' },
        { youtube: 'xLtHkNynyoQ', src: '/cards/gin-rummy/videos/files/explain-bluetooth.mp4',
          title: 'Two phones over Bluetooth, no network at all',
          summary: 'Two phones never paired, with Wi-Fi and mobile data off: one hosts and reads its code out, the other types it and sits down.' },
        { youtube: '_iuBPdFW-9c', short: true, src: '/cards/gin-rummy/videos/files/explain-gin.mp4',
          title: 'How to play Gin Rummy',
          summary: 'Take the upcard or pass, draw and discard, meld runs and sets, and knock with ten or less deadwood, or go gin.' }
      ]
    },
    {
      slug: 'spades',
      section: 'cards',
      name: 'Spades Express',
      tagline: 'Spades for four phones, in two partnerships.',
      short: 'Spades for four players in two partnerships on their own phones: bid with your partner or bid nil, spades always trump, and the first side to 500 wins.',
      icon: '/assets/img/cards/spades.png',
      status: 'in-development',
      play: null,
      privacy: true,
      together: true,
      tags: ['Cards', 'Bluetooth', 'No internet', 'Play nearby'],
      facts: [['Players', '4 in two partnerships, bots fill the rest'], ['Languages', '33'], ['Internet', 'Not needed'], ['Connects over', 'Bluetooth, Wi-Fi or Nearby'], ['Real money', 'None'], ['Requires', 'Android 8.0 or later']],
      help: [
        { slug: 'rules', title: 'The rules of Spades', summary: 'Four players in two partnerships, partners sitting opposite, with a full pack of 52: thirteen cards each, and the ace high in every suit.' },
        { slug: 'host-a-table', title: 'Host a table', summary: 'One phone hosts the table: it deals, and the others join it.' },
        { slug: 'join-a-table', title: 'Join a table', summary: 'Tap Join a table and choose the same way the host chose.' },
        { slug: 'ways-to-connect', title: 'Ways to connect', summary: 'Wi-Fi: every phone on the same Wi-Fi network.' },
        { slug: 'bots', title: 'Bots', summary: 'A bot is a player with no phone: the host\'s phone plays for it.' },
        { slug: 'lost-touch', title: 'When a phone loses touch', summary: 'If a phone drops out, the table waits for it, and the host decides: wait for that player, or drop them and play on.' },
        { slug: 'share-a-win', title: 'Sharing a win', summary: 'When you win a game, Share makes an "I won!" card with the final table, and Android\'s share sheet sends it wherever you choose.' }
      ],
      videos: [
        { youtube: '1jArWvoUIKw', short: true, src: '/cards/spades/videos/files/promo-1.0.0.mp4',
          title: 'Spades Express',
          summary: 'Spades for four phones in two partnerships, no internet: one hosts, the others join, and bots fill a short table.' },
        { youtube: 'qDDzXuWUj4U', short: true, src: '/cards/spades/videos/files/explain-hosting.mp4',
          title: 'How to host a table',
          summary: 'Choose how the phones reach each other and open the table, read its code out or let the others scan it, seat bots if you are short of players, and start.' },
        { youtube: '2Ouai-Vc7d8', src: '/cards/spades/videos/files/explain-bluetooth.mp4',
          title: 'Two phones over Bluetooth, no network at all',
          summary: 'Two phones never paired, with Wi-Fi and mobile data off: one hosts and reads its code out, the other types it and sits down.' },
        { youtube: 'YGQpZuzfD0o', short: true, src: '/cards/spades/videos/files/explain-spades.mp4',
          title: 'How to play Spades',
          summary: 'Bid the tricks your side will take, or bid nil; spades are always trumps and are not led until broken.' }
      ]
    },
    {
      slug: 'euchre',
      section: 'cards',
      name: 'Euchre Express',
      tagline: 'Euchre for four phones, in two pairs.',
      short: 'Euchre for four players in two pairs on their own phones: order it up or pass, the bowers, going alone, and the first side to ten.',
      icon: '/assets/img/cards/euchre.png',
      status: 'in-development',
      play: null,
      privacy: true,
      together: true,
      tags: ['Cards', 'Bluetooth', 'No internet', 'Play nearby'],
      facts: [['Players', '4 in two pairs, bots fill the rest'], ['Languages', '33'], ['Internet', 'Not needed'], ['Connects over', 'Bluetooth, Wi-Fi or Nearby'], ['Real money', 'None'], ['Requires', 'Android 8.0 or later']],
      help: [
        { slug: 'rules', title: 'The rules of Euchre', summary: 'Four players in two partnerships, partners sitting opposite.' },
        { slug: 'host-a-table', title: 'Host a table', summary: 'One phone hosts the table: it deals, and the others join it.' },
        { slug: 'join-a-table', title: 'Join a table', summary: 'Tap Join a table and choose the same way the host chose.' },
        { slug: 'ways-to-connect', title: 'Ways to connect', summary: 'Wi-Fi: every phone on the same Wi-Fi network.' },
        { slug: 'bots', title: 'Bots', summary: 'A bot is a player with no phone: the host\'s phone plays for it.' },
        { slug: 'lost-touch', title: 'When a phone loses touch', summary: 'If a phone drops out, the table waits for it, and the host decides: wait for that player, or drop them and play on.' },
        { slug: 'share-a-win', title: 'Sharing a win', summary: 'When you win a game, Share makes an "I won!" card with the final table, and Android\'s share sheet sends it wherever you choose.' }
      ],
      videos: []
    },
    {
      slug: '29',
      section: 'cards',
      name: '29 Express',
      tagline: '29 for four phones, in two pairs.',
      short: '29 for four players in two pairs on their own phones: bid from 16 to 28, put the trump face down, and take the points; the first side to six wins.',
      icon: '/assets/img/cards/29.png',
      status: 'in-development',
      play: null,
      privacy: true,
      together: true,
      tags: ['Cards', 'Bluetooth', 'No internet', 'Play nearby'],
      facts: [['Players', '4 in two pairs, bots fill the rest'], ['Languages', '33'], ['Internet', 'Not needed'], ['Connects over', 'Bluetooth, Wi-Fi or Nearby'], ['Real money', 'None'], ['Requires', 'Android 8.0 or later']],
      help: [
        { slug: 'rules', title: 'The rules of 29', summary: 'Four players in two pairs, partners sitting opposite.' },
        { slug: 'host-a-table', title: 'Host a table', summary: 'One phone hosts the table: it deals, and the others join it.' },
        { slug: 'join-a-table', title: 'Join a table', summary: 'Tap Join a table and choose the same way the host chose.' },
        { slug: 'ways-to-connect', title: 'Ways to connect', summary: 'Wi-Fi: every phone on the same Wi-Fi network.' },
        { slug: 'bots', title: 'Bots', summary: 'A bot is a player with no phone: the host\'s phone plays for it.' },
        { slug: 'lost-touch', title: 'When a phone loses touch', summary: 'If a phone drops out, the table waits for it, and the host decides: wait for that player, or drop them and play on.' },
        { slug: 'share-a-win', title: 'Sharing a win', summary: 'When you win a game, Share makes an "I won!" card with the final table, and Android\'s share sheet sends it wherever you choose.' }
      ],
      videos: [
        { youtube: 'EsjoEI46zYw', short: true, src: '/cards/29/videos/files/promo-1.0.0.mp4',
          title: '29 Express',
          summary: 'Twenty-nine for the phones in the room, no internet: one hosts, the others join, and bots fill a short table.' },
        { youtube: 'Du0BkZyOD60', short: true, src: '/cards/29/videos/files/explain-hosting.mp4',
          title: 'How to host a table',
          summary: 'Choose how the phones reach each other and open the table, read its code out or let the others scan it, seat bots if you are short of players, and start.' },
        { youtube: 'olJQn--8RTM', src: '/cards/29/videos/files/explain-bluetooth.mp4',
          title: 'Two phones over Bluetooth, no network at all',
          summary: 'Two phones never paired, with Wi-Fi and mobile data off: one hosts and reads its code out, the other types it and sits down.' },
        { youtube: 'iOUOh5iEKD0', short: true, src: '/cards/29/videos/files/explain-twentynine.mp4',
          title: 'How to play 29',
          summary: 'Bid from 16 to 28, round and round until three pass, and set the trump face down; follow suit, and ask for the trump when you cannot.' }
      ]
    },
    {
      slug: 'big-two',
      section: 'cards',
      name: 'Big Two Express',
      tagline: 'Big Two for four phones.',
      short: 'Big Two for four players on their own phones: beat the last play with higher cards or pass, and be first to empty your hand.',
      icon: '/assets/img/cards/big-two.png',
      status: 'in-development',
      play: null,
      privacy: true,
      together: true,
      tags: ['Cards', 'Bluetooth', 'No internet', 'Play nearby'],
      facts: [['Players', '4, bots fill the rest'], ['Languages', '33'], ['Internet', 'Not needed'], ['Connects over', 'Bluetooth, Wi-Fi or Nearby'], ['Real money', 'None'], ['Requires', 'Android 8.0 or later']],
      help: [
        { slug: 'rules', title: 'The rules of Big Two', summary: 'Four players, each for themselves, with a full pack of 52: thirteen cards each.' },
        { slug: 'host-a-table', title: 'Host a table', summary: 'One phone hosts the table: it deals, and the others join it.' },
        { slug: 'join-a-table', title: 'Join a table', summary: 'Tap Join a table and choose the same way the host chose.' },
        { slug: 'ways-to-connect', title: 'Ways to connect', summary: 'Wi-Fi: every phone on the same Wi-Fi network.' },
        { slug: 'bots', title: 'Bots', summary: 'A bot is a player with no phone: the host\'s phone plays for it.' },
        { slug: 'lost-touch', title: 'When a phone loses touch', summary: 'If a phone drops out, the table waits for it, and the host decides: wait for that player, or drop them and play on.' },
        { slug: 'share-a-win', title: 'Sharing a win', summary: 'When you win a game, Share makes an "I won!" card with the final table, and Android\'s share sheet sends it wherever you choose.' }
      ],
      videos: []
    },
    {
      slug: 'dou-dizhu',
      section: 'cards',
      name: 'Dou Dizhu Express',
      tagline: 'Fight the landlord, on three phones.',
      short: 'Dou Dizhu for three players on their own phones: bid to be the landlord and play against two farmers, with bombs and the rocket.',
      icon: '/assets/img/cards/dou-dizhu.png',
      status: 'in-development',
      play: null,
      privacy: true,
      together: true,
      tags: ['Cards', 'Bluetooth', 'No internet', 'Play nearby'],
      facts: [['Players', '3, bots fill the rest'], ['Languages', '33'], ['Internet', 'Not needed'], ['Connects over', 'Bluetooth, Wi-Fi or Nearby'], ['Real money', 'None'], ['Requires', 'Android 8.0 or later']],
      help: [
        { slug: 'rules', title: 'The rules of Dou Dizhu', summary: 'Three players, with a pack of 54: the 52 and two jokers, a little one (black) and a big one (red).' },
        { slug: 'host-a-table', title: 'Host a table', summary: 'One phone hosts the table: it deals, and the others join it.' },
        { slug: 'join-a-table', title: 'Join a table', summary: 'Tap Join a table and choose the same way the host chose.' },
        { slug: 'ways-to-connect', title: 'Ways to connect', summary: 'Wi-Fi: every phone on the same Wi-Fi network.' },
        { slug: 'bots', title: 'Bots', summary: 'A bot is a player with no phone: the host\'s phone plays for it.' },
        { slug: 'lost-touch', title: 'When a phone loses touch', summary: 'If a phone drops out, the table waits for it, and the host decides: wait for that player, or drop them and play on.' },
        { slug: 'share-a-win', title: 'Sharing a win', summary: 'When you win a game, Share makes an "I won!" card with the final table, and Android\'s share sheet sends it wherever you choose.' }
      ],
      videos: []
    },
    {
      slug: 'canasta',
      section: 'cards',
      name: 'Canasta Express',
      tagline: 'Classic Canasta, in partnerships.',
      short: 'Canasta for four players in two partnerships, or two players, each on their own phone: meld, make canastas, freeze the pile and go out.',
      icon: '/assets/img/cards/canasta.png',
      status: 'in-development',
      play: null,
      privacy: true,
      together: true,
      tags: ['Cards', 'Bluetooth', 'No internet', 'Play nearby'],
      facts: [['Players', '4, or 2; bots fill the rest'], ['Languages', '33'], ['Internet', 'Not needed'], ['Connects over', 'Bluetooth, Wi-Fi or Nearby'], ['Real money', 'None'], ['Requires', 'Android 8.0 or later']],
      help: [
        { slug: 'rules', title: 'The rules of Canasta', summary: 'Classic Canasta, as Pagat gives it.' },
        { slug: 'host-a-table', title: 'Host a table', summary: 'One phone hosts the table: it deals, and the others join it.' },
        { slug: 'join-a-table', title: 'Join a table', summary: 'Tap Join a table and choose the same way the host chose.' },
        { slug: 'ways-to-connect', title: 'Ways to connect', summary: 'Wi-Fi: every phone on the same Wi-Fi network.' },
        { slug: 'bots', title: 'Bots', summary: 'A bot is a player with no phone: the host\'s phone plays for it.' },
        { slug: 'lost-touch', title: 'When a phone loses touch', summary: 'If a phone drops out, the table waits for it, and the host decides: wait for that player, or drop them and play on.' },
        { slug: 'share-a-win', title: 'Sharing a win', summary: 'When you win a game, Share makes an "I won!" card with the final table, and Android\'s share sheet sends it wherever you choose.' }
      ],
      videos: []
    },
    {
      slug: 'durak',
      section: 'cards',
      name: 'Durak Express',
      tagline: 'Durak, both ways, for two to six phones.',
      short: 'Durak for two to six players on their own phones: Podkidnoy or Perevodnoy, beat every card or pick up, and do not be the fool.',
      icon: '/assets/img/cards/durak.png',
      status: 'in-development',
      play: null,
      privacy: true,
      together: true,
      tags: ['Cards', 'Bluetooth', 'No internet', 'Play nearby'],
      facts: [['Players', '2 to 6, bots fill the rest'], ['Languages', '33'], ['Internet', 'Not needed'], ['Connects over', 'Bluetooth, Wi-Fi or Nearby'], ['Real money', 'None'], ['Requires', 'Android 8.0 or later']],
      help: [
        { slug: 'rules', title: 'The rules of Durak', summary: 'Two to six players, each for themselves.' },
        { slug: 'host-a-table', title: 'Host a table', summary: 'One phone hosts the table: it deals, and the others join it.' },
        { slug: 'join-a-table', title: 'Join a table', summary: 'Tap Join a table and choose the same way the host chose.' },
        { slug: 'ways-to-connect', title: 'Ways to connect', summary: 'Wi-Fi: every phone on the same Wi-Fi network.' },
        { slug: 'bots', title: 'Bots', summary: 'A bot is a player with no phone: the host\'s phone plays for it.' },
        { slug: 'lost-touch', title: 'When a phone loses touch', summary: 'If a phone drops out, the table waits for it, and the host decides: wait for that player, or drop them and play on.' },
        { slug: 'share-a-win', title: 'Sharing a win', summary: 'When you win a game, Share makes an "I won!" card with the final table, and Android\'s share sheet sends it wherever you choose.' }
      ],
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
      status: 'available',
      play: 'com.nessaid.brickgame',
      privacy: true,
      tags: ['Arcade', 'Retro', 'Single player'],
      facts: [['Games', '16'], ['Screen', '10x14 up to 14x28 cells'], ['Requires', 'Android 8.0 or later'], ['Languages', '26'], ['Price', 'Free, contains ads']],
      help: [],
      videos: [
        { youtube: 'DRnZY8ud2H0', short: true, title: 'What it does',
          summary: 'Tetris on the classic case, then car race, brick shooter and tank battle, and the pocket and tall cases in other colours and cell shapes.' },
        { youtube: 'WmdTvNgBTPU', short: true, title: 'How to play',
          summary: 'Choosing a game, its speed and its level, S/P to start and pause, RESET and ON/OFF, and the menu that holds everything else.' }
      ]
    },
    {
      slug: 'archery',
      section: 'games',
      name: 'Archery',
      tagline: 'Read the flags. Hold for the drop. Loose.',
      short: 'A target down the range, a flag at each end showing the wind, and an arrow that gravity pulls down while the wind pushes it sideways. Six ends of three arrows, and four bows.',
      icon: '/assets/img/games/archery.png',
      status: 'available',
      play: 'com.nessaid.archery',
      privacy: true,
      tags: ['Sports', 'Single player'],
      facts: [['A game', 'Six ends of three arrows'], ['Bows', 'Crude, professional, recurve, compound'], ['Ranges', '18 m to 70 m, on the real face for each'], ['Requires', 'Android 8.0 or later'], ['Languages', '26'], ['Price', 'Free, contains ads']],
      help: [],
      videos: [
        { youtube: 'qBA6Ol9fSg4', short: true, title: 'What it does',
          summary: 'Reading the two flags, holding off and letting go, the arrow followed down the range to the target, and two of the four bows: the compound and the longbow.' },
        { youtube: '6LrrfwZAnHk', short: true, title: 'How to play',
          summary: 'Hold to draw, drag to aim, lift to shoot; Hint showing where to hold; an early release falling short; a new wind at every distance; and practice with any of the four bows.' }
      ]
    },
    {
      slug: 'nest-hoppers',
      section: 'games',
      name: 'Nest Hoppers',
      tagline: 'Up the tree, basket by basket.',
      short: 'A tree, baskets hung a row apart, and an egg - or a duckling - that hops straight up from one to the next while they slide underneath. Twelve of them, ten points a basket.',
      icon: '/assets/img/games/nest-hoppers.png',
      status: 'available',
      play: 'com.nessaid.nesthoppers',
      privacy: true,
      tags: ['Arcade', 'Single player'],
      facts: [['Modes', 'Classic, Random Jungle, Arcade'], ['Climbers', 'A dozen, egg or duckling'], ['Requires', 'Android 8.0 or later'], ['Languages', '26'], ['Price', 'Free, contains ads']],
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
      status: 'available',
      play: 'com.nessaid.bbroll',
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
      short: 'Ten pins at the end of a maple lane, and one swipe for the whole throw: where it starts, where it goes, how hard, and how it hooks. Alone, against bots, or at a table of nearby phones with no internet - and any finished game can be watched again.',
      icon: '/assets/img/games/bowling.png',
      status: 'available',
      play: 'com.nessaid.bowling',
      privacy: true,
      together: true,
      tags: ['Sports', 'Play nearby', 'No internet'],
      facts: [['Players', 'Up to 6: you, bots, or nearby phones'], ['Frames', '10, scored the real way'], ['Views', "The bowler's, or from above"], ['Replays', 'Every finished game; up to 50 saved'], ['Speed', '0.5x to 2x'], ['Practice', 'A lane whose turn factor and length you set'], ['Requires', 'Android 8.0 or later'], ['Languages', '33'], ['Price', 'Free, contains ads']],
      help: [],
      videos: [
        { youtube: 'kVqNezegogw', short: true, title: 'What it does',
          summary: 'A strike with the chalk on, a hook, a swipe begun outside the lane going down the gutter, two of the swipes How to swipe shows, and the lane from above.' },
        { youtube: 'HcAYb_cPXGs', short: true, title: 'How to swipe',
          summary: 'The game\'s own How to swipe screen, on the lane as the bowler sees it: twelve swipes, each drawn in chalk and then bowled - where the ball starts, which way is straight, the slant, the hook, the power - and two of them again on three lanes to show what the turn factor is.' },
        { youtube: 'Kesrn1K3KEA', title: 'Two phones, one game',
          summary: 'A game hosted on one phone and joined from another, both screens side by side: over Wi-Fi by scanning the code, then over Bluetooth by typing it.' },
        { youtube: 'TBTZiDmrwNY', title: 'Join over Bluetooth',
          summary: 'A phone that has never met the host finds it over Bluetooth, saves it, leaves, and is back in four seconds by the saved phone; then a ball on each.' }
      ]
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
