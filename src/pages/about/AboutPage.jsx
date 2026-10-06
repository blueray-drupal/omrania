import { useEffect, useRef, useState } from 'react';
import { drupalApi, DRUPAL_BASE_URL } from '../../services/api/axios.config';
import { parseDrupalMultipleNodes } from '../../utils/drupalParser';
import './AboutPage.css';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1758518731706-be5d5230e5a5?w=1920&h=600&fit=crop&auto=format';

const toPlainText = (html) =>
  (html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();

const paragraphsFromHtml = (html) => {
  const matches = [...(html || '').matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
  const paragraphs = matches.map((match) => toPlainText(match[1])).filter(Boolean);
  return paragraphs.length > 0 ? paragraphs : [toPlainText(html)].filter(Boolean);
};

const imagesOf = (node) => {
  if (Array.isArray(node.field_img) && node.field_img.length > 0) return node.field_img;
  return node.image ? [node.image] : [];
};

const mapNode = (node) => ({
  id: node.id,
  highlight: (node.field_highlight || '').trim(),
  title: node.title || '',
  paragraphs: paragraphsFromHtml(node.body),
  images: imagesOf(node),
  items: (node.paragraphs?.field_title_body || [])
    .map((item) => ({
      id: item.id,
      title: item.title || item.field_title || '',
      text: toPlainText(item.body || item.field_body?.processed || item.field_body?.value || ''),
    }))
    .filter((item) => item.title || item.text),
});

function splitTitle(title) {
  const marker = ' of ';
  const index = title.toLowerCase().lastIndexOf(marker);
  if (index === -1) return { lead: title, accent: '' };
  return {
    lead: title.slice(0, index + marker.length),
    accent: title.slice(index + marker.length),
  };
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AboutPage() {
  const [top, setTop] = useState(null);
  const [bottom, setBottom] = useState(null);
  const [inView, setInView] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await drupalApi.get('/jsonapi/node/about_us', {
          params: { include: 'field_img.field_media_image,field_title_body' },
        });
        const nodes = parseDrupalMultipleNodes(data, DRUPAL_BASE_URL);
        const topNode = nodes.find((node) => node.field_classification === 'about_top');
        const bottomNode = nodes.find((node) => node.field_classification === 'about_bottom');
        if (topNode) setTop(mapNode(topNode));
        if (bottomNode) setBottom(mapNode(bottomNode));
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const node = bodyRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setInView(true);
      observer.disconnect();
    }, { threshold: 0.15 });

    observer.observe(node);
    return () => observer.disconnect();
  }, [top, bottom]);

  const titleParts = splitTitle(top?.title || '');

  return (
    <div className="about-page" dir="ltr">
      <section className="about-page__hero">
        <img src={HERO_IMAGE} alt="" />
        <div className="about-page__hero-shade" />
        <div className="blueprint-grid" />
        <div className="about-page__hero-copy">
          <div className="about-page__hero-eyebrow">
            <span />
            <span>ABOUT AL OMRANIA</span>
            <span />
          </div>
          <h1>
            Leading Stockiest &
            <br />
            Trading Company
          </h1>
          <p>Specialized in the supply and trading of piping and mechanical products since 2008.</p>
        </div>
      </section>

      <div
        ref={bodyRef}
        className={inView ? 'about-page__body is-visible' : 'about-page__body'}
      >
        {top && (
          <div className="about-page__story">
            <div className="about-page__reveal">
              <h2>
                {titleParts.lead}
                {titleParts.accent && <span>{titleParts.accent}</span>}
              </h2>
              {top.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {top.images[0] && (
              <div className="about-page__photo about-page__reveal" style={{ '--reveal-delay': '0.1s' }}>
                <img src={top.images[0]} alt={top.title} />
              </div>
            )}
          </div>
        )}

        {bottom && (
          <div className="about-page__sectors">
            <div className="about-page__reveal">
              <div className="about-page__heading">
                {bottom.highlight && (
                  <div className="about-page__eyebrow">
                    <span />
                    <span>{bottom.highlight}</span>
                    <span />
                  </div>
                )}
                <h2>{bottom.title}</h2>
              </div>
              {bottom.items.length > 0 && (
                <ul>
                  {bottom.items.map((item) => (
                    <li key={item.id}>
                      <span className="about-page__check"><CheckIcon /></span>
                      <div>
                        {item.title && <strong>{item.title}</strong>}
                        {item.text && <> {item.text}</>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {bottom.images.length > 0 && (
              <div className={`about-page__photos${bottom.images.length > 1 ? ' is-pair' : ''}`}>
                {bottom.images.map((src, index) => (
                  <div className="about-page__photo" key={`${src}-${index}`}>
                    <img src={src} alt="" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AboutPage;
