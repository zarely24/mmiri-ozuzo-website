# Asset source and permission register

Status date: 2026-10-21 (redesign). "Included" means the file ships in `dist/`.

**Important.** The photographs now used across the site all come from the shop's own listing on ebarber.gr, where the business uploaded them to present itself. That is the strongest available indication that the shop holds the rights, but it is **not** written permission. Public visibility is not a licence. Before launch the owner must (1) confirm in writing that the shop owns or is licensed to use each photo on its website, (2) supply the original files (the listing copies are 1080–1400 px, Instagram-sized), and (3) confirm consent from every recognisable client. Until then the build is a **staging build**; the config carries `images._status: PENDING OWNER CONFIRMATION` and the launch checklist blocks deployment.

## Photographs in the build (all pending owner confirmation)

Source files are mapped in `src/img/originals/SOURCES.txt`; the full list of listing URLs is in `tests/reports/ebarber-image-urls.txt`.

| Slot | Local file | Source URL (ebarber listing, read 2026-10-21) | What it shows | Creator | People / consent | Placement | Missing before launch |
|---|---|---|---|---|---|---|---|
| Hero (desktop) | `hero.jpg` 1388×836 | https://www.ebarber.gr/photo/uploads/FeKJ6gwvtj2jUVPtJsxA842hyD9LIt566WQDDqjR_c.jpg | Interior: black counter, neon mountain-peak logo, barber chair, pinball machine. Third-party branding (Sailor Jerry, Austin Powers artwork) appears incidentally as part of the premises | Unknown (listing cover photo) | One person far in the background, not identifiable | Full-bleed hero, Open Graph image, JSON-LD `image` | Rights confirmation; a higher-resolution original (≥2400 px) for large screens |
| Hero (mobile) | `hero-mobile.jpg` 1242×1552 | https://www.ebarber.gr/photo/uploads/eMzVqlSwCMR2tTHKbErfMzwUf7aitgHlHkFBBqkb.jpg | Clean fade by the window, striped cape | Unknown | **Client identifiable (profile)** → written consent needed | Hero on screens ≤720 px | Rights + client consent |
| Photo band | `band.jpg` 1080×1350 | https://www.ebarber.gr/photo/uploads/3ns2wFPooalNuqiWNakJoNGUuymmx3xZhAEMkePX.jpg | Straight-razor shave: barber's gloved hand, razor, client's neck and ear | Unknown | Client not identifiable (no face); barber's tattooed hand visible | Full-width editorial band between Services and Story | Rights confirmation |
| Story | `story.jpg` 1107×1107 | https://www.ebarber.gr/photo/uploads/MXflL9m6UnoLHJi6CZQ6ruFpzb4yJaW9FP4GukW6.jpg | The shopfront at Κολοκοτρώνη 10: signage, "Shave" and "Haircut" signs, a client at the door | Unknown | **Client identifiable (profile)** → consent needed | Story section, 4:5 | Rights + client consent; ideally a frame of the façade without people |
| Gallery 1 | `gallery-01.jpg` 1200×1200 | https://www.ebarber.gr/photo/uploads/ukjZdd1sQAYyCnrVZMOejf1b4BjZvqNnhDnIvGta.jpg | Two men in the barber chairs under the neon, shelves, arcade cabinet | Unknown | **Two identifiable people** (one may be staff) → consent needed | Gallery (wide tile) | Rights + consent |
| Gallery 2 | `gallery-02.jpg` 664×1080 (crop) | https://www.ebarber.gr/photo/uploads/s1DmHf6j1zaw7o2wvdxyL8p9ygFlE2lUehI7YttZ.jpg | Right 53 % of the frame: vintage chrome barber chairs and the skateboard wall. **Cropped to exclude a group of five people** | Unknown | None after crop | Gallery | Rights; a sharper original (the crop is only 664 px wide) |
| Gallery 3 | `gallery-03.jpg` 1080×1080 | https://www.ebarber.gr/photo/uploads/OxSYuNXbBKxaSOI1N37kh4vBbpNezEqHL1oW2oEQ.jpg | Client with bleached hair and shaped beard, in the chair | Unknown | **Identifiable** → consent | Gallery | Rights + consent |
| Gallery 4 | `gallery-04.jpg` 1080×1080 | https://www.ebarber.gr/photo/uploads/dR8clOvzmtjxD9J9KOIVD8SfkpujVgKi75agEyIH.jpg | Fade with a side line and groomed beard | Unknown | **Identifiable (profile)** → consent | Gallery | Rights + consent |
| Gallery 5 | `gallery-05.jpg` 1080×1080 | https://www.ebarber.gr/photo/uploads/MmDFR4uwnDN9dVAPkdjvc4praYSFdiW50zIkMdw6.jpg | Short cut with clean lines, client with glasses | Unknown | **Identifiable** → consent | Gallery | Rights + consent |
| Gallery 6 | `gallery-06.jpg` 1080×1080 | https://www.ebarber.gr/photo/uploads/FXiQJHanOzqq1buB0hOyuiFdmQV7kqUngE6hhAsa.jpg | Classic scissor cut, client with grey hair | Unknown | **Identifiable (profile)** → consent | Gallery | Rights + consent |

Processing: each original is resized by `tools/images.py` to 480 / 800 / 1200 px (plus native width) in AVIF, WebP and JPEG; the site serves them through `<picture>` with `srcset`/`sizes`, explicit width/height, lazy-loading below the fold and `fetchpriority="high"` on the hero. No filters are applied.

## Listing photographs reviewed and **not** used

| Source URL | Reason |
|---|---|
| https://www.ebarber.gr/photo/uploads/89Wzwvl9hrwRRZkSLTWY107ToG38oLcWUIrkjVYh.jpg | Wedding-day photo of a client with guests in the background; almost certainly a third-party event photographer's work. Not suitable. |
| https://www.ebarber.gr/photo/uploads/RTGYPk8obW1TuRu63UoNFKPO4qymC5h1dephIeAT.jpg | 750 × 750 px, too small. |
| https://www.ebarber.gr/photo/uploads/4vJ46TkpzjaCz0JC1ah8ROTCJIdbaImNnrdmUrOB.jpg, …/Fp5z13yM3c5vS299E7xaFQ916JefEtlgg7z31iLf.jpg, …/Qh8ZTrfhdUBwbR3uBBCwc83b0wV9JmTtqGnS2m59.jpg, …/lDi3fo3z23J5oMFj1N0Wj77Z5AaWkoxi5l4Sz1az.jpg | Frontal client portraits; identifiable faces with no evident shop context. Kept out to limit consent exposure; can be added later with consent. |
| https://www.ebarber.gr/photo/uploads/LCT3PBct5pGmoKSxkQe7c7c958OF8F23j7sAbdx5_c_thumb.jpg | Official logo thumbnail (150 px). Not reproduced; see Brand assets. |

## Other sources considered and not used

| Source | Why not |
|---|---|
| Press photographs in the iefimerida.gr feature (26 Jan 2019) | Publisher / photographer copyright; the article is linked, not reproduced. They would be the only images of the neoclassical interior described in 2019; ask the owner whether the shop has its own photos of that room. |
| ERT video (YouTube) frames and thumbnail | ERT copyright; video content was not accessible from this environment, only its title. Linked only. |
| Google Maps / Street View imagery | Google terms do not permit reuse. |
| "Χρυσή Εταιρεία" listing badge | Programme artwork; no verified award. |
| Instagram / Facebook | No verified account; not scraped. |
| Stock or generated imagery | Deliberately none. Every image on the site is of the real premises or work. |

## Brand assets

| Asset | Source | Status | Included |
|---|---|---|---|
| Official logo: green mountain-peak mark with "mmiri ozuzo BARBER SALON" wordmark | Visible in the hero photo (neon) and as a 150 px listing thumbnail | Owner must supply vector/high-resolution files; not reproduced | No |
| Proposed monogram favicon ("M" peaks on raspberry, `src/img/favicon.svg`) and nav/footer mark (`src/img/mark.svg`) | Original, created for this project; the raspberry #C2185B is taken from the shop's own "Shave / Haircut" signage, the peak shape nods to the official mark without copying it | Proposed, pending approval; replace with the official mark once supplied | Yes (SVG, ICO, PNG 16/32/48/192/512, Apple touch icon) |
| Social-sharing image `og.png` 1200×630 | Generated from the hero photograph with the wordmark and the raspberry label | Same rights status as the hero photo | Yes |

## Fonts, map, text sources

Unchanged from the first delivery: Literata and Commissioner (SIL OFL 1.1, self-hosted, licence files shipped); OpenStreetMap click-to-load embed and link (© OpenStreetMap contributors, ODbL), Google Maps directions link; text facts from the ebarber listing, the 2019 iefimerida feature and the ERT video title, with original copy and no reproduced prose.

## What to ask the owner (one message)

1. "Do you own these photos, or did a photographer take them for the shop? Can we use them on the website?" — attach the ten source URLs above.
2. "Do you have the original files (phone or camera) for these, and any wider shots of the room, the façade without people, and the neoclassical interior?"
3. "Are the clients in photos 2, 4, 5, 6, 7, 8 and 9 (hero-mobile, story, gallery 1, 3, 4, 5, 6) happy to appear on the website? A short written yes from each is enough."
4. "Please send the logo files (SVG/AI/PDF or a large PNG)."
