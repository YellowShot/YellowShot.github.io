# João Peres Moreira — portfolio

Personal site of a Senior Technical Consultant working on Power Platform, Dynamics 365 and Finance & Operations: automation and integrations for companies across Europe.

**Live:** https://jperesmoreira.com

## What's inside

- **Data-dot portrait** — the hero photo rebuilt from canvas dots that assemble on load, scatter under the cursor and ripple on click.
- **My path** — a pinned, sideways-scrolling life timeline from 2017 to today.
- **Selected work** — projects newest first, linked both ways to an isometric card-index drawer and a "run details" panel.
- **How I deliver** — a scroll-scrubbed run through five delivery stages and their deliverables.
- **Keycaps** — an isometric keyboard in Contact; what a visitor types becomes the body of the email.
- A living data-grid background, section arrows, light and dark themes, and full `prefers-reduced-motion` support.

The two isometric figures are built with the [Hairline](https://github.com/lucasmarkes/hairline) line-drawing engine.

## Stack

Plain HTML, CSS and JavaScript. No framework, no build step.

```
index.html          the page
assets/content.js   ALL text and data (edit this file to update the site)
assets/styles.css   design tokens and styles
assets/app.js       rendering, interactions, figure hosting
assets/motion.js    background grid, timeline and delivery-story scroll effects
assets/portrait.js  the data-dot portrait engine
assets/kernel.js    Hairline engine (unchanged)
figure/*.js         the Keycaps and Index figures
```

## Run locally

Any static server works, for example:

```bash
python -m http.server 8000
```

Then open http://localhost:8000. Opening `index.html` directly from disk will not load the figure modules.

## Updating

Edit `assets/content.js` and push. After changing CSS or JS, bump the `?v=` version on the asset links in `index.html` so returning visitors don't get a stale cached copy.
