import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProductCategories } from '../products/useProductCategories';
import './HomeProducts.css';

const plainText = (value) =>
  String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

function HomeProducts() {
  const { categories, loaded } = useProductCategories();
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setInView(true);
      observer.disconnect();
    }, { threshold: 0.15 });

    observer.observe(node);
    return () => observer.disconnect();
  }, [loaded]);

  return (
    <section
      id="products"
      ref={sectionRef}
      className={inView ? 'home-products is-visible' : 'home-products'}
      dir="ltr"
    >
      <div className="home-products__inner">
        <div className="home-products__intro">
          <div className="home-products__heading home-products__reveal">
            <div className="home-products__eyebrow">
              <span />
              <span>WHAT WE SUPPLY</span>
              <span />
            </div>
            <h2 className="home-products__reveal home-products__reveal--title">Our Products</h2>
          </div>
          <p className="home-products__lead home-products__reveal home-products__reveal--lead">
            Reliable mechanical and engineering solutions for demanding industrial applications.
          </p>
        </div>

        {loaded && (
          <div className="home-products__grid">
            {categories.map((category, index) => {
              const body = plainText(category.body);
              return (
                <Link
                  className="home-products__card home-products__reveal"
                  key={category.id}
                  to={`/products/${category.id}`}
                  style={{ '--reveal-delay': `${0.1 + index * 0.1}s` }}
                >
                  <div className="home-products__media">
                    {category.image && <img src={category.image} alt={category.name} />}
                    <div className="home-products__shade" />
                  </div>
                  <div className="home-products__content">
                    <div className="home-products__bar"><span /></div>
                    <h3>{category.name}</h3>
                    {body && <p>{body}</p>}
                    <div className="home-products__more">View Products <span>→</span></div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default HomeProducts;
