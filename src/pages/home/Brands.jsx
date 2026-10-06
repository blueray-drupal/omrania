import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildBrandLoop, useBrands } from '../brands/useBrands';
import './Brands.css';

function Brands() {
  const brands = useBrands();
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
  }, [brands]);

  const loop = buildBrandLoop(brands);

  return (
    <section
      id="brands-partners"
      ref={sectionRef}
      className={inView ? 'brands is-visible' : 'brands'}
      dir="ltr"
    >
      <div className="brands__intro">
        <div className="brands__heading brands__reveal">
          <div className="brands__eyebrow">
            <span className="brands__eyebrow-line" />
            <span className="brands__eyebrow-label">OUR NETWORK</span>
            <span className="brands__eyebrow-line" />
          </div>
          <h2 className="brands__title">Trusted Brands. Strong Partnerships.</h2>
        </div>
        <p className="brands__text brands__reveal" style={{ '--reveal-delay': '0.1s' }}>
          We work with trusted international manufacturers to deliver reliable engineering solutions.
        </p>
      </div>

      {loop.length > 0 && (
        <div className="brands__marquee">
          <div className="brands__track">
            {loop.map((brand, index) => (
              <div className="brands__logo" key={`${brand.id}-${index}`}>
                {brand.image ? (
                  <img src={brand.image} alt={brand.title} />
                ) : (
                  <span>{brand.title}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="brands__banner-wrap">
        <div className="brands__banner brands__reveal" style={{ '--reveal-delay': '0.16s' }}>
          <div className="blueprint-grid" />
          <div className="brands__banner-copy">
            <h3>Global Brands. Local Expertise.</h3>
            <p>
              Connecting our clients with trusted international manufacturers and proven engineering solutions for every industrial requirement.
            </p>
          </div>
          <Link className="brands__banner-button" to="/brands">
            View All Partners →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Brands;
