import { useState } from 'react';
import type { PortfolioProject, ProjectCatalog } from '../types';

interface ProjectCardProps {
  project: PortfolioProject;
  catalog: ProjectCatalog;
  featured?: boolean;
}

export function ProjectCard({ project, catalog, featured = false }: ProjectCardProps) {
  const [activeImage, setActiveImage] = useState(0);
  const category = catalog.categories.find((item) => item.id === project.categoryId)?.label ?? 'Other';
  const mainImage = project.gallery[activeImage];
  const primaryLink = project.links[0];

  return featured ? (
    <article className="project-card">
      <ProjectArtwork project={project} category={category} />
      <div className="project-content">
        <span className="project-category">{category.toUpperCase()}</span>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <ProjectTags technologies={project.technologies} />
        {project.links.length > 0 && <ProjectLinks links={project.links} />}
      </div>
    </article>
  ) : (
    <article className="archive-project" data-project-id={project.id}>
      {primaryLink && <a className="archive-project-link" href={primaryLink.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.title}`} />}
      <div className="archive-media">
        {mainImage
          ? <img className="archive-main-image" src={mainImage.src} alt={mainImage.alt || project.title} />
          : <div className="archive-art" aria-label="Project artwork not added yet"><span>{project.id.toUpperCase()} / VISUAL PENDING</span></div>}
      </div>
      <div className="gallery-strip">
        {project.gallery.length > 0
          ? project.gallery.map((image, index) => (
            <button
              className="gallery-thumb"
              key={`${project.id}-image-${index}`}
              type="button"
              aria-label={`Show image ${index + 1} for ${project.title}`}
              aria-pressed={index === activeImage}
              onMouseEnter={() => setActiveImage(index)}
              onFocus={() => setActiveImage(index)}
              onClick={() => setActiveImage(index)}
            >
              <img src={image.src} alt="" />
            </button>
          ))
          : <span className="gallery-empty">PROJECT IMAGES TO BE ADDED</span>}
      </div>
      <div className="archive-content">
        <span className="archive-category">{category.toUpperCase()}</span>
        <h2>{project.title}</h2>
        <p>{project.description}</p>
        <ProjectTags technologies={project.technologies} archive />
        {project.links.length > 0 && <ProjectLinks links={project.links} archive />}
      </div>
    </article>
  );
}

function ProjectArtwork({ project, category }: { project: PortfolioProject; category: string }) {
  const coverImage = project.gallery[0];

  return (
    <div className="project-art" aria-hidden="true">
      {coverImage && <img className="project-art-image" src={coverImage.src} alt="" />}
      <span className="art-index">PROJECT / {project.id.toUpperCase()}</span>
      <span className="art-type">{category.toUpperCase()}</span>
    </div>
  );
}

function ProjectTags({ technologies, archive = false }: { technologies: string[]; archive?: boolean }) {
  return (
    <div className={archive ? 'archive-tags' : 'project-tags'}>
      {technologies.map((technology) => <span key={technology}>{technology}</span>)}
    </div>
  );
}

function ProjectLinks({ links, archive = false }: { links: PortfolioProject['links']; archive?: boolean }) {
  return (
    <div className={archive ? 'archive-links' : 'project-links'}>
      {links.map((link) => (
        <a href={link.url} key={`${link.label}-${link.url}`} target="_blank" rel="noopener noreferrer">
          {link.label} ↗
        </a>
      ))}
    </div>
  );
}
