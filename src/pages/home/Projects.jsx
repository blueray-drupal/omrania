import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../projects/useProjects';
import './Projects.css';

function LocationIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function Projects() {
  const { projects, sectors } = useProjects();
  const [sector, setSector] = useState('All');
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setInView(true);
      observer.disconnect();
    }, { threshold: 0.2 });

    observer.observe(node);
    return () => observer.disconnect();
  }, [projects]);

  const visible = sector === 'All'
    ? projects
    : projects.filter((project) => project.sector === sector);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className={inView ? 'projects-home is-visible' : 'projects-home'}
      dir="ltr"
    >
      <div className="projects-home__inner">
        <div className="projects-home__heading projects-home__reveal">
          <div className="projects-home__eyebrow">
            <span className="projects-home__eyebrow-line" />
            <span className="projects-home__eyebrow-label">OUR WORK</span>
            <span className="projects-home__eyebrow-line" />
          </div>
          <h2 className="projects-home__title">Selected Projects</h2>
        </div>
        <p className="projects-home__text projects-home__reveal" style={{ '--reveal-delay': '0.1s' }}>
          Engineering supplies and solutions supporting projects across multiple sectors.
        </p>

        <div className="projects-home__filters projects-home__reveal" style={{ '--reveal-delay': '0.16s' }}>
          {['All', ...sectors].map((name) => (
            <button
              key={name}
              type="button"
              className={sector === name ? 'is-active' : undefined}
              onClick={() => setSector(name)}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="projects-home__grid">
          {visible.map((project) => (
            <Link className="projects-home__card" to={`/projects/${project.id}`} key={project.id}>
              {project.image ? (
                <img src={project.image} alt={project.title} />
              ) : (
                <div className="projects-home__fallback" />
              )}
              <div className="projects-home__shade" />
              {project.sector && (
                <div className="projects-home__badge">{project.sector}</div>
              )}
              <div className="projects-home__meta">
                <h3>{project.title}</h3>
                <div className="projects-home__location">
                  <LocationIcon />
                  <span>{project.location}</span>
                  <span className="projects-home__arrow">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;
