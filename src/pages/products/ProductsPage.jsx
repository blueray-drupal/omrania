import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProductCategories } from './useProductCategories';
import ProductsLoading from './ProductsLoading';
import './ProductsPage.css';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1620203853151-496c7228306c?w=1920&h=600&fit=crop&auto=format';

function ProductsPage() {
  const { categories, loaded } = useProductCategories();
  const [inView, setInView] = useState(false);
  const gridRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const node = gridRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setInView(true);
      observer.disconnect();
    }, { threshold: 0.15 });

    observer.observe(node);
    return () => observer.disconnect();
  }, [categories]);

  return (
    <div className="products-page" dir="ltr">
      <section className="products-page__hero">
        <img src={HERO_IMAGE} alt="" />
        <div className="products-page__hero-shade" />
        <div className="blueprint-grid" />
        <div className="products-page__hero-copy">
          <div className="products-page__crumbs">
            <Link to="/">Home</Link>
            <span className="products-page__sep">›</span>
            <span>Products</span>
          </div>
          <div className="products-page__heading">
            <div className="products-page__eyebrow">
              <span />
              <span>WHAT WE SUPPLY</span>
              <span />
            </div>
            <h1>Products</h1>
            <p>Explore our complete range of mechanical and engineering products.</p>
          </div>
        </div>
      </section>

      <div className="products-page__body">
        {!loaded && <ProductsLoading cardsOnly />}
        <div
          ref={gridRef}
          className={inView ? 'products-page__grid is-visible' : 'products-page__grid'}
          hidden={!loaded}
        >
          {categories.map((category, index) => (
            <Link
              className="products-page__card"
              key={category.id}
              to={`/products/${category.id}`}
              style={{ '--reveal-delay': `${index * 0.1}s` }}
            >
              <div className="products-page__media">
                {category.image && <img src={category.image} alt={category.name} />}
                <div className="products-page__shade" />
              </div>
              <div className="products-page__content">
                <div className="products-page__bar"><span /></div>
                <h3>{category.name}</h3>
                {category.body && <p>{category.body}</p>}
                <div className="products-page__more">View Products <span>→</span></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
