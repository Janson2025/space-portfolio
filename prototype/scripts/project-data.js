const catalogUrl = new URL('../../data/projects.json', import.meta.url);

export async function loadProjectCatalog() {
  const response = await fetch(catalogUrl);
  if (!response.ok) throw new Error('Project catalog could not be loaded.');

  return response.json();
}

export function getCategoryLabel(catalog, categoryId) {
  return catalog.categories.find((category) => category.id === categoryId)?.label ?? 'Other';
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return entities[character];
  });
}

export function safeExternalUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

export function renderProjectLinks(project) {
  return (project.links ?? [])
    .map((link) => {
      const url = safeExternalUrl(link.url);
      if (!url) return '';

      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)} ↗</a>`;
    })
    .filter(Boolean)
    .join('');
}

export function renderProjectTags(technologies = []) {
  return technologies.map((technology) => `<span>${escapeHtml(technology)}</span>`).join('');
}
