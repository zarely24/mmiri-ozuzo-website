# Photography: what is in the build, what is missing (for the owner)

The site now uses nine photographs taken from the shop's own ebarber listing (see `docs/ASSET-REGISTER.md` for the exact source URL of each). They are good enough to evaluate the design and to launch at phone and laptop sizes, but three things are missing before the site can go live with them.

## 1. Written confirmation of rights

One line from the owner, per photo or for the whole set: "These photos were taken by me / my staff / photographer X for the shop, and the shop may publish them on its website." If a professional photographer took any of them, we need their permission or licence as well.

## 2. Original files

The listing copies are 1080–1400 px (Instagram size). For a full-bleed hero on large screens and for crisp gallery tiles on high-density phones we need the originals straight from the phone or camera, ideally ≥ 2400 px on the long edge. Drop them into `src/img/originals/` with the same filenames and run:

```bash
python tools/images.py && node tools/make-icons.mjs && node build.mjs
```

## 3. Consent from recognisable people

| Photo (slot) | Who is recognisable | Needed |
|---|---|---|
| `hero-mobile.jpg` (phone hero) | one client, profile | written yes |
| `story.jpg` (shopfront) | one client at the door, profile | written yes, or a frame of the façade without people |
| `gallery-01.jpg` | two men in the chairs (one may be staff) | written yes from both |
| `gallery-03.jpg`, `gallery-04.jpg`, `gallery-05.jpg`, `gallery-06.jpg` | one client each | written yes from each |
| `hero.jpg` (desktop hero), `band.jpg` (razor shave) | nobody identifiable | nothing further |

Children: a parent's or guardian's consent. Staff: written consent too. If a client cannot be reached, swap that photo for one without a face; the config makes this a one-line change.

## Shots that would still improve the site

| Slot | What to shoot | Why |
|---|---|---|
| Hero (desktop) | The same interior view, but in the morning with daylight and the neon on, 3:2, no filter, ≥ 3000 px | The current cover photo is slightly soft and bright at the top |
| Façade | Κολοκοτρώνη 10 from across the street, no people, signage legible | Replaces the client-at-the-door photo in the Story section |
| The neoclassical room | If the conserved ceiling painting described in 2019 still exists, one wide frame of it | It is the most distinctive thing about the building and we have no photograph of it |
| Barber at work | Vasilis mid-cut from the side, hands and scissors in focus, client's face turned away | Adds the barber to the page without needing a client's consent |
| Detail | Tools on the station: straight razor, shears, brush | Interchangeable gallery tile |
