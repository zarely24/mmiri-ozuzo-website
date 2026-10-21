# Private launch checklist — missing information, permissions and review items

Nothing on this list is published as a placeholder. Where a value is missing, the site says the minimum that is true (for example the trade name instead of a legal name) and the build prints a warning. Items marked **Blocker** must be resolved before the site goes live; items marked **Legal review** need a Greek lawyer's confirmation; items marked **Confirm** need a yes/no or a value from the owner.

## Blockers

| # | Item | Where it goes | Status |
|---|---|---|---|
| 1 | **Production domain.** The prototype assumed `www.mmiriozuzo.gr`; no DNS record exists for it or for `mmiriozuzo.com`, `mmiri-ozuzo.gr`, `.com`, `.eu` (checked 2026-10-21), so the name appears to be unregistered. Decide and register, then set `baseUrl` in `site.config.json` and rebuild. Canonicals, hreflang, sitemap, robots, Open Graph URLs and the JSON-LD all derive from it. | `site.config.json → baseUrl` | **Blocker** |
| 2 | **Legal identity of the controller / operator**: the legal entity or sole-trader name that runs the shop (as on the tax registration). Required in the privacy policy (GDPR Art. 13(1)(a)) and the operator-information section. | `site.config.json → legal.controllerLegalName` | **Blocker** |
| 3 | **Hosting provider and log retention** (provider name, country, how long access logs are kept). The privacy page currently says "our hosting provider" and defers to its policy. | `legal.hostingProvider`, `legal.logRetention_el`, `legal.logRetention_en` | **Blocker** (can be filled the day hosting is chosen) |
| 4 | **Opening hours** as listed on ebarber on 2026-10-21 (Mon closed; Tue, Thu, Fri 11:00–19:00; Wed 10:00–16:30; Sat 10:30–17:00; Sun closed). Confirm or correct. | `hours.week` | **Confirm** |
| 5 | **Services, prices, durations** as listed on ebarber on 2026-10-21 (16 items; €3 surcharge on Christmas/Easter/14 August). Confirm, or set `services.showPrices` to `false` to publish the list without prices. | `services` | **Confirm** |

## Content facts to confirm with the owner

| # | Item | Why |
|---|---|---|
| 6 | The founder's name spelling in Greek and Latin (site uses Βασίλης Μοναστηρλής / Vasilis Monastirlis) and that he is the barber taking bookings today (ebarber lists only "Βασίλης Μ."). | Story and JSON-LD `founder` |
| 7 | Whether the conserved ceiling painting (copy after Boucher) described in the 2019 feature is still in the shop. The site attributes it to "the 2019 feature"; if it is gone, remove the sentence. | Story, chapter II |
| 8 | Whether massage, facials, manicure/pedicure and the "club" loyalty model described in 2019 still exist. The site does **not** mention them; add only if they are still offered and bookable. | Services |
| 9 | The meaning of the name ("storm" in Igbo, per the founder in 2019). The site attributes it to the founder. | Story, chapter III |
| 10 | Any claim of being the "first" barbershop: the site deliberately does **not** make it. If the owner wants a "first" claim, supply evidence and we will assess its exact scope and wording (for example "one of the first modern barbershops in Athens after 2000"). The ebarber description "The No1 Stylish BARBERSHOP in GREECE" is also not used. | Story, hero |
| 11 | Social profiles (Instagram, Facebook, TikTok): none are linked because none could be verified. Provide the exact URLs if they should appear. | Footer, JSON-LD `sameAs` |
| 12 | A contact email for privacy requests (optional; without one the page points to phone and post). | `contact.email` |
| 13 | Whether the shop wants the Greek-language ebarber page used for Greek visitors instead of the English one. The brief required the `/en/` ebarber URL for every CTA, so that is what ships. | `booking.url` |

## Permissions

| # | Item |
|---|---|
| 14 | **Photographs (Blocker).** The build uses nine photos from the shop's own ebarber listing as a staging set (`site.config.json → images._status`). Before launch: written rights confirmation from the owner, the original high-resolution files, and consent from the recognisable clients in seven of them. Exact sources and the per-photo status are in `docs/ASSET-REGISTER.md`; the ask list is in `docs/SHOT-LIST.md`. If any client cannot be reached, swap that photo for one without a face. |
| 15 | Logo: the official green mountain-peak mark is visible in the hero photo as neon; supply the logo files (SVG/AI/PDF) and confirm the site may use them. The raspberry monogram favicon and nav mark are stand-ins pending approval. |
| 16 | Press: the site links to iefimerida.gr and ERT's YouTube video and quotes only their titles. No article text or video frames are reproduced; no permission needed for linking. |
| 17 | Award badge ("Χρυσή Εταιρεία"): not shown. Only add with the programme's permission and proof of the award. |

## Legal review (Greek lawyer)

| # | Item | Current implementation |
|---|---|---|
| 18 | **Roles with ebarber.** ebarber's privacy policy names BOOKING HERO I.K.E. and states that businesses are "data controllers" and ebarber a "data processor" for data users give to a business, but it is not explicit for booking data. The site's privacy page says the shop is controller for the appointment data it receives. Confirm against the shop's contract with ebarber and adjust section 5 if the contract says otherwise. | `src/content/*.mjs → legal.privacy.sections[booking]` |
| 19 | **Operator disclosures.** Presidential Decree 131/2003 (e-commerce / information-society services) requires providers to display name, address, email, GEMI number, VAT number and supervisory authority where applicable. Whether a purely informational site with external booking is an "information society service" should be confirmed; the operator section is ready to show GEMI/VAT (`legal.gemi`, `legal.vat`) once supplied. | Terms page, section 1 |
| 20 | **Consumer information.** No sale happens on the site; Law 2251/1994 pre-contractual information is provided at the point of booking by ebarber and at the shop. Confirm nothing further is required on the website. The terms page mentions the Consumer's Ombudsman for ADR. | Terms page, sections 2–4, 9 |
| 21 | **Cookies / ePrivacy.** The site sets no cookies and uses no browser storage, so no consent banner is shown (Law 3471/2006 Art. 4(5); HDPA guidance on cookies). The click-to-load map is treated as consent by action with prior information. Confirm this assessment. | Privacy page, sections 4 and 8 |
| 22 | **International transfer.** The map, when loaded, sends the visitor's IP to the OpenStreetMap Foundation (UK). The page relies on the EU adequacy decision for the UK; confirm the adequacy decision's current status at launch. | Privacy page, section 4 |
| 23 | **Retention wording.** Appointment data: "as long as needed for the appointment, changes or cancellations, and serving you as a customer". Replace with a concrete period if the shop keeps records (for example for accounting). Phone-call data: no concrete period stated. | Privacy page, sections 5–6 |
| 24 | **Accessibility obligations.** The European Accessibility Act (Directive (EU) 2019/882, transposed by Law 4994/2022) applies from 28 June 2025 to listed services such as e-commerce; a small informational site with no online sales appears out of scope, and Law 4591/2019 applies to the public sector. The site targets WCAG 2.2 AA regardless. Confirm the assessment. | Terms page, section 8 |
| 25 | **Governing-law / liability clauses** in the terms page — standard wording, to be checked. | Terms page, sections 7, 9 |

## Operational (after the above)

- Set `legal.lastUpdated` to the launch date and rebuild.
- Verify the domain in Google Search Console and submit the sitemap (see `docs/DEPLOYMENT.md`).
- Add the website URL and the ebarber appointment URL to the existing Google Business Profile; do not create a new profile.
- Keep name, address, phone and hours identical across the website, ebarber and Google Business Profile.
