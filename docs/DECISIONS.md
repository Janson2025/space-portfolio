# Portfolio Prototype: Decisions and Questions

This log captures decisions that affect the prototype and production direction. Update it as the design reveals useful content fields.

## Decisions made

| Header behavior | Sticky at the top of the viewport | Agreed |
| CSS structure | Split into tokens, foundations, navigation, shared components, home, projects, and responsive modules | Agreed |
| Home hero responsive order | Desktop title may overlap the layered ship artwork; mobile order is title, image, then supporting details | Agreed |

| Topic | Direction | Status |
|---|---|---|
| Working site name | James Portfolio | Agreed for now |
| Portfolio identity | James Call; Software Engineering BS (BYU–Idaho, April 2025) | Supplied in resume |
| Public contact | Email, LinkedIn, GitHub links; phone withheld from prototype for now | Initial choice |
| Role statement | Invent a temporary statement | Agreed |
| Prototype stack | Vanilla HTML, CSS, JavaScript, JSON | Agreed |
| Frontend | React, TypeScript, Vite, and React Three Fiber are active for the Home and Projects routes | Implemented |
| Future backend | ASP.NET Core / C# | Agreed |
| Visual identity | Professional, clean, semi-retro, slightly gritty sci-fi/space | Agreed |
| Palette | Copper amber, metallic dim teal/cyan, retro red, peach metallic tan, dark violet titanium | Direction agreed; refine in CSS |
| First page | Home/Splash | Agreed |
| Initial ship visual | Static image/treatment | Agreed |
| Experimental image masking tool | Keep the standalone HTML/CSS/JS editor outside the portfolio runtime; revisit its effect during the React migration | Agreed |
| Projects | Resume and pasted project records merged into an 11-project catalog; title, description, technologies, links, category, and gallery | Agreed |
| Project categories | Interactive 3D, Web Applications, Science & Data, Games & Mobile, 3D & Motion | Prototype taxonomy |
| Project archive | Category filters and card/list switch; gallery first image is the main preview and hover/click/focus select other images | Agreed direction, prototype implemented |
| Project layouts | Provide a control to switch between card and list layouts | Agreed |
| Gallery behavior | Gallery's first image is the thumbnail; hover or click on another image changes the main image | Agreed |
| Project destination | Optional external project site or GitHub; some projects may have no link | Agreed |
| Blog | Include as a future separate page | Agreed |
| Store | Future store; models mostly GLB-style | Direction agreed; details deferred |
| Contact links | Stub versions for now | Agreed |
| Backend schema | Refine while designing the prototype | Agreed |

## Portfolio projects captured from the resume

- USU Aerospace Wingcraft Web Application: React Three Fiber/Three.js, Blender, Node.js; interactive wing modeling, real-time adjustments, animated flight paths, shared group data.
- Drug Screening Analysis: Python and flow cytometry; resume reports 200+ hours saved and approximately $1,500 in reduced labor costs; peer-reviewed study link supplied.
- Paleobiological GIS: JavaScript/CSS educational map of fossil sites across geologic time.
- Android maze-solving game: Java/Android Studio.
- Crafted Cores product advertising: Blender and After Effects animation.

The canonical categorized project catalog is `data/projects.json`; the cleaned pasted subset remains in `data/projects-curated.json`. Profile, experience, education, contact links, and skills are in `data/profile.json`. Each project has an optional `links` array and a `gallery` array; the first gallery image is the main project image. Gallery arrays are intentionally empty until project media is supplied.

Prior ChatGPT project areas include a metabolic pathway React Three Fiber project, a Rubik’s Cube portfolio, and an image-reveal library. Their status, ownership, and preferred writeups should be confirmed before adding them as featured portfolio projects.

## Open questions for later

- Which additional project histories from prior ChatGPT work should be included? A separate WorldBuilder/.NET learning project appears in prior chat history; confirm whether it belongs in the public portfolio before adding it.
- What actual biography and experience details should be emphasized?
- What exact color values, fonts, and visual references best match the intended tone?
- Should gallery image changes be hover-only, click-only, or both? (Current direction: support both.)
- What external destinations should be considered safe/expected for project links?
- What formats, licenses, pricing, and delivery rules will the store use?
- Which contact channels and resume link should replace stubs?
- Which database, hosting, authentication, and payment services fit the production version?

## Assumptions for the first design pass

- Use clearly invented identity copy and sample content, not fabricated claims about real work.
- Review Home/Splash before building out the rest of the site.
- Portfolio and contact access must not depend on using the future 3D scene.
- The prototype demonstrates store presentation only; it does not promise payment or digital delivery.
