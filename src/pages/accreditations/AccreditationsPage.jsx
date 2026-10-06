import { useEffect, useRef, useState } from 'react';
import { useAccreditations, useOurQuality, useProductStandards } from './useAccreditations';
import './AccreditationsPage.css';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=1920&h=600&fit=crop&auto=format';

const ACCENTS = ['#1E5AA8', '#2E7D32', '#E65100', '#003399', '#B71C1C', '#1A237E'];

function splitTitle(title) {
  const trimmed = (title || '').trim();
  const index = trimmed.lastIndexOf(' ');
  if (index === -1) return { lead: trimmed, accent: '' };
  return {
    lead: `${trimmed.slice(0, index)} `,
    accent: trimmed.slice(index + 1),
  };
}

function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function TickIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2F80ED" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AccreditationsPage() {
  const items = useAccreditations();
  const standards = useProductStandards();
  const quality = useOurQuality();
  const qualityTitle = splitTitle(quality.title);
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
  }, [items]);

  return (
    <div className="accreditations-page" dir="ltr">
      <section className="accreditations-page__hero">
        <img src={HERO_IMAGE} alt="" />
        <div className="accreditations-page__hero-shade" />
        <div className="blueprint-grid" />
        <div className="accreditations-page__hero-copy">
          <div className="accreditations-page__hero-eyebrow">
            <span />
            <span>STANDARDS & QUALITY</span>
            <span />
          </div>
          <h1>
            Accreditations & <span>Certifications</span>
          </h1>
          <p>
            Our commitment to international standards ensures every product we supply meets the highest quality, safety and environmental requirements.
          </p>
        </div>
      </section>

      <div className="accreditations-page__body">
        <div
          ref={sectionRef}
          className={inView ? 'accreditations-page__intro is-visible' : 'accreditations-page__intro'}
        >
          <div className="accreditations-page__heading accreditations-page__reveal">
            <div className="accreditations-page__eyebrow">
              <span />
              <span>CERTIFICATIONS</span>
              <span />
            </div>
            <h2>Our Accreditations</h2>
          </div>
          <p className="accreditations-page__text accreditations-page__reveal" style={{ '--reveal-delay': '0.1s' }}>
            Independently verified certifications that reflect our commitment to quality management, safety and environmental responsibility.
          </p>
        </div>

        <div className="accreditations-page__grid">
          {items.map((item, index) => (
            <article
              className="accreditations-page__card"
              key={item.id}
              style={{ '--accent': ACCENTS[index % ACCENTS.length] }}
            >
              <div className="accreditations-page__bar" />
              <div className="accreditations-page__media">
                {item.image ? (
                  <img src={item.image} alt={item.title} />
                ) : (
                  <div className="accreditations-page__media-empty" />
                )}
                {item.code && <span className="accreditations-page__chip">{item.code}</span>}
              </div>
              <div className="accreditations-page__content">
                <div className="accreditations-page__title-row">
                  <div className="accreditations-page__icon"><CheckIcon /></div>
                  <div>
                    <div className="accreditations-page__name">{item.title}</div>
                    {item.subtitle && <div className="accreditations-page__subtitle">{item.subtitle}</div>}
                  </div>
                </div>
                {item.organization && <div className="accreditations-page__org">{item.organization}</div>}
                <div className="accreditations-page__rule" />
                {item.description && <p>{item.description}</p>}
              </div>
            </article>
          ))}
        </div>

        <div className="accreditations-page__standards">
          <div className="accreditations-page__heading">
            <div className="accreditations-page__eyebrow">
              <span />
              <span>PRODUCT COMPLIANCE</span>
              <span />
            </div>
            <h2>Standards We Supply To</h2>
          </div>
          <p className="accreditations-page__text">
            All products are sourced from mills and manufacturers holding valid material test certifications against the following international standards.
          </p>
          {standards.rows.length > 0 && (
            <div className="accreditations-page__table">
              <div className="accreditations-page__table-head">
                <span />
                <span>{standards.title}</span>
              </div>
              {standards.rows.map((row) => (
                <div className="accreditations-page__row" key={row.id}>
                  <div>{row.category}</div>
                  <div>{row.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {(quality.title || quality.paragraphs.length > 0 || quality.checks.length > 0) && (
          <div className="accreditations-page__commitment">
            <div>
              {quality.title && (
                <h3>
                  {qualityTitle.lead}
                  {qualityTitle.accent && <span>{qualityTitle.accent}</span>}
                </h3>
              )}
              {quality.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="accreditations-page__checks">
              {quality.checks.map((item, index) => (
                <div className="accreditations-page__check" key={`${item}-${index}`}>
                  <span><TickIcon /></span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccreditationsPage;
