import { useCallback, useEffect, useState } from 'react';
import { drupalApi, DRUPAL_BASE_URL } from '../../services/api/axios.config';
import { parseDrupalMultipleNodes } from '../../utils/drupalParser';
import './Hero.css';

const stripHtml = (html) => (html || '').replace(/<[^>]*>/g, '').trim();

const resolveDrupalLink = (uri) => {
  if (!uri) return '#';
  if (uri.startsWith('internal:')) {
    return uri.slice('internal:'.length) || '#';
  }
  return uri;
};

const toHeadlineLines = (title) => {
  if (!title) return [];
  if (title.includes('\n')) return title.split('\n');

  const match = title.match(/^(.*?\.)\s+(.+)$/);
  if (!match) return [title];
  return [match[1], match[2]];
};

const mapSlide = (node) => {
  const links = Array.isArray(node.field_link) ? node.field_link : [];

  return {
    id: node.id,
    image: node.image || '',
    tag: node.field_highlight || '',
    headline: node.title || '',
    description: stripHtml(node.body),
    buttons: links.map((link, linkIndex) => ({
      label: link.title || '',
      href: resolveDrupalLink(link.uri),
      primary: linkIndex === 0,
    })),
  };
};

function Hero() {
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await drupalApi.get('/jsonapi/node/slider_hero', {
          params: { include: 'field_img.field_media_image' },
        });
        const nodes = parseDrupalMultipleNodes(data, DRUPAL_BASE_URL).sort(
          (a, b) => (a.rawAttributes?.drupal_internal__nid || 0) - (b.rawAttributes?.drupal_internal__nid || 0)
        );
        setSlides(nodes.map(mapSlide));
        setIndex(0);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const goTo = useCallback((nextIndex) => {
    setIndex(nextIndex);
    setTick((value) => value + 1);
  }, []);

  const showNext = useCallback(() => {
    if (slides.length === 0) return;
    goTo((index + 1) % slides.length);
  }, [goTo, index, slides.length]);

  const showPrevious = useCallback(() => {
    if (slides.length === 0) return;
    goTo((index - 1 + slides.length) % slides.length);
  }, [goTo, index, slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2) {
      return undefined;
    }

    const timer = setInterval(showNext, 5500);
    return () => clearInterval(timer);
  }, [paused, showNext, slides.length]);

  const slide = slides[index];
  const lines = toHeadlineLines(slide?.headline);

  return (
    <section
      id="home"
      className="hero"
      dir="ltr"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero__media" key={`bg-${tick}`}>
        {slide?.image && <img className="hero-img-zoom" src={slide.image} alt="" />}
        <div className="hero__shade" />
      </div>

      <div className="blueprint-grid" />

      {slide && (
        <div className="hero__content" key={`text-${tick}`}>
          <div className="hero__copy">
            <div className="hero__eyebrow">
              <span className="hero__eyebrow-line" />
              <span className="hero__eyebrow-label">{slide.tag}</span>
            </div>

            <h1 className="hero__title">
              {lines.map((line, lineIndex) => (
                <span key={`${slide.id}-${lineIndex}`}>
                  {line}
                  {lineIndex === lines.length - 1 && <span className="hero__title-dot">.</span>}
                  {lineIndex < lines.length - 1 && <br />}
                </span>
              ))}
            </h1>

            <div className="hero__rule" />

            <p className="hero__description">{slide.description}</p>

            <div className="hero__actions">
              {slide.buttons.map((button, buttonIndex) => (
                <a
                  key={`${slide.id}-${buttonIndex}`}
                  href={button.href}
                  className={button.primary ? 'hero__btn hero__btn--primary' : 'hero__btn hero__btn--ghost'}
                >
                  {button.label} <span className="hero__btn-arrow">→</span>
                </a>
              ))}
            </div>

            <div className="hero__controls">
              <div className="hero__dots">
                {slides.map((item, dotIndex) => (
                  <button
                    key={item.id}
                    type="button"
                    className={dotIndex === index ? 'hero__dot is-active' : 'hero__dot'}
                    aria-label={`Show slide ${dotIndex + 1}`}
                    onClick={() => goTo(dotIndex)}
                  />
                ))}
              </div>
              <div className="hero__arrows">
                <button type="button" className="hero__arrow" aria-label="Previous slide" onClick={showPrevious}>
                  ‹
                </button>
                <button type="button" className="hero__arrow" aria-label="Next slide" onClick={showNext}>
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="hero__progress">
        <div
          key={`prog-${tick}`}
          className={paused ? 'hero__progress-bar is-paused' : 'hero__progress-bar'}
        />
      </div>
    </section>
  );
}

export default Hero;
