import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProjects } from './useProjects';
import './ProjectDetails.css';

const CAPABILITIES = [
  'Pipes, Fittings & Flanges',
  'Valves & Flow Control',
  'Pumps & Mechanical Equipment',
  'Instrumentation & Gauges',
  'Flexible Hoses & Joints',
  'Fasteners & Gaskets',
];

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function SectorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.12 12 19.79 19.79 0 0 1 1.05 3.4 2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function ProjectDetails() {
  const { id } = useParams();
  const { projects, loaded } = useProjects();
  const project = projects.find((item) => item.id === id);
  const related = project
    ? projects.filter((item) => item.id !== project.id && item.sector && item.sector === project.sector)
    : [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!loaded) {
    return null;
  }

  if (!project) {
    return (
      <div className="project-details project-details--empty" dir="ltr">
        <p>This project could not be found.</p>
        <Link to="/projects">← Back to Projects</Link>
      </div>
    );
  }

  return (
    <div className="project-details" dir="ltr">
      <section className="project-details__hero">
        {project.image ? (
          <img src={project.image} alt={project.title} />
        ) : (
          <div className="project-details__fallback" />
        )}
        <div className="project-details__shade" />
        <div className="project-details__hero-content">
          <div className="project-details__hero-inner">
            <Link className="project-details__back" to="/projects">← Back to Projects</Link>
            <div className="project-details__badges">
              {project.sector && <span>{project.sector}</span>}
              {project.year && <span className="is-year">{project.year}</span>}
            </div>
            <h1>{project.title}</h1>
          </div>
        </div>
      </section>

      <div className="project-details__body">
        <div className="project-details__layout">
          <div>
            <div className="project-details__facts">
              {project.year && (
                <div className="project-details__fact">
                  <span className="project-details__fact-icon"><CalendarIcon /></span>
                  <div>
                    <div className="project-details__fact-label">YEAR</div>
                    <div className="project-details__fact-value">{project.year}</div>
                  </div>
                </div>
              )}
              {project.location && (
                <div className="project-details__fact">
                  <span className="project-details__fact-icon"><LocationIcon /></span>
                  <div>
                    <div className="project-details__fact-label">LOCATION</div>
                    <div className="project-details__fact-value">{project.location}</div>
                  </div>
                </div>
              )}
              {project.sector && (
                <div className="project-details__fact">
                  <span className="project-details__fact-icon"><SectorIcon /></span>
                  <div>
                    <div className="project-details__fact-label">SECTOR</div>
                    <div className="project-details__fact-value">{project.sector}</div>
                  </div>
                </div>
              )}
            </div>

            {project.description && (
              <div className="project-details__overview">
                <h2>Project Overview</h2>
                <p>{project.description}</p>
              </div>
            )}

            {project.scope.length > 0 && (
              <div className="project-details__scope">
                <h3><span />Scope of Supply</h3>
                <ul>
                  {project.scope.map((item, index) => (
                    <li key={`${item}-${index}`}><span>✓</span>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {related.length > 0 && (
              <div className="project-details__related">
                <h3>Related Projects</h3>
                <div className="project-details__related-grid">
                  {related.map((item) => (
                    <Link className="project-details__related-card" to={`/projects/${item.id}`} key={item.id}>
                      {item.image ? (
                        <img src={item.image} alt={item.title} />
                      ) : (
                        <div className="project-details__fallback" />
                      )}
                      <div className="project-details__related-shade" />
                      <div className="project-details__related-copy">
                        <div>{item.title}</div>
                        {item.location && <span>{item.location}</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="project-details__aside">
            <div className="project-details__cta">
              <div className="blueprint-grid" />
              <div className="project-details__cta-inner">
                <div className="project-details__cta-icon"><PhoneIcon /></div>
                <h3>Interested in a Similar Project?</h3>
                <p>Our engineering team can provide tailored supply solutions for projects of any scale and sector.</p>
                <Link to="/quote" className="project-details__quote">Request a Quote →</Link>
                <button type="button" className="project-details__contact">Contact Our Team</button>
              </div>
            </div>
            <div className="project-details__capabilities">
              <h4>Al Omrania Capabilities</h4>
              {CAPABILITIES.map((item) => (
                <div className="project-details__capability" key={item}>
                  <span />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetails;
