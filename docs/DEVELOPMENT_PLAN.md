# Portfolio Prototype Development Plan

## Purpose

Establish the visual direction and content model for a full-stack portfolio. The initial vanilla prototype is preserved as a design reference; the active frontend is now React with TypeScript and React Three Fiber. The backend and store remain future work. Development starts with the Home/Splash page.

## Product goals

- Present James as a capable web designer, web developer, and software engineer.
- Create a memorable, professional, semi-retro, slightly gritty sci-fi identity.
- Make projects and professional information easy to find and read.
- Introduce a future interactive spacecraft and character experience without making essential content depend on 3D or WebGL.
- Establish a credible path toward selling downloadable 3D models.
- Use the prototype to refine what content and fields belong in the eventual backend.

## Audiences and primary tasks

1. A recruiter or potential client wants to understand James's skills and inspect relevant work.
2. A visitor wants to explore the portfolio and contact James.
3. A prospective customer wants to inspect 3D models and understand licensing and purchase options.

## Site map

- Home/Splash: introduction, role statement, calls to action, and optional ship experience. This is the first page to design.
- Projects: project list with switchable card and list layouts; each item includes a thumbnail, image gallery, title, and description. Selecting an item may open a live site, GitHub repository, or have no external destination.
- Blog: future writing and articles page.
- About: professional story, strengths, tools, and experience.
- Store: future catalog of 3D models, mostly GLB format.

Use shared navigation and footer. The sci-fi metaphor should decorate, not obscure, the meaning of navigation.

## Design principles

- Professional first: clear hierarchy, legible case studies, and obvious contact paths.
- Sci-fi as atmosphere: charcoal metal surfaces, restrained color accents, technical details, and subtle texture. Avoid making every section look like a game HUD.
- Palette direction: copper/amber orange, dim metallic teal/cyan blue, retro red, peach metallic tan, and dark violet titanium. Exact values are prototype tokens to refine visually.
- 3D as enhancement: begin with a static ship image/treatment on Home. The future 3D scene is optional, with direct links to portfolio content. Layer the ship separately over the supplied nebula background, and use the luminance mask to blend the background into the page.
- Responsive and accessible: keyboard navigation, visible focus, adequate contrast, semantic HTML, reduced-motion support, and mobile layouts.
- Reusable system: define colors, spacing, type, buttons, cards, and page layout as shared CSS tokens and grouped style modules for foundations, shared components, navigation, page styles, and responsive rules so they can migrate to React components.

## Prototype scope and sequence

1. Home/Splash: establish visual identity, role statement, supplied banner artwork, navigation, primary calls to action, and resume-based featured work.
2. Review and refine layout, typography, color, and interaction on desktop and mobile.
3. Projects: use the merged JSON catalog, category filters, JSON-driven galleries, and card/list view switching.
4. Blog, About, and Store: build these pages using the shared design system.
5. Contact: add stub links when the relevant content is decided.
6. Review keyboard access, reduced motion, responsive behavior, and data fields needed for the backend.

## Content sources and accuracy

Use James Call’s supplied resume and project links for factual biography and featured project details. The project summary copy should stay close to the resume, especially when stating outcomes or scale. Use the old portfolio as an additional reference where it can be accessed. The linked GitHub repository is a React/Vite starter and does not provide detailed project writeups; the supplied resume is the current source for the portfolio examples.

## Prototype content and fields

Sample content must not imply fabricated client outcomes are real. The current catalog has a `schemaVersion`, shared categories (`id`, `label`), and projects with `id`, `title`, `description`, `categoryId`, `technologies`, optional `links` (`label`, `url`), `featured`, and `gallery` (`src`, optional `alt`). The first gallery item is the primary project image. `data/profile.json` holds profile, contact, education, experience, and skills data. Treat this as the prototype contract; revise it deliberately as the design and admin needs become clearer.

Future likely content types: Project, BlogPost, Product, Profile, ContactLink. Treat this as a working model, not a final schema.

## Production direction

- Frontend: React with TypeScript, Vite, routing, and React Three Fiber for the optional Home experience and product previews. The current migration covers Home and Projects; the remaining routes are planned.
- Backend: ASP.NET Core Web API in C# with authenticated admin endpoints.
- Persistence: relational database for portfolio content, product metadata, users/roles, and orders as needed.
- Commerce: payment provider integration with server-side verification and protected digital delivery.
- Admin: authenticated CRUD for selected site content and catalog data; enforce authorization on the API.
- Integration: define API contracts and content schemas before connecting the React app. Keep public content readable independently from admin workflows.

Database, hosting, authentication provider, payment provider, and deployment topology remain open production decisions.

## Acceptance criteria for the Home/Splash page

- Clearly identifies James and communicates a concise professional role statement.
- Provides obvious paths toward projects and contact.
- Establishes the sci-fi visual identity without compromising readability.
- Shows a static ship treatment as a preview of the future interactive scene.
- Remains usable without animation or WebGL and adapts to mobile widths.
- Exposes reusable design tokens and content fields that can guide later pages/backend decisions.
