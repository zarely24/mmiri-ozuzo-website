// English content — complete secondary language. Tokens like {{phone}} are filled by build.mjs from site.config.json.
export default {
  code: 'en',
  htmlLang: 'en',
  ogLocale: 'en_GB',
  other: 'el',
  languageName: 'English',
  otherLanguageName: 'Ελληνικά',
  paths: { home: '/en/', privacy: '/en/privacy/', terms: '/en/terms/' },
  months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  days: {
    long: { mon:'Monday', tue:'Tuesday', wed:'Wednesday', thu:'Thursday', fri:'Friday', sat:'Saturday', sun:'Sunday' },
    short: { mon:'Mon', tue:'Tue', wed:'Wed', thu:'Thu', fri:'Fri', sat:'Sat', sun:'Sun' }
  },

  meta: {
    home: {
      title: 'Mmiri Ozuzo — Barber Salon at Kolokotroni 10, Athens',
      description: 'Haircuts, beard care and traditional straight-razor shaves in a neoclassical building on Kolokotroni Street, minutes from Syntagma Square. Book online via ebarber.'
    },
    privacy: {
      title: 'Privacy & cookies — Mmiri Ozuzo',
      description: 'What data the Mmiri Ozuzo website processes, how booking through ebarber works, and your rights under the GDPR.'
    },
    terms: {
      title: 'Terms of use & operator information — Mmiri Ozuzo',
      description: 'Business details, website terms of use, and information on prices, bookings and accessibility.'
    },
    ogImageAlt: 'Inside Mmiri Ozuzo, barber salon at Kolokotroni 10, Athens',
    notFound: { title: 'Page not found — Mmiri Ozuzo' }
  },

  a11y: {
    skip: 'Skip to content',
    external: 'opens in a new tab',
    menuLabel: 'Menu',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    mainNav: 'Main navigation',
    mobileNav: 'Mobile navigation',
    footerNav: 'Footer navigation',
    langNav: 'Language',
    motionPause: 'Pause motion',
    motionPlay: 'Resume motion',
    poleLabel: 'Decorative barber pole',
    badgeLabel: 'Scroll to the next section',
    mobileCta: 'Quick actions'
  },

  nav: {
    shop: 'The shop', services: 'Services', story: 'The story', gallery: 'Gallery', press: 'Press', visit: 'Visit',
    book: 'Book on ebarber', bookShort: 'Book', call: 'Call'
  },

  hero: {
    eyebrow: 'Barber salon · Kolokotroni 10, Athens',
    h1a: 'Mmiri', h1b: 'Ozuzo',
    lede: 'Haircuts, beards and straight-razor shaves in a neoclassical house on Kolokotroni Street, minutes from Syntagma Square.',
    ctaBook: 'Book an appointment',
    ctaServices: 'The services',
    scheduleLabel: 'Hours'
  },

  intro: {
    eyebrow: 'The shop',
    statement: 'Conversation first. Scissors where character is needed, a straight razor for the lines nothing else gets right, and talk that lasts as long as <em>the cut.</em>',
    p: 'Behind the chair is Vasilis Monastirlis, a barber with more than two decades in the trade and one of the people who shaped Athens’ contemporary barber scene. The room is a 19th-century house with a spare, industrial renovation. Appointments are booked online on ebarber; this page has no accounts, forms or cookies.',
    facts: [
      { k: 'Kolokotroni 10', v: 'Syntagma · Monastiraki' },
      { k: '{{openDays}}', v: 'closed {{closedDays}}' },
      { k: 'Hair & beards', v: 'Straight-razor shaves' }
    ]
  },

  band: { eyebrow: 'Straight-razor shave', text: 'The classic way: a blade, a steady hand, a clean line.' },

  services: {
    eyebrow: 'Services',
    h2: 'The <em>menu.</em>',
    sub: 'Every line leads to booking on ebarber, where you see available times and the current price list.',
    groups: { haircuts: 'Haircuts', beard: 'Beard', shaves: 'Shaves & combinations', extras: 'Extras' },
    items: {
      cut_classic: { name: 'Classic haircut, scissors only', desc: 'Shape and length without clippers' },
      cut_fade: { name: 'Fade haircut', desc: 'Finished with a straight razor or shaver' },
      cut_nofade: { name: 'Haircut, no fade', desc: 'Wash and shaver finish are charged separately' },
      cut_clipper_guard: { name: 'Clippers only, one guard', desc: 'One length all over' },
      cut_cleanup: { name: 'Clean-up', desc: 'Nape, sideburns, outline' },
      cut_kids: { name: 'Children’s haircut', desc: 'Patient, unhurried' },
      beard_care: { name: 'Beard care', desc: 'Shape, lines, finish' },
      beard_clipper: { name: 'Beard with clippers, one length', desc: 'A quick tidy' },
      moustache: { name: 'Moustache shape', desc: '' },
      shave_traditional: { name: 'Traditional straight-razor shave', desc: 'The classic way, with a blade' },
      shave_head: { name: 'Head shave with a straight razor', desc: '' },
      cut_and_beard: { name: 'Haircut & beard care', desc: 'Both in one appointment' },
      shampoo: { name: 'Shampoo', desc: '' },
      wash_style: { name: 'Wash & styling with product', desc: '' }
    },
    minutes: 'min',
    bookThis: 'Book',
    dated: 'Prices and durations as listed on ebarber on {{asOf}}. The current price list is always the one on ebarber.',
    surcharge: 'On holiday days (Christmas, Easter, 14 August) a surcharge of {{surcharge}} per service applies.',
    offers: 'On ebarber you will also find multi-visit packs and a student discount.',
    live: 'Full menu & availability on ebarber'
  },

  story: {
    eyebrow: 'The story',
    h2: 'One barber, <em>one 19th-century house.</em>',
    intro: 'Mmiri Ozuzo is the shop of Vasilis Monastirlis, one of the barbers who gave Athens back the idea of the barbershop as a place of craft and company. It sits in a neoclassical house on Kolokotroni Street with a history of its own.',
    chapters: [
      { num: 'I', title: 'The barber',
        html: 'Vasilis Monastirlis has been cutting hair for more than two decades. Before Mmiri Ozuzo he created “En Athinais 1928”; as he has put it himself, when he opened his first barbershop there were just two old barbershops in the whole Athens basin. He has served as artistic director of the Barber Awards at the Hairprof trade fair and has taught the history of the barbering craft. In 2023 Greek public broadcaster ERT devoted a video portrait to him titled “The man who brought barber shops to Greece”.' },
      { num: 'II', title: 'The house',
        html: 'The building at Kolokotroni 10 was built in the 19th century and was the home of the old Athenian Giatra–Belegrini family, who gave it its present form, most probably in the late 1870s. Local tradition holds that Theodoros Kolokotronis was hosted here; that account rests on references in his memoirs to a house in the area, not on documented historical record. The renovation that turned the house into a barbershop began in October 2015 and took three years: it kept the neoclassical shell and added a spare, industrial feel. According to the 2019 press feature, a four-metre ceiling painting, a copy after François Boucher, was also conserved.' },
      { num: 'III', title: 'The name',
        html: '“Mmiri ozuzo” is a phrase from the Igbo language of Nigeria, which the founder has explained as meaning “storm”. The logo keeps it simple: Barber Salon. Hair, beards, shaves, and a room where the conversation lasts as long as the line.' }
    ],
    sources: 'Sources: iefimerida.gr feature (26 January 2019) and ERT video (6 October 2023). Details about the building come from the 2019 feature.',
    slotCaption: 'The façade at Kolokotroni 10 — photograph to be added'
  },

  gallery: {
    eyebrow: 'Gallery',
    h2: 'Inside <em>the shop.</em>',
    sub: 'Photographs of the room and the work. Select one to view it larger.',
    lightbox: { label: 'Photo viewer', close: 'Close', prev: 'Previous photo', next: 'Next photo' }
  },

  press: {
    eyebrow: 'In the press',
    h2: 'Written <em>about the shop.</em>',
    sub: 'Links open the publishers’ pages in a new tab; we do not embed articles or videos here.',
    items: {
      'iefimerida-2019': { kicker: 'Feature · iefimerida.gr · {{date}}', cta: 'Read the article (in Greek)' },
      'ert-2023': { kicker: 'Video · ERT · {{date}}', cta: 'Watch on YouTube (in Greek)' }
    },
    byline: 'by {{author}}'
  },

  visit: {
    eyebrow: 'Visit',
    h2: 'Find <em>the chair.</em>',
    address: { label: 'Address', nearby: 'A few minutes on foot from Syntagma and Monastiraki, a step off Stadiou Street.' },
    directions: { google: 'Directions in Google Maps', osm: 'Open in OpenStreetMap', note: 'These links open external map services in a new tab.' },
    phone: { label: 'Phone', copy: 'Copy number', copied: 'Number copied.', copyFail: 'Could not copy — call {{phone}}.' },
    hours: {
      label: 'Hours',
      note: 'Hours as listed on ebarber. They can change on public holidays; check available times when booking, or call.',
      closed: 'Closed',
      today: 'today',
      status: {
        open: 'Open now', closed: 'Closed now',
        closes: 'Open now · closes at {{time}}',
        opensToday: 'Closed · opens today at {{time}}',
        opensTomorrow: 'Closed · opens tomorrow at {{time}}',
        opensOn: 'Closed · opens {{day}} at {{time}}'
      }
    },
    map: {
      label: 'Map',
      small: 'The map loads from OpenStreetMap only when you ask for it. Your IP address then becomes visible to the OpenStreetMap Foundation.',
      load: 'Load the map',
      loaded: 'Map loaded from OpenStreetMap.',
      iframeTitle: 'Map — Kolokotroni 10, Athens',
      attribution: '© OpenStreetMap contributors',
      privacy: 'More in the privacy policy'
    }
  },

  cta: {
    eyebrow: 'Online booking · {{openDays}}',
    h2: 'Take <em>a seat.</em>',
    book: 'Book on ebarber',
    call: 'Call the shop',
    note: 'Booking happens on ebarber.gr, in a new tab: you pick the service and time, they keep the calendar.'
  },

  footer: {
    blurb: 'Barber salon at Kolokotroni 10, Athens. Haircuts, beards and straight-razor shaves.',
    around: 'On this page',
    legal: 'Legal',
    privacy: 'Privacy',
    cookies: 'Cookies',
    terms: 'Terms & operator information',
    bookings: 'Bookings via',
    lang: 'Language',
    noTrack: 'No cookies, no trackers, no third-party scripts.',
    copyright: '© {{year}} Mmiri Ozuzo · Kolokotroni 10, Athens 105 61'
  },

  mobile: { book: 'Book', call: 'Call' },

  legal: {
    updated: 'Last updated: {{updated}}',
    backHome: 'Back to the homepage',
    contents: 'Contents',
    privacy: {
      h1: 'Privacy & cookies',
      lead: 'This page explains what happens to your data when you visit the Mmiri Ozuzo website and when you book through ebarber. It is written to be read, not to discourage.',
      sections: [
        { id: 'controller', h: '1. Data controller',
          html: '<p>The controller for this website is the barbershop <strong>{{legalName}}</strong> (trading as “Mmiri Ozuzo”), {{address}}, tel. <a href="{{phoneHref}}">{{phone}}</a>{{emailLine}}.</p><p>No data protection officer (DPO) has been appointed. For any privacy matter, contact us at the details above.</p>' },
        { id: 'what', h: '2. What the website does — and does not do',
          html: '<p>The website is informational. It has no user accounts, contact forms, newsletter, comments or payments. It uses no cookies, local storage, analytics, advertising pixels, session recording or third-party fonts: every file loads from our own server. The only exception is the map, which loads only when you ask for it (section 4).</p>' },
        { id: 'logs', h: '3. Server logs',
          html: '<p>When you open a page, the server hosting the website ({{hosting}}) automatically receives your IP address, the time, the page requested, your browser type and the page you came from. This may be kept in log files for security, troubleshooting and availability.</p><p>Legal basis: legitimate interest (Article 6(1)(f) GDPR). Logs are not combined with other data and are deleted or anonymised under the hosting provider’s policy{{logRetention}}.</p>' },
        { id: 'map', h: '4. Map — loads only on click',
          html: '<p>In the “Visit” section there is a “Load the map” button. Only if you press it does your browser connect to openstreetmap.org, operated by the OpenStreetMap Foundation (United Kingdom), which then receives your IP address and the technical details of the request. Until then no connection is made.</p><p>Legal basis: your consent given by the click (Article 6(1)(a) GDPR). You withdraw it by closing or reloading the page; the map does not load again without a new click. The United Kingdom is covered by a European Commission adequacy decision. OSMF privacy policy: <a href="https://osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer">osmfoundation.org/wiki/Privacy_Policy</a>.</p>' },
        { id: 'booking', h: '5. Booking through ebarber',
          html: '<p>Appointments are booked on the ebarber.gr platform, operated by BOOKING HERO I.K.E. (196 Syngrou Avenue, Kallithea 176 71, Greece, info@ebarber.gr). When you press “Book”, you leave our website and our page on ebarber opens in a new tab.</p><p>The details you enter there (name, phone, email, service, day and time) are collected by ebarber under <a href="{{providerPrivacy}}" target="_blank" rel="noopener noreferrer">its own privacy policy</a> and passed to the barbershop so the appointment can take place. For the appointment details we receive, we are the controller; the legal basis is performance of the service contract (Article 6(1)(b) GDPR). We keep them as long as needed for the appointment, any changes or cancellations, and serving you as a customer.</p><p>The website sends no marketing messages. Appointment reminders or updates sent through ebarber are governed by ebarber’s settings and policy.</p>' },
        { id: 'phone', h: '6. Phone contact',
          html: '<p>If you call us, we process your number and what you tell us only to arrange your appointment or answer your question (Article 6(1)(b) GDPR).</p>' },
        { id: 'links', h: '7. Links to third parties',
          html: '<p>The website links to ebarber.gr, Google Maps, OpenStreetMap, YouTube (ERT) and iefimerida.gr. They open in a new tab and, once you follow them, the respective providers’ privacy policies apply. We do not embed videos, Google maps or social media buttons.</p>' },
        { id: 'cookies', h: '8. Cookies and browser storage',
          html: '<p>The website sets no cookies and stores nothing in your browser — no local storage, no session storage. That is why it shows no consent banner: under Article 4(5) of Greek Law 3471/2006, consent is required for storing or accessing information on your device that is not strictly necessary, and we do none.</p><p>If you press “Load the map”, the OpenStreetMap frame may store its own technical data to operate the map; that is governed by the OSMF policy. If we ever add analytics or other optional tools, we will ask for your consent first, with a clear choice to accept or reject.</p>' },
        { id: 'rights', h: '9. Your rights',
          html: '<p>You have the rights of access, rectification, erasure, restriction of processing, data portability and objection (Articles 15–21 GDPR), and the right to withdraw consent where processing is based on it (Article 7(3)). To exercise them, contact us at the details in section 1.</p><p>You also have the right to lodge a complaint with the Hellenic Data Protection Authority: {{dpaAddress}}, <a href="https://www.dpa.gr/" target="_blank" rel="noopener noreferrer">www.dpa.gr</a>, contact@dpa.gr.</p>' },
        { id: 'minors', h: '10. Minors',
          html: '<p>The website is not aimed at minors and we do not knowingly collect their data. For children’s haircuts, the parent or guardian makes the booking.</p>' },
        { id: 'changes', h: '11. Changes',
          html: '<p>If the way the website works changes, we will update this page and the date at the top.</p>' }
      ]
    },
    terms: {
      h1: 'Terms of use & operator information',
      lead: 'This website is informational: it sells nothing, charges nothing and asks for no details. The terms below describe what applies when you use it.',
      sections: [
        { id: 'operator', h: '1. Operator information',
          html: '<dl class="kv"><dt>Legal name</dt><dd>{{legalName}}</dd><dt>Trading name</dt><dd>Mmiri Ozuzo</dd><dt>Activity</dt><dd>Barbershop (barber salon)</dd><dt>Registered address</dt><dd>{{address}}</dd><dt>Phone</dt><dd><a href="{{phoneHref}}">{{phone}}</a></dd>{{emailRow}}{{gemiRow}}{{vatRow}}</dl>' },
        { id: 'scope', h: '2. Scope',
          html: '<p>The website provides information about the barbershop: services, hours, address and history. No sales or payments are made through it, and no contract is formed merely by using it.</p>' },
        { id: 'bookings', h: '3. Bookings',
          html: '<p>Bookings are made on <a href="{{bookingUrl}}" target="_blank" rel="noopener noreferrer">ebarber.gr</a>, under ebarber’s terms of use and whatever is shown during booking. The service is provided by the barbershop on its premises. For changes or cancellations, use ebarber or call us.</p>' },
        { id: 'prices', h: '4. Prices and hours',
          html: '<p>Prices and durations shown are as listed on ebarber on {{asOf}} and may change. The current list is the one shown on ebarber at the time of booking. Hours may differ on public holidays.</p>' },
        { id: 'ip', h: '5. Intellectual property',
          html: '<p>Texts, design and logo belong to the barbershop or are used with permission. The Literata and Commissioner typefaces are licensed under the SIL Open Font License 1.1. Map data comes from OpenStreetMap (© OpenStreetMap contributors, ODbL). No commercial reproduction without permission.</p>' },
        { id: 'links', h: '6. Third-party links',
          html: '<p>Links to external websites are provided for convenience. We do not control and are not responsible for their content.</p>' },
        { id: 'liability', h: '7. Liability',
          html: '<p>We try to keep the information accurate and current, without guaranteeing uninterrupted operation or the absence of errors. Our liability is limited to the extent the law allows.</p>' },
        { id: 'a11y', h: '8. Accessibility',
          html: '<p>The website was built to target WCAG 2.2 level AA: keyboard navigation, visible focus, sufficient contrast, and respect for the “reduced motion” setting. If you run into a barrier, call us so we can fix it.</p>' },
        { id: 'law', h: '9. Governing law',
          html: '<p>Greek law applies and the courts of Athens have jurisdiction, without prejudice to consumer-protection provisions. For out-of-court resolution of consumer disputes you may contact the Hellenic Consumer’s Ombudsman (<a href="https://www.synigoroskatanaloti.gr/" target="_blank" rel="noopener noreferrer">synigoroskatanaloti.gr</a>).</p>' }
      ]
    }
  },

  notFound: {
    h1: 'Page not found',
    p: 'The address you requested does not exist or has moved.',
    home: 'Homepage',
    book: 'Book on ebarber'
  }
};
