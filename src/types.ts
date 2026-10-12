export interface ProjectCategory {
  id: string;
  label: string;
}

export interface ProjectLink {
  label: string;
  url: string;
}

export interface ProjectImage {
  src: string;
  alt?: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  technologies: string[];
  links: ProjectLink[];
  featured: boolean;
  gallery: ProjectImage[];
}

export interface ProjectCatalog {
  schemaVersion: number;
  categories: ProjectCategory[];
  projects: PortfolioProject[];
}
