import { Skeleton } from '../../components/skeleton/Skeleton';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1620203853151-496c7228306c?w=1920&h=600&fit=crop&auto=format';

function CardSkeletons() {
  return (
    <div className="products-page__grid" aria-hidden="true">
      {[0, 1, 2].map((item) => (
        <article className="products-page__sk-card" key={item}>
          <Skeleton className="products-page__sk-media" />
          <div className="products-page__content">
            <Skeleton className="products-page__sk-heading" />
            <Skeleton className="products-page__sk-line" />
            <Skeleton className="products-page__sk-line products-page__sk-line--short" />
          </div>
        </article>
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="product-details__layout" aria-hidden="true">
      <div>
        <Skeleton className="products-page__sk-photo" />
        <div className="product-details__quote">
          <Skeleton className="products-page__sk-heading" />
          <Skeleton className="products-page__sk-line" />
          <Skeleton className="products-page__sk-line products-page__sk-line--short" />
          <Skeleton className="products-page__sk-button" />
        </div>
      </div>
      <div className="product-details__specs">
        <Skeleton className="products-page__sk-spec-head" />
        {[0, 1, 2, 3, 4].map((item) => (
          <div className="product-details__row" key={item}>
            <Skeleton className="products-page__sk-line" />
            <Skeleton className="products-page__sk-line" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductsLoading({ variant = 'cards', cardsOnly = false }) {
  if (cardsOnly) {
    return <CardSkeletons />;
  }

  return (
    <div className="products-page" dir="ltr" aria-busy="true" aria-live="polite">
      <section className="products-page__hero products-page__hero--loading">
        <img src={HERO_IMAGE} alt="" />
        <div className="products-page__hero-shade" />
        <div className="blueprint-grid" />
      </section>
      <div className="products-page__body">
        {variant === 'detail' ? <DetailSkeleton /> : <CardSkeletons />}
      </div>
    </div>
  );
}

export default ProductsLoading;
