import {
  escapeHtml,
  getCategoryLabel,
  renderProjectLinks,
  renderProjectTags,
} from './project-data.js';

export function renderFeaturedProjects(catalog, region) {
  const featuredProjects = catalog.projects
    .filter((project) => project.featured)
    .slice(0, 3);

  if (featuredProjects.length === 0) {
    showMessage(region, 'Selected projects will appear here soon.');
    return;
  }

  region.innerHTML = featuredProjects.map((project) => {
    const category = escapeHtml(getCategoryLabel(catalog, project.categoryId).toUpperCase());
    const links = renderProjectLinks(project);
    const coverImage = project.gallery[0];

    return `
      <article class="project-card">
        <div class="project-art" aria-hidden="true">
          ${coverImage ? `<img class="project-art-image" src="${escapeHtml(coverImage.src)}" alt="">` : ''}
          <span class="art-index">PROJECT / ${escapeHtml(project.id.toUpperCase())}</span>
          <span class="art-type">${category}</span>
        </div>
        <div class="project-content">
          <span class="project-category">${category}</span>
          <h3>${escapeHtml(project.title)}</h3>
          <p>${escapeHtml(project.description)}</p>
          <div class="project-tags">${renderProjectTags(project.technologies)}</div>
          ${links ? `<div class="project-links">${links}</div>` : ''}
        </div>
      </article>
    `;
  }).join('');
}

function showMessage(region, message) {
  const note = document.createElement('p');
  note.className = 'loading-note';
  note.textContent = message;
  region.replaceChildren(note);
}
