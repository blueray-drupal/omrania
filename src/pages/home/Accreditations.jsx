import { useEffect, useRef, useState } from 'react';
import { useAccreditations } from '../accreditations/useAccreditations';
import './Accreditations.css';

function Accreditations() {
  const items = useAccreditations();
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
  }, [items]);

  return (
    <section
      id="accreditations"
      ref={sectionRef}
      className={inView ? 'accreditations is-visible' : 'accreditations'}
      dir="ltr"
    >
      <div className="accreditations__inner">
        <div className="accreditations__heading accreditations__reveal">
          <div className="accreditations__eyebrow">
            <span className="accreditations__eyebrow-line" />
            <span className="accreditations__eyebrow-label">STANDARDS & QUALITY</span>
            <span className="accreditations__eyebrow-line" />
          </div>
          <h2>Accreditations & Certifications</h2>
        </div>
        <p className="accreditations__text accreditations__reveal" style={{ '--reveal-delay': '0.1s' }}>
          Our commitment to quality, safety and international engineering standards.
        </p>

        <div className="accreditations__grid">
          {items.map((item) => (
            <article className="accreditations__card" key={item.id}>
              <div className="accreditations__badge">{item.badge}</div>
              <div className="accreditations__code">{item.code}</div>
              {item.subtitle && <div className="accreditations__subtitle">{item.subtitle}</div>}
              {item.organization && <div className="accreditations__org">{item.organization}</div>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Accreditations;
