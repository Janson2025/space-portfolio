import { useMemo, useState } from 'react';
import projectsData from '../../data/projects.json';
import { ProjectCard } from '../components/ProjectCard';
import type { ProjectCatalog } from '../types';

const catalog = projectsData as ProjectCatalog;

export function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const visibleProjects = useMemo(() => activeCategory === 'all'
    ? catalog.projects
    : catalog.projects.filter((project) => project.categoryId === activeCategory), [activeCategory]);

  const categoryLabel = activeCategory === 'all'
    ? 'ALL CATEGORIES'
    : catalog.categories.find((category) => category.id === activeCategory)?.label.toUpperCase() ?? 'OTHER';

  return (
    <div className="projects-page">
      <section className="projects-intro">
        <div className="section-kicker"><span>ARCHIVE / 01</span><span>SOFTWARE · SCIENCE · 3D</span></div>
        <div className="projects-title-row">
          <div><p className="eyebrow">SELECTED BUILDS &amp; EXPERIMENTS</p><h1>PROJECT<br /><span className="outlined">ARCHIVE.</span></h1></div>
          <p className="projects-lede">A collection of tools, experiments, and interactive experiences built across web development, scientific analysis, games, and 3D.</p>
        </div>
        <div className="project-toolbar">
          <div className="category-filters" role="group" aria-label="Filter projects by category">
            <button className="category-filter" type="button" data-category="all" aria-pressed={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>
              ALL PROJECTS <span className="count">{catalog.projects.length}</span>
            </button>
            {catalog.categories.map((category) => {
              const count = catalog.projects.filter((project) => project.categoryId === category.id).length;
              return (
                <button
                  className="category-filter"
                  type="button"
                  key={category.id}
                  data-category={category.id}
                  aria-pressed={activeCategory === category.id}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.label.toUpperCase()} <span className="count">{count}</span>
                </button>
              );
            })}
          </div>
          <div className="view-switch" role="group" aria-label="Project layout">
            <button type="button" data-view="grid" aria-pressed={view === 'grid'} onClick={() => setView('grid')}>GRID <span>▦</span></button>
            <button type="button" data-view="list" aria-pressed={view === 'list'} onClick={() => setView('list')}>LIST <span>☷</span></button>
          </div>
        </div>
        <p className="results-count" aria-live="polite">{String(visibleProjects.length).padStart(2, '0')} PROJECTS / {categoryLabel}</p>
      </section>
      <section className="project-archive" aria-label="Portfolio projects">
        <div className={`archive-grid${view === 'list' ? ' list-layout' : ''}`}>
          {visibleProjects.length > 0
            ? visibleProjects.map((project) => <ProjectCard key={project.id} project={project} catalog={catalog} />)
            : <p className="loading-note">No projects in this category yet.</p>}
        </div>
      </section>
    </div>
  );
}
