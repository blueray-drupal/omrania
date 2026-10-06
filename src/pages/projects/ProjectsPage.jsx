import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from './useProjects';
import './ProjectsPage.css';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1507823690283-48b0929e727b?w=1920&h=600&fit=crop&auto=format';

function LocationIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ProjectsPage() {
  const { projects, sectors } = useProjects();
  const [sector, setSector] = useState('All');
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    <div className="projects-page" dir="ltr">
      <section className="projects-page__hero">
        <img src={HERO_IMAGE} alt="" />
        <div className="projects-page__hero-shade" />
        <div className="blueprint-grid" />
        <div className="projects-page__hero-copy">
          <div className="projects-page__hero-eyebrow">
            <span />
            <span>OUR WORK</span>
            <span />
          </div>
          <h1>
            Our <span>Projects</span>
          </h1>
          <p>
            Engineering supply solutions across Jordan and the region — oil &amp; gas, infrastructure, industrial and commercial.
          </p>
        </div>
      </section>

      <div className="projects-page__body">
        <div
          ref={sectionRef}
          className={inView ? 'projects-page__intro is-visible' : 'projects-page__intro'}
        >
          <div className="projects-page__heading projects-page__reveal">
            <div className="projects-page__eyebrow">
              <span />
              <span>PROJECT PORTFOLIO</span>
              <span />
            </div>
            <h2>Selected Projects</h2>
          </div>
          <p className="projects-page__text projects-page__reveal" style={{ '--reveal-delay': '0.1s' }}>
            A selection of supply and engineering engagements across key industrial and infrastructure sectors.
          </p>
          <div className="projects-page__filters projects-page__reveal" style={{ '--reveal-delay': '0.16s' }}>
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
        </div>

        <div className="projects-page__grid">
          {visible.map((project) => (
            <Link className="projects-page__card" to={`/projects/${project.id}`} key={project.id}>
              <div className="projects-page__media">
                {project.image ? (
                  <img src={project.image} alt={project.title} />
                ) : (
                  <div className="projects-page__fallback" />
                )}
                <div className="projects-page__media-shade" />
                <div className="projects-page__badges">
                  {project.sector && <span>{project.sector}</span>}
                  {project.year && <span className="is-year">{project.year}</span>}
                </div>
              </div>
              <div className="projects-page__content">
                <div className="projects-page__bar"><span /></div>
                <h3>{project.title}</h3>
                {project.location && (
                  <div className="projects-page__location">
                    <LocationIcon />
                    <span>{project.location}</span>
                  </div>
                )}
                {project.description && <p>{project.description}</p>}
                <div className="projects-page__footer">
                  <span className="projects-page__more">View Details <span>→</span></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProjectsPage;
