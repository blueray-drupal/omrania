import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProductCategories } from './useProductCategories';
import { useProducts } from './useProducts';
import ProductsLoading from './ProductsLoading';
import './ProductsPage.css';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1620203853151-496c7228306c?w=1920&h=600&fit=crop&auto=format';

function ProductCategoryPage() {
  const { categoryId } = useParams();
  const { categories, loaded: categoriesLoaded } = useProductCategories();
  const { products, loaded: productsLoaded } = useProducts();
  const [inView, setInView] = useState(false);
  const gridRef = useRef(null);

  const categoryIndex = categories.findIndex((item) => item.id === categoryId);
  const category = categoryIndex >= 0 ? categories[categoryIndex] : null;
  const categoryProducts = products.filter((product) => product.categoryId === categoryId);
  const loaded = categoriesLoaded && productsLoaded;

  useEffect(() => {
    window.scrollTo(0, 0);
    setInView(false);
  }, [categoryId]);

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
  }, [categoryId, categoryProducts.length]);

  if (!loaded) {
    return <ProductsLoading />;
  }

  if (!category) {
    return (
      <div className="products-page products-page--empty" dir="ltr">
        <p>This category could not be found.</p>
        <Link to="/products">← Back to All Products</Link>
      </div>
    );
  }

  const categoryNumber = String(categoryIndex + 1).padStart(2, '0');

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
            <Link to="/products">Products</Link>
            <span className="products-page__sep">›</span>
            <span>{category.name}</span>
          </div>
          <div className="products-page__heading">
            <div className="products-page__eyebrow">
              <span />
              <span>{`CATEGORY ${categoryNumber}`}</span>
              <span />
            </div>
            <h1>{category.name}</h1>
            {category.body && <p>{category.body}</p>}
          </div>
        </div>
      </section>

      <div className="products-page__body">
        <div
          ref={gridRef}
          className={inView ? 'products-page__grid is-visible' : 'products-page__grid'}
        >
          {categoryProducts.map((product, index) => (
            <Link
              className="products-page__card"
              key={product.id}
              to={`/products/${category.id}/${product.id}`}
              style={{ '--reveal-delay': `${index * 0.1}s` }}
            >
              <div className="products-page__media">
                {product.image && <img src={product.image} alt={product.title} />}
                <div className="products-page__shade" />
              </div>
              <div className="products-page__content">
                <div className="products-page__bar"><span /></div>
                <h3>{product.title}</h3>
                {product.body && <p>{product.body}</p>}
                <div className="products-page__more">View Products <span>→</span></div>
              </div>
            </Link>
          ))}
        </div>
        <div className="products-page__actions">
          <Link className="products-page__back" to="/products">← Back to All Products</Link>
        </div>
      </div>
    </div>
  );
}

export default ProductCategoryPage;
