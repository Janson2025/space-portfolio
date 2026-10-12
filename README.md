# James Portfolio

The active portfolio is built with React, TypeScript, Vite, and React Three Fiber. `data/projects.json` is the canonical categorized project catalog; `data/profile.json` holds profile, education, experience, contact, and skills data.

## Run locally

```sh
npm install
npm run dev
```

Vite prints a local URL to open in the browser. `npm run build` creates the production bundle in `dist/`, and `npm run preview` serves that build locally.

To compare against the original vanilla prototype while Vite is running, open `/prototype/index.html` or `/prototype/projects.html` at the local development URL.

## Project structure

- `src/` — React app, routes, components, data types, and the R3F hero effect.
- `styles/` and `styles.css` — shared visual system carried over from the prototype.
- `data/` — canonical portfolio content used by the React app.
- `prototype/` — preserved vanilla HTML/CSS/JavaScript reference pages.
- `experiments/image-mask-editor/` — standalone masking experiment, separate from the portfolio runtime and retained for a future React port.
- `assets/images/reference/` — earlier banner images retained as visual references.

The current React routes cover Home and Projects. Blog, About, and Store remain planned. The Home hero keeps the nebula background separate from the R3F scene. Static text and project navigation remain usable if WebGL is unavailable or reduced motion is requested.

The hero now uses an R3F cube preview in the banner ship slot; the ship illustration remains as a loading/WebGL fallback. The scene structure and Spiderhawk GLB audit/update plan are documented in [docs/3d-scene-and-ship-asset-plan.md](docs/3d-scene-and-ship-asset-plan.md).

## Project data shape

Each project has an `id`, `title`, `description`, `categoryId`, `technologies`, optional `links`, a `featured` flag, and a `gallery` array. Each gallery item has a `src` and optional `alt`; the first gallery item is the card’s main image. Categories are defined once in the catalog and referenced by `categoryId`.

Project card images live in `public/images/projects/`. These are generated concept illustrations to evoke each project's subject and the site's retro-futurist palette; they are not screenshots of the actual applications. Replace them with project screenshots or renders as those become available.
