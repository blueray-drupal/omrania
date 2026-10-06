import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildBrandLoop, useBrands } from './useBrands';
import './BrandsPage.css';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1496247749665-49cf5b1022e9?w=1920&h=600&fit=crop&auto=format';

const ACCENTS = [
  '#003D7A',
  '#1D1D1B',
  '#D52B1E',
  '#E2001A',
  '#009999',
  '#FFDD00',
  '#003082',
  '#FF0000',
  '#3DCD58',
  '#00205B',
  '#004A97',
  '#0066B3',
];

function BrandsPage() {
  const brands = useBrands();
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);
  const loop = buildBrandLoop(brands);

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
  }, [brands]);

  return (
    <div className="brands-page" dir="ltr">
      <section className="brands-page__hero">
        <img src={HERO_IMAGE} alt="" />
        <div className="brands-page__hero-shade" />
        <div className="blueprint-grid" />
        <div className="brands-page__hero-copy">
          <div className="brands-page__hero-eyebrow">
            <span />
            <span>OUR NETWORK</span>
            <span />
          </div>
          <h1>
            Brands & <span>Partners</span>
          </h1>
          <p>
            Trusted international manufacturers backing every product we supply — quality-certified, globally proven.
          </p>
        </div>
      </section>

      {loop.length > 0 && (
        <div className="brands-page__marquee">
          <div className="brands-page__track">
            {loop.map((brand, index) => (
              <div className="brands-page__logo" key={`${brand.id}-${index}`}>
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

      <div className="brands-page__body">
        <div
          ref={sectionRef}
          className={inView ? 'brands-page__intro is-visible' : 'brands-page__intro'}
        >
          <div className="brands-page__heading brands-page__reveal">
            <div className="brands-page__eyebrow">
              <span />
              <span>TRUSTED MANUFACTURERS</span>
              <span />
            </div>
            <h2>Our Brand Partners</h2>
          </div>
          <p className="brands-page__text brands-page__reveal" style={{ '--reveal-delay': '0.1s' }}>
            Long-standing alliances with world-class manufacturers ensure our clients receive the highest quality engineering products.
          </p>
        </div>

        <div className="brands-page__grid">
          {brands.map((brand, index) => (
            <article
              className="brands-page__card"
              key={brand.id}
              style={{ '--accent': ACCENTS[index % ACCENTS.length] }}
            >
              <div className="brands-page__bar" />
              <div className="brands-page__card-body">
                <div className="brands-page__card-top">
                  <div>
                    <div className="brands-page__name">{brand.title}</div>
                    {brand.subtitle && <div className="brands-page__category">{brand.subtitle}</div>}
                  </div>
                  {brand.location && <span className="brands-page__place">{brand.location}</span>}
                </div>
                <div className="brands-page__rule" />
                {brand.description && <p>{brand.description}</p>}
              </div>
            </article>
          ))}
        </div>

        <div className="brands-page__banner">
          <div className="blueprint-grid" />
          <div className="brands-page__banner-copy">
            <h3>Looking for a specific brand or product?</h3>
            <p>
              Our team has direct access to these manufacturers and can source specific models, grades and specifications on request.
            </p>
          </div>
          <Link to="/contact">Contact Our Team →</Link>
        </div>
      </div>
    </div>
  );
}

export default BrandsPage;
