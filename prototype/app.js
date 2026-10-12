import { initSiteUi } from './scripts/site-ui.js';
import { loadProjectCatalog } from './scripts/project-data.js';
import { renderFeaturedProjects } from './scripts/featured-projects.js';
import { initProjectArchive } from './scripts/project-archive.js';

initSiteUi();

const featuredRegion = document.querySelector('#featured-projects');
const archiveRegion = document.querySelector('#project-archive');

if (featuredRegion || archiveRegion) {
  loadProjectCatalog()
    .then((catalog) => {
      if (featuredRegion) renderFeaturedProjects(catalog, featuredRegion);
      if (archiveRegion) initProjectArchive(catalog, archiveRegion);
    })
    .catch(() => {
      showLoadError(featuredRegion, 'Selected work is temporarily unavailable.');
      showLoadError(archiveRegion, 'The project archive is temporarily unavailable.');
    });
}

function showLoadError(region, message) {
  if (!region) return;

  const note = document.createElement('p');
  note.className = 'loading-note';
  note.textContent = message;
  region.replaceChildren(note);
}
