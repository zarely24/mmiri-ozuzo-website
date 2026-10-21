// HTML templates (redesign). Pure functions of a render context built by build.mjs.
// No inline style attributes, no inline event handlers (CSP: script-src 'self'; style-src 'self').

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const attr = s => esc(s);

export const SPRITE = `<svg xmlns="http://www.w3.org/2000/svg" class="sprite" aria-hidden="true" focusable="false">
  <symbol id="i-phone" viewBox="0 0 24 24"><path fill="currentColor" d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.85 21 3 13.15 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z"/></symbol>
  <symbol id="i-pin" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21c-4.4-4-7-7.6-7-11a7 7 0 1 1 14 0c0 3.4-2.6 7-7 11z"/><circle cx="12" cy="10" r="2.6"/></g></symbol>
  <symbol id="i-arrow" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></g></symbol>
  <symbol id="i-arrow-r" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15m-6-6 6 6-6 6"/></g></symbol>
  <symbol id="i-arrow-l" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12H5m6-6-6 6 6 6"/></g></symbol>
  <symbol id="i-x" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></g></symbol>
  <symbol id="i-copy" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></g></symbol>
  <symbol id="i-mark" viewBox="0 0 64 64"><path d="M14 48V16l18 19 18-19v32" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/></symbol>
</svg>`;

const ic = id => `<svg class="ic" aria-hidden="true" focusable="false"><use href="#${id}"/></svg>`;

function extLink(ctx, href, inner, cls = '', extra = '') {
  const c = cls ? ` class="${cls}"` : '';
  return `<a${c} href="${attr(href)}" target="_blank" rel="noopener noreferrer"${extra}>${inner}<span class="vh"> (${esc(ctx.t.a11y.external)})</span></a>`;
}
const bookLink = (ctx, inner, cls = '', extra = '') => extLink(ctx, ctx.cfg.booking.url, inner, cls, ` data-booking="1"${extra}`);
const telHref = ctx => `tel:${ctx.cfg.contact.phoneE164}`;

// Responsive <picture>. opts.mobile = art-directed variant for ≤720px; opts.priority = eager + high priority.
function picture(img, opts = {}) {
  if (!img) return '';
  const srcs = im => im.sources.map(s => `<source${opts.mobile && im === opts.mobile ? ' media="(max-width: 720px)"' : ''} type="${s.type}" srcset="${s.srcset}" sizes="${im.sizes}">`).join('');
  let sources = '';
  if (opts.mobile) sources += srcs(opts.mobile) + `<source media="(max-width: 720px)" srcset="${opts.mobile.fallback.srcset}" sizes="${opts.mobile.sizes}">`;
  sources += srcs(img);
  const load = opts.priority ? ' fetchpriority="high" decoding="async"' : ' loading="lazy" decoding="async"';
  return `<picture>${sources}<img src="${img.fallback.src}" srcset="${img.fallback.srcset}" sizes="${img.sizes}" width="${img.width}" height="${img.height}" alt="${attr(img.alt)}"${load}></picture>`;
}

function head(ctx, page) {
  const { t, cfg, urls, assets, images } = ctx;
  const m = t.meta[page];
  const canonical = urls.abs(urls.self);
  const alts = urls.alternates;
  const isHome = page === 'home';
  const preloadFonts = (ctx.lang === 'el'
    ? ['commissioner-greek.woff2', 'commissioner-latin.woff2']
    : ['commissioner-latin.woff2'])
    .map(f => `<link rel="preload" href="${urls.base}/assets/fonts/${f}" as="font" type="font/woff2" crossorigin>`).join('\n');
  const preloadHero = isHome && images.hero ? [
    images.heroMobile ? `<link rel="preload" as="image" type="image/avif" imagesrcset="${images.heroMobile.sources[0].srcset}" imagesizes="100vw" media="(max-width: 720px)">` : '',
    `<link rel="preload" as="image" type="image/avif" imagesrcset="${images.hero.sources[0].srcset}" imagesizes="100vw" media="(min-width: 721px)">`
  ].join('\n') : '';
  const jsonld = isHome ? `<script type="application/ld+json">${JSON.stringify(ctx.jsonld)}</script>` : '';
  const robots = (page === 'notFound' || urls.staging) ? `<meta name="robots" content="noindex, nofollow">` : '';
  const altLinks = page === 'notFound' ? '' : `<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="el" href="${urls.abs(alts.el)}">
<link rel="alternate" hreflang="en" href="${urls.abs(alts.en)}">
<link rel="alternate" hreflang="x-default" href="${urls.abs(alts.el)}">`;
  return `<!DOCTYPE html>
<html lang="${t.htmlLang}" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(m.title)}</title>
${m.description ? `<meta name="description" content="${attr(m.description)}">` : ''}
${robots}
${altLinks}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${attr(cfg.brand.name)}">
<meta property="og:title" content="${attr(m.title)}">
${m.description ? `<meta property="og:description" content="${attr(m.description)}">` : ''}
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="${t.ogLocale}">
<meta property="og:locale:alternate" content="${ctx.lang === 'el' ? 'en_GB' : 'el_GR'}">
<meta property="og:image" content="${urls.abs(urls.base + '/assets/img/og.png')}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${attr(t.meta.ogImageAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#F3F2EF">
<link rel="icon" href="${urls.base}/favicon.ico" sizes="32x32">
<link rel="icon" href="${urls.base}/assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${urls.base}/assets/img/apple-touch-icon.png">
<link rel="manifest" href="${urls.base}/manifest.webmanifest">
${preloadFonts}
${preloadHero}
<link rel="stylesheet" href="${assets.css}">
<script defer src="${assets.js}"></script>
${jsonld}
</head>`;
}

function langSwitch(ctx, cls = 'lang-sw') {
  const { t, urls } = ctx;
  const items = ['el', 'en'].map(code => {
    const name = code === 'el' ? 'Ελληνικά' : 'English';
    const short = code === 'el' ? 'ΕΛ' : 'EN';
    if (code === ctx.lang) return `<span aria-current="page" lang="${code}"><span class="cur"><span class="vh">${esc(name)}: </span>${short}</span></span>`;
    return `<a href="${urls.alternates[code]}" hreflang="${code}" lang="${code}" title="${esc(name)}"><span class="vh">${esc(name)}: </span>${short}</a>`;
  }).join('');
  return `<nav class="${cls}" aria-label="${attr(t.a11y.langNav)}">${items}</nav>`;
}

const navItems = (ctx) => [
  ['shop', ctx.t.nav.shop], ['services', ctx.t.nav.services], ['story', ctx.t.nav.story],
  ...(ctx.hasGallery ? [['gallery', ctx.t.nav.gallery]] : []), ['visit', ctx.t.nav.visit]
];

function header(ctx, page) {
  const { t, cfg, urls } = ctx;
  const home = urls.home;
  const pre = page === 'home' ? '' : home;
  const links = navItems(ctx).map(([h, l]) => `<a href="${pre}#${h}">${esc(l)}</a>`).join('');
  const solid = page === 'home' ? '' : ' solid';
  return `<a class="skip" href="#main">${esc(t.a11y.skip)}</a>
<header class="nav${solid}" id="nav">
  <div class="container nav-in">
    <a class="brand" href="${home}"><svg class="mark" aria-hidden="true" focusable="false"><use href="#i-mark"/></svg><span>${esc(cfg.brand.name)}</span></a>
    <nav class="nav-links" aria-label="${attr(t.a11y.mainNav)}">${links}</nav>
    <div class="nav-right">
      ${langSwitch(ctx)}
      <a class="nav-tel" href="${telHref(ctx)}">${ic('i-phone')}${esc(cfg.contact.phoneDisplay)}</a>
      ${bookLink(ctx, `<span>${esc(t.nav.bookShort)}</span>`, 'btn btn-primary sm')}
      <button class="burger" id="burger" type="button" aria-expanded="false" aria-controls="mnav" aria-label="${attr(t.a11y.menuOpen)}"><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="mnav" id="mnav">
  <nav aria-label="${attr(t.a11y.mobileNav)}">
    ${navItems(ctx).map(([h, l]) => `<a class="big-link" href="${pre}#${h}">${esc(l)}</a>`).join('\n    ')}
  </nav>
  <div class="mnav-foot">
    ${langSwitch(ctx)}
    ${bookLink(ctx, `<span>${esc(t.nav.book)}</span> ${ic('i-arrow')}`, 'btn btn-primary')}
    <a class="btn btn-ghost" href="${telHref(ctx)}">${ic('i-phone')} <span>${esc(t.nav.call)}</span></a>
    <p class="js-open-note" aria-live="off"></p>
  </div>
</div>`;
}

function footer(ctx, page) {
  const { t, cfg, urls } = ctx;
  const home = urls.home;
  const pre = page === 'home' ? '' : home;
  const navLinks = [...navItems(ctx), ['press', t.nav.press]].map(([h, l]) => `<a href="${pre}#${h}">${esc(l)}</a>`).join('');
  return `<footer class="footer">
  <div class="container foot-top">
    <div class="f-brand">
      <a class="brand" href="${home}"><svg class="mark" aria-hidden="true" focusable="false"><use href="#i-mark"/></svg><span>${esc(cfg.brand.name)}</span></a>
      <p>${esc(t.footer.blurb)}</p>
      <p>${esc(t.footer.noTrack)}</p>
    </div>
    <nav class="f-nav" aria-label="${attr(t.a11y.footerNav)}">
      <p class="f-h">${esc(t.footer.around)}</p>
      ${navLinks}
    </nav>
    <div class="f-legal">
      <p class="f-h">${esc(t.footer.legal)}</p>
      <a href="${t.paths.privacy}">${esc(t.footer.privacy)}</a>
      <a href="${t.paths.privacy}#cookies">${esc(t.footer.cookies)}</a>
      <a href="${t.paths.terms}">${esc(t.footer.terms)}</a>
    </div>
    <div class="f-lang">
      <p class="f-h">${esc(t.footer.lang)}</p>
      <a href="${urls.alternates.el}" hreflang="el" lang="el"${ctx.lang === 'el' ? ' aria-current="page"' : ''}>Ελληνικά</a>
      <a href="${urls.alternates.en}" hreflang="en" lang="en"${ctx.lang === 'en' ? ' aria-current="page"' : ''}>English</a>
    </div>
  </div>
  <div class="container foot-bot">
    <span>${esc(t.footer.copyright)}</span>
    <span>${esc(t.footer.bookings)} ${bookLink(ctx, 'ebarber.gr')}</span>
  </div>
</footer>
<div class="mcta" id="mcta" role="region" aria-label="${attr(t.a11y.mobileCta)}">
  ${bookLink(ctx, `<span>${esc(t.mobile.book)}</span> ${ic('i-arrow')}`, 'btn btn-primary')}
  <a class="btn btn-ghost" href="${telHref(ctx)}">${ic('i-phone')} <span>${esc(t.mobile.call)}</span></a>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<script type="application/json" id="site-data">${ctx.siteDataJson}</script>`;
}

function hoursList(ctx) {
  const { t, cfg } = ctx;
  const order = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  return `<ul class="hours-list" id="hoursList">${order.map(d => {
    const h = cfg.hours.week[d];
    const time = h ? `<time>${h[0]}</time> – <time>${h[1]}</time>` : esc(t.visit.hours.closed);
    return `<li data-day="${d}"><span class="h-day" data-today="${attr(t.visit.hours.today)}">${esc(t.days.long[d])}</span><span class="h-dots" aria-hidden="true"></span><span class="h-time">${time}</span></li>`;
  }).join('')}</ul>`;
}

export function renderHome(ctx) {
  const { t, cfg, urls, images } = ctx;

  const services = cfg.services.groups.map(g => `<div class="svc-group">
      <h3>${esc(t.services.groups[g.id])}</h3>
      <ul class="svc-list">${g.items.map(it => {
        const s = t.services.items[it.key];
        const price = cfg.services.showPrices ? `<span class="svc-price">€${it.price}</span>` : '<span class="svc-price"></span>';
        return `<li>${bookLink(ctx, `<span class="svc-main"><span class="svc-name">${esc(s.name)}</span>${s.desc ? `<span class="svc-desc">${esc(s.desc)}</span>` : ''}</span><span class="svc-dur">${it.minutes} ${esc(t.services.minutes)}</span>${price}<svg class="svc-arrow" aria-hidden="true" focusable="false"><use href="#i-arrow"/></svg><span class="vh"> — ${esc(t.services.bookThis)}</span>`, 'svc-row')}</li>`;
      }).join('')}</ul>
    </div>`).join('');

  const press = cfg.press.map(p => {
    const c = t.press.items[p.id];
    const by = p.author ? ` · ${esc(t.press.byline.replace('{{author}}', p.author))}` : '';
    return `<li><div class="press-row">
      <div><p class="press-k">${esc(c.kicker.replace('{{date}}', ctx.fmtDate(p.date)))}${by}</p><span class="press-t" lang="el">“${esc(p.title_el)}”</span></div>
      ${extLink(ctx, p.url, `<span>${esc(c.cta)}</span> ${ic('i-arrow')}`, 'link')}
    </div></li>`;
  }).join('');

  const gallery = ctx.hasGallery ? `
<section class="sec" id="gallery" aria-labelledby="h-gallery">
  <div class="container">
    <div class="sec-head" data-reveal>
      <p class="eyebrow">${esc(t.gallery.eyebrow)}</p>
      <h2 id="h-gallery">${t.gallery.h2}</h2>
      <p class="sec-sub">${esc(t.gallery.sub)}</p>
    </div>
    <div class="gallery" id="gallery-grid" data-reveal>
      ${images.gallery.map(g => `<button class="g-item" type="button" data-full="${g.full}" data-cap="${attr(g.caption)}" aria-label="${attr(g.alt)}">${picture(g)}<span class="cap" aria-hidden="true">${esc(g.caption)}</span></button>`).join('\n      ')}
    </div>
  </div>
</section>
<div class="lightbox" id="lightbox" hidden role="dialog" aria-modal="true" aria-label="${attr(t.gallery.lightbox.label)}">
  <button class="lb-btn lb-close" id="lbClose" type="button" aria-label="${attr(t.gallery.lightbox.close)}">${ic('i-x')}</button>
  <button class="lb-btn lb-prev" id="lbPrev" type="button" aria-label="${attr(t.gallery.lightbox.prev)}">${ic('i-arrow-l')}</button>
  <figure class="lb-fig"><img id="lbImg" src="" alt=""><figcaption class="lb-cap"><span id="lbCap"></span><span id="lbIdx"></span></figcaption></figure>
  <button class="lb-btn lb-next" id="lbNext" type="button" aria-label="${attr(t.gallery.lightbox.next)}">${ic('i-arrow-r')}</button>
</div>` : '';

  const addrLine = ctx.lang === 'el' ? `${cfg.address.street_el},<br>${cfg.address.locality_el} ${cfg.address.postalCode}` : `${cfg.address.street_en},<br>${cfg.address.locality_en} ${cfg.address.postalCode}, ${cfg.address.country_en}`;

  return `${head(ctx, 'home')}
<body id="top">
${SPRITE}
${header(ctx, 'home')}
<main id="main" tabindex="-1">
<section class="hero" id="hero" aria-labelledby="h-hero">
  <div class="hero-media">${picture(images.hero, { mobile: images.heroMobile, priority: true })}</div>
  <div class="hero-in">
    <div class="container">
      <p class="eyebrow" data-reveal><svg class="razor-mini" viewBox="0 0 260 70" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"><path d="M92 24 L246 20 Q254 20 254 28 L254 40 Q254 46 246 46 L92 46 Z"/><circle cx="84" cy="36" r="6" fill="currentColor"/><path d="M80 30 L12 50 Q4 52.5 4 58.5 Q5.5 64.5 14 62.5 L82 43.5"/></svg>${esc(t.hero.eyebrow)}</p>
      <div class="h1wrap"><h1 id="h-hero"><span>${esc(t.hero.h1a)}</span><span>${esc(t.hero.h1b)}</span></h1><svg class="razor" viewBox="0 0 260 70" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"><path d="M92 24 L246 20 Q254 20 254 28 L254 40 Q254 46 246 46 L92 46 Z" fill="rgba(18,19,21,.5)"/><path d="M104 30 L238 27"/><circle cx="84" cy="36" r="4.5" fill="currentColor"/><path d="M80 30 L12 50 Q4 52.5 4 58.5 Q5.5 64.5 14 62.5 L82 43.5" fill="rgba(18,19,21,.5)"/></svg></div>
      <p class="lede d2" data-reveal>${esc(t.hero.lede)}</p>
      <div class="hero-cta d3" data-reveal>
        ${bookLink(ctx, `<span>${esc(t.hero.ctaBook)}</span> ${ic('i-arrow')}`, 'btn btn-primary lg', ' id="heroBook"')}
        <a class="btn btn-ghost lg" href="#services">${esc(t.hero.ctaServices)}</a>
      </div>
      <p class="hero-status d3" data-reveal><span class="js-status-pill"><i class="dot" aria-hidden="true"></i><span class="vh">${esc(t.hero.scheduleLabel)}</span></span><span class="js-open-note">${esc(ctx.scheduleShort)}</span></p>
    </div>
  </div>
</section>

<section class="sec" id="shop" aria-labelledby="h-shop">
  <div class="container">
    <div class="intro-grid">
      <div data-reveal>
        <p class="eyebrow">${esc(t.intro.eyebrow)}</p>
        <h2 id="h-shop" class="statement">${t.intro.statement}</h2>
      </div>
      <p class="intro-copy d1" data-reveal>${esc(t.intro.p)}</p>
    </div>
    <dl class="facts" data-reveal>
      ${t.intro.facts.map(f => `<div class="fact"><dt class="fact-k">${esc(f.k)}</dt><dd class="fact-v">${esc(f.v)}</dd></div>`).join('')}
    </dl>
  </div>
</section>

<section class="sec svc-sec" id="services" aria-labelledby="h-services">
  <div class="container svc-grid">
    <div class="svc-aside" data-reveal>
      <p class="eyebrow">${esc(t.services.eyebrow)}</p>
      <h2 id="h-services">${t.services.h2}</h2>
      <p class="sec-sub">${esc(t.services.sub)}</p>
      ${bookLink(ctx, `<span>${esc(t.services.live)}</span> ${ic('i-arrow')}`, 'btn btn-primary')}
      <div class="svc-notes">
        ${cfg.services.showPrices ? `<p>${esc(t.services.dated)}</p>` : ''}
        ${cfg.services.showPrices && cfg.services.holidaySurcharge ? `<p>${esc(t.services.surcharge)}</p>` : ''}
        <p>${esc(t.services.offers)}</p>
      </div>
    </div>
    <div data-reveal>${services}</div>
  </div>
</section>

${images.band ? `<figure class="band">
  ${picture(images.band, { mobile: images.bandMobile })}
  <figcaption class="band-cap"><div class="container"><p class="eyebrow">${esc(t.band.eyebrow)}</p><p>${esc(t.band.text)}</p></div></figcaption>
</figure>` : ''}

<section class="sec dark" id="story" aria-labelledby="h-story">
  <div class="container">
    <div class="story-grid">
      <div class="story-media" data-reveal>
        ${images.story ? picture(images.story) : ''}
        ${images.story && images.story.caption ? `<p class="story-cap">${esc(images.story.caption)}</p>` : ''}
      </div>
      <div class="story-copy">
        <div data-reveal>
          <p class="eyebrow">${esc(t.story.eyebrow)}</p>
          <h2 id="h-story">${t.story.h2}</h2>
          <p class="intro">${esc(t.story.intro)}</p>
        </div>
        <div class="chapters">
          ${t.story.chapters.map(c => `<div class="chapter" data-reveal>
            <span class="num" aria-hidden="true">${c.num}</span>
            <div><h3>${esc(c.title)}</h3><p>${c.html}</p></div>
          </div>`).join('')}
        </div>
        <p class="sources" data-reveal>${esc(t.story.sources)}</p>
        <div class="press" id="press" data-reveal>
          <h3 class="eyebrow">${esc(t.press.eyebrow)}</h3>
          <ul class="press-list">${press}</ul>
          <p class="sources">${esc(t.press.sub)}</p>
        </div>
      </div>
    </div>
  </div>
</section>
${gallery}
<section class="sec visit-sec" id="visit" aria-labelledby="h-visit">
  <div class="container">
    <div class="sec-head" data-reveal>
      <p class="eyebrow">${esc(t.visit.eyebrow)}</p>
      <h2 id="h-visit">${t.visit.h2}</h2>
    </div>
    <div class="visit-grid">
      <div class="v-info" data-reveal>
        <div class="v-block">
          <h3 class="v-label">${esc(t.visit.address.label)}</h3>
          <address class="v-big">${addrLine}</address>
          <p class="v-near">${esc(t.visit.address.nearby)}</p>
          <div class="v-links">
            ${extLink(ctx, urls.googleDirections, `<span>${esc(t.visit.directions.google)}</span> ${ic('i-arrow')}`, 'link')}
            ${extLink(ctx, urls.osmLink, `<span>${esc(t.visit.directions.osm)}</span> ${ic('i-arrow')}`, 'link')}
          </div>
          <p class="v-note">${esc(t.visit.directions.note)}</p>
        </div>
        <div class="v-block">
          <h3 class="v-label">${esc(t.visit.phone.label)}</h3>
          <a class="v-tel" href="${telHref(ctx)}">${esc(cfg.contact.phoneDisplay)}</a>
          <button class="link v-copy js-copy-phone" type="button">${ic('i-copy')} <span>${esc(t.visit.phone.copy)}</span></button>
        </div>
        <div class="v-block">
          <h3 class="v-label">${esc(t.visit.hours.label)}</h3>
          <p class="status"><span class="js-status-pill pill"><i class="dot" aria-hidden="true"></i><span>${esc(t.hero.scheduleLabel)}</span></span><span class="js-open-note">${esc(ctx.scheduleShort)}</span></p>
          ${hoursList(ctx)}
          <p class="hours-note">${esc(t.visit.hours.note)}</p>
        </div>
      </div>
      <div class="v-map" data-reveal>
        <div class="map-card">
          <div class="map-slot" id="mapSlot" data-src="${attr(urls.osmEmbed)}" data-title="${attr(t.visit.map.iframeTitle)}">
            <div class="map-ph">
              ${ic('i-pin')}
              <p>${esc(ctx.lang === 'el' ? cfg.address.street_el + ', ' + cfg.address.locality_el : cfg.address.street_en + ', ' + cfg.address.locality_en)}</p>
              <small>${esc(t.visit.map.small)}</small>
              <button class="btn btn-ghost sm js-load-map" type="button">${esc(t.visit.map.load)}</button>
            </div>
          </div>
        </div>
        <div class="map-foot">
          <span>${esc(t.visit.map.attribution)}</span>
          <a href="${t.paths.privacy}#map">${esc(t.visit.map.privacy)}</a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="cta dark" id="book" aria-labelledby="h-book">
  <div class="container">
    <p class="eyebrow" data-reveal>${esc(t.cta.eyebrow)}</p>
    <h2 id="h-book" class="d1" data-reveal>${t.cta.h2}</h2>
    <div class="cta-actions d2" data-reveal>
      ${bookLink(ctx, `<span>${esc(t.cta.book)}</span> ${ic('i-arrow')}`, 'btn btn-primary lg')}
      <a class="btn btn-ghost lg" href="${telHref(ctx)}">${ic('i-phone')} <span>${esc(t.cta.call)}</span></a>
    </div>
    <p class="cta-note d3" data-reveal>${esc(t.cta.note)}</p>
  </div>
</section>
</main>
${footer(ctx, 'home')}
</body>
</html>
`;
}

export function renderLegal(ctx, kind) {
  const { t } = ctx;
  const L = t.legal[kind];
  const toc = `<nav class="toc" aria-labelledby="toc-h"><h2 id="toc-h">${esc(t.legal.contents)}</h2><ol>${L.sections.map(s => `<li><a href="#${s.id}">${esc(s.h)}</a></li>`).join('')}</ol></nav>`;
  return `${head(ctx, kind)}
<body>
${SPRITE}
${header(ctx, kind)}
<main id="main" tabindex="-1" class="legal">
  <div class="container">
    <article>
      <p class="eyebrow">${esc(t.footer.legal)}</p>
      <h1>${esc(L.h1)}</h1>
      <p class="lead">${esc(L.lead)}</p>
      <p class="updated">${esc(t.legal.updated)}</p>
      ${toc}
      ${L.sections.map(s => `<section id="${s.id}" aria-labelledby="h-${s.id}"><h2 id="h-${s.id}">${esc(s.h)}</h2>${s.html}</section>`).join('\n')}
      <p class="back"><a class="link" href="${t.paths.home}">${ic('i-arrow-l')} <span>${esc(t.legal.backHome)}</span></a></p>
    </article>
  </div>
</main>
${footer(ctx, kind)}
</body>
</html>
`;
}

export function renderNotFound(ctxEl, ctxEn) {
  const block = (ctx) => `<div class="nf-block" lang="${ctx.t.htmlLang}">
      <h1>${esc(ctx.t.notFound.h1)}</h1>
      <p>${esc(ctx.t.notFound.p)}</p>
      <div class="nf-actions">
        <a class="btn btn-primary" href="${ctx.t.paths.home}">${esc(ctx.t.notFound.home)}</a>
        ${bookLink(ctx, `<span>${esc(ctx.t.notFound.book)}</span> ${ic('i-arrow')}`, 'btn btn-ghost')}
      </div>
    </div>`;
  return `${head(ctxEl, 'notFound')}
<body>
${SPRITE}
${header(ctxEl, 'notFound')}
<main id="main" tabindex="-1">
  <div class="container nf">
    <div>
      <p class="big" aria-hidden="true">404</p>
      ${block(ctxEl)}
      ${block(ctxEn)}
    </div>
  </div>
</main>
${footer(ctxEl, 'notFound')}
</body>
</html>
`;
}
