import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { drupalApi, DRUPAL_BASE_URL } from '../../services/api/axios.config';
import { parseDrupalMultipleNodes } from '../../utils/drupalParser';
import './AboutHome.css';

const HOME_CLASSIFICATION = 'home';

const toPlainText = (html) =>
  (html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();

const titleLines = (title) => {
  const marker = 'You Can';
  const index = title.indexOf(marker);
  if (index <= 0) return [title];
  return [title.slice(0, index).trim(), title.slice(index).trim()];
};

const mapPage = (node) => ({
  id: node.id,
  highlight: node.field_highlight || '',
  title: node.title || '',
  description: toPlainText(node.body),
  image: node.image || '',
  stats: (node.paragraphs?.field_title_body || []).map((stat) => ({
    id: stat.id,
    value: stat.title || stat.field_title || '',
    label: toPlainText(stat.body || stat.field_body?.processed || stat.field_body?.value || ''),
  })),
});

function AboutHome() {
  const [page, setPage] = useState(null);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await drupalApi.get('/jsonapi/node/about_us', {
          params: {
            include: 'field_img.field_media_image,field_title_body',
            'filter[field_classification]': HOME_CLASSIFICATION,
          },
        });
        const nodes = parseDrupalMultipleNodes(data, DRUPAL_BASE_URL).filter(
          (node) => node.field_classification === HOME_CLASSIFICATION
        );

        if (nodes[0]) {
          setPage(mapPage(nodes[0]));
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setInView(true);
      observer.disconnect();
    }, { threshold: 0.25 });

    observer.observe(node);
    return () => observer.disconnect();
  }, [page]);

  if (!page) {
    return null;
  }

  const lines = titleLines(page.title);

  return (
    <section
      id="about-us"
      ref={sectionRef}
      className={inView ? 'about-home is-visible' : 'about-home'}
      dir="ltr"
    >
      <div className="about-home__inner">
        <div className="about-home__media about-home__reveal" style={{ '--reveal-delay': '0s' }}>
          {page.image && (
            <img src={page.image} alt={page.title || 'Al Omrania'} />
          )}
          <div className="about-home__shade" />
        </div>

        <div className="about-home__copy">
          <div className="about-home__heading">
            <div className="about-home__eyebrow about-home__reveal" style={{ '--reveal-delay': '0.06s' }}>
              <span className="about-home__eyebrow-line" />
              <span className="about-home__eyebrow-label">{page.highlight}</span>
              <span className="about-home__eyebrow-line" />
            </div>
            <h2 className="about-home__title about-home__reveal" style={{ '--reveal-delay': '0.12s' }}>
              {lines.map((line, lineIndex) => (
                <span key={line}>
                  {line}
                  {lineIndex < lines.length - 1 && <br />}
                </span>
              ))}
            </h2>
          </div>

          <p className="about-home__description about-home__reveal" style={{ '--reveal-delay': '0.18s' }}>{page.description}</p>

          {page.stats.length > 0 && (
            <div className="about-home__stats">
              {page.stats.map((stat, statIndex) => {
                const hasPlus = stat.value.endsWith('+');
                const number = hasPlus ? stat.value.slice(0, -1) : stat.value;

                return (
                  <div
                    key={stat.id}
                    className="about-home__reveal"
                    style={{ '--reveal-delay': `${0.24 + statIndex * 0.06}s` }}
                  >
                    <div className="about-home__stat-value">
                      <span>{number}</span>
                      {hasPlus && '+'}
                    </div>
                    <div className="about-home__stat-label">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          )}

          <Link className="about-home__button about-home__reveal" to="/about" style={{ '--reveal-delay': '0.42s' }}>
            Learn More About Us <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default AboutHome;
