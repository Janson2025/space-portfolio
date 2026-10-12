import {
  escapeHtml,
  getCategoryLabel,
  renderProjectLinks,
  renderProjectTags,
  safeExternalUrl,
} from './project-data.js';

export function initProjectArchive(catalog, archive) {
  const filters = document.querySelector('#category-filters');
  const resultCount = document.querySelector('#results-count');
  const viewButtons = document.querySelectorAll('.view-switch [data-view]');
  const selectedImages = new Map();
  let activeCategory = 'all';
  let activeView = 'grid';

  if (!filters || !resultCount) return;

  renderCategoryFilters(catalog, filters);

  function render() {
    const visibleProjects = activeCategory === 'all'
      ? catalog.projects
      : catalog.projects.filter((project) => project.categoryId === activeCategory);

    const categoryName = activeCategory === 'all'
      ? 'ALL CATEGORIES'
      : getCategoryLabel(catalog, activeCategory).toUpperCase();

    resultCount.textContent = `${String(visibleProjects.length).padStart(2, '0')} PROJECTS / ${categoryName}`;
    archive.classList.toggle('list-layout', activeView === 'list');
    archive.innerHTML = visibleProjects.map((project) => renderProjectCard(catalog, project, selectedImages)).join('');

    if (visibleProjects.length === 0) {
      showMessage(archive, 'No projects in this category yet.');
    }
  }

  filters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;

    activeCategory = button.dataset.category;
    filters.querySelectorAll('[data-category]').forEach((item) => {
      item.setAttribute('aria-pressed', String(item === button));
    });
    render();
  });

  viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeView = button.dataset.view;
      viewButtons.forEach((item) => {
        item.setAttribute('aria-pressed', String(item === button));
      });
      render();
    });
  });

  archive.addEventListener('pointerover', (event) => {
    selectGalleryImage(event.target.closest('[data-project-id]'), event.target.closest('[data-gallery-index]'));
  });

  archive.addEventListener('click', (event) => {
    const thumbnail = event.target.closest('[data-gallery-index]');
    if (!thumbnail) return;

    event.preventDefault();
    selectGalleryImage(thumbnail.closest('[data-project-id]'), thumbnail);
  });

  archive.addEventListener('focusin', (event) => {
    selectGalleryImage(event.target.closest('[data-project-id]'), event.target.closest('[data-gallery-index]'));
  });

  function selectGalleryImage(card, thumbnail) {
    if (!card || !thumbnail) return;

    const projectId = card.dataset.projectId;
    const selectedIndex = Number(thumbnail.dataset.galleryIndex);
    const project = catalog.projects.find((item) => item.id === projectId);
    const image = project?.gallery?.[selectedIndex];
    if (!image) return;

    selectedImages.set(projectId, selectedIndex);
    let mainImage = card.querySelector('[data-main-image]');

    if (!mainImage) {
      const placeholder = card.querySelector('.archive-art');
      if (!placeholder) return;

      mainImage = document.createElement('img');
      mainImage.className = 'archive-main-image';
      mainImage.dataset.mainImage = '';
      placeholder.replaceWith(mainImage);
    }

    mainImage.src = image.src;
    mainImage.alt = image.alt || project.title;

    card.querySelectorAll('.gallery-thumb').forEach((button) => {
      button.setAttribute('aria-pressed', String(button === thumbnail));
    });
  }

  render();
}

function renderCategoryFilters(catalog, region) {
  const allButton = `
    <button type="button" class="category-filter" data-category="all" aria-pressed="true">
      ALL PROJECTS <span class="count">${catalog.projects.length}</span>
    </button>
  `;

  const categoryButtons = catalog.categories.map((category) => {
    const count = catalog.projects.filter((project) => project.categoryId === category.id).length;

    return `
      <button type="button" class="category-filter" data-category="${escapeHtml(category.id)}" aria-pressed="false">
        ${escapeHtml(category.label.toUpperCase())} <span class="count">${count}</span>
      </button>
    `;
  }).join('');

  region.innerHTML = allButton + categoryButtons;
}

function renderProjectCard(catalog, project, selectedImages) {
  const gallery = project.gallery ?? [];
  const selectedIndex = selectedImages.get(project.id) ?? 0;
  const selectedImage = gallery[selectedIndex];
  const media = selectedImage
    ? `<img class="archive-main-image" data-main-image src="${escapeHtml(selectedImage.src)}" alt="${escapeHtml(selectedImage.alt || project.title)}">`
    : `<div class="archive-art" aria-label="Project artwork not added yet"><span>${escapeHtml(project.id.toUpperCase())} / VISUAL PENDING</span></div>`;

  const thumbnails = gallery.length > 0
    ? gallery.map((image, index) => `
      <button class="gallery-thumb" type="button" data-gallery-index="${index}"
        aria-label="Show image ${index + 1} for ${escapeHtml(project.title)}"
        aria-pressed="${index === selectedIndex}">
        <img src="${escapeHtml(image.src)}" alt="">
      </button>
    `).join('')
    : '<span class="gallery-empty">PROJECT IMAGES TO BE ADDED</span>';

  const primaryUrl = safeExternalUrl(project.links?.[0]?.url);
  const cardLink = primaryUrl
    ? `<a class="archive-project-link" href="${escapeHtml(primaryUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeHtml(project.title)}"></a>`
    : '';
  const category = escapeHtml(getCategoryLabel(catalog, project.categoryId).toUpperCase());
  const links = renderProjectLinks(project);

  return `
    <article class="archive-project" data-project-id="${escapeHtml(project.id)}">
      ${cardLink}
      <div class="archive-media">${media}</div>
      <div class="gallery-strip">${thumbnails}</div>
      <div class="archive-content">
        <span class="archive-category">${category}</span>
        <h2>${escapeHtml(project.title)}</h2>
        <p>${escapeHtml(project.description)}</p>
        <div class="archive-tags">${renderProjectTags(project.technologies)}</div>
        ${links ? `<div class="archive-links">${links}</div>` : ''}
      </div>
    </article>
  `;
}

function showMessage(region, message) {
  const note = document.createElement('p');
  note.className = 'loading-note';
  note.textContent = message;
  region.replaceChildren(note);
}
