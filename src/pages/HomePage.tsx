import { Link } from 'react-router-dom';
import projectsData from '../../data/projects.json';
import { ProjectCard } from '../components/ProjectCard';
import { ShipStage } from '../components/ShipStage';
import type { ProjectCatalog } from '../types';

const catalog = projectsData as ProjectCatalog;

interface HomePageProps {
  onPlannedLink: () => void;
}

export function HomePage({ onPlannedLink }: HomePageProps) {
  const featuredProjects = catalog.projects.filter((project) => project.featured).slice(0, 3);

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-grid" aria-hidden="true"></div>
        <div className="hero-copy">
          <p className="eyebrow"><span className="status-dot"></span> WEB DESIGN · DEVELOPMENT · SOFTWARE ENGINEERING <span className="eyebrow-line"></span> 2026</p>
          <h1 id="hero-title">BUILD BEYOND<br />THE <span className="outlined">ORDINARY.</span></h1>
        </div>
        <ShipStage />
        <div className="hero-details">
          <p className="hero-subtitle">Digital experiences built with <span className="bold">curiosity</span>, <span className="bold">craft</span>, and <span className="bold">engineering detail</span>.</p>
          <p className="hero-description">I’m James Call, a software engineering graduate who works across web development, interactive 3D, data analysis, and visual design. I enjoy making complex tools feel clear, useful, and inviting.</p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/projects">Explore selected work <span>↗</span></Link>
            <a className="button button-quiet" href="#about" onClick={(event) => { event.preventDefault(); onPlannedLink(); }}>More about me <span>↓</span></a>
          </div>
          <div className="hero-meta"><span><i>01</i> DESIGN WITH INTENT</span><span><i>02</i> ENGINEER WITH CARE</span><span><i>03</i> STAY CURIOUS</span></div>
        </div>
        <div className="scroll-cue"><span className="scroll-line"></span> SCROLL TO TRANSMISSION</div>
        <div className="hero-index">J / 01</div>
      </section>

      <section className="signal-strip" aria-label="Capabilities">
        <div className="strip-label">TRANSMISSION / CAPABILITIES</div>
        <div className="signal-items"><span>WEB DESIGN <b>✳</b></span><span>FRONTEND DEVELOPMENT <b>✳</b></span><span>SOFTWARE ENGINEERING <b>✳</b></span><span>3D WORLDS <b>✳</b></span></div>
      </section>

      <section className="next-section work-section" id="projects">
        <div className="section-kicker"><span>01 / SELECTED WORK</span><span>FIELD NOTES · 2023—2025</span></div>
        <div className="work-heading">
          <div><p className="eyebrow">BUILT ACROSS DISCIPLINES</p><h2>FROM DATA<br />TO <em>DIMENSION.</em></h2></div>
          <p className="work-intro">A few projects where software, science, design, and 3D meet. Each one starts with a real problem and a reason to make the experience better.</p>
        </div>
        <div className="featured-projects" aria-live="polite">
          {featuredProjects.map((project) => <ProjectCard key={project.id} project={project} catalog={catalog} featured />)}
        </div>
        <Link className="text-link all-work-link" to="/projects">Explore all projects <span>↗</span></Link>
      </section>

      <section className="contact-band" id="contact">
        <div><p className="eyebrow">OPEN CHANNEL / 01</p><h2>HAVE A GOOD<br />MISSION IN MIND?</h2></div>
        <a className="button button-primary" href="mailto:callajames2025@gmail.com">Get in touch <span>↗</span></a>
        <div className="contact-stub"><a href="mailto:callajames2025@gmail.com">EMAIL</a> · <a href="https://www.linkedin.com/in/james-call-4a0020221/" target="_blank" rel="noopener noreferrer">LINKEDIN</a> · <a href="https://github.com/jacall2016" target="_blank" rel="noopener noreferrer">GITHUB</a></div>
      </section>
    </>
  );
}
