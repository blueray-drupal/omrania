import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProductCategories } from './useProductCategories';
import { useProducts } from './useProducts';
import ProductsLoading from './ProductsLoading';
import './ProductsPage.css';
import './ProductDetailsPage.css';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1620203853151-496c7228306c?w=1920&h=600&fit=crop&auto=format';

function ProductDetailsPage() {
  const { categoryId, productId } = useParams();
  const { categories, loaded: categoriesLoaded } = useProductCategories();
  const { products, loaded: productsLoaded } = useProducts();
  const loaded = categoriesLoaded && productsLoaded;

  const categoryIndex = categories.findIndex((item) => item.id === categoryId);
  const category = categoryIndex >= 0 ? categories[categoryIndex] : null;
  const product = products.find((item) => item.id === productId && item.categoryId === categoryId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categoryId, productId]);

  if (!loaded) {
    return <ProductsLoading variant="detail" />;
  }

  if (!category || !product) {
    return (
      <div className="products-page products-page--empty" dir="ltr">
        <p>This product could not be found.</p>
        <Link to={category ? `/products/${category.id}` : '/products'}>
          {category ? `← Back to ${category.name}` : '← Back to All Products'}
        </Link>
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
            <Link to={`/products/${category.id}`}>{category.name}</Link>
            <span className="products-page__sep">›</span>
            <span>{product.title}</span>
          </div>
          <div className="products-page__heading">
            <div className="products-page__eyebrow">
              <span />
              <span>{`${categoryNumber} — ${category.name}`}</span>
              <span />
            </div>
            <h1>{product.title}</h1>
            {product.body && <p>{product.body}</p>}
          </div>
        </div>
      </section>

      <div className="products-page__body">
        <div className="product-details__layout">
          <div>
            <div className="product-details__photo">
              {product.image && <img src={product.image} alt={product.title} />}
            </div>
            <div className="product-details__quote">
              <h3>Request a Quote</h3>
              <p>{`Need pricing or technical consultation for ${product.title}? Contact our engineering team.`}</p>
              <Link to="/quote">Request a Quote →</Link>
            </div>
          </div>

          {product.specs.length > 0 && (
            <div className="product-details__specs">
              <div className="product-details__specs-head">
                <span />
                <span>Technical Specifications</span>
              </div>
              {product.specs.map((spec) => (
                <div className="product-details__row" key={spec.id}>
                  <div>{spec.label}</div>
                  <div>{spec.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="products-page__actions">
          <Link className="products-page__back" to={`/products/${category.id}`}>
            {`← Back to ${category.name}`}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsPage;
