import { useEffect, useRef, useState } from 'react';
import { drupalApi, DRUPAL_BASE_URL } from '../../services/api/axios.config';
import { parseDrupalMultipleNodes } from '../../utils/drupalParser';
import './WhyOmrania.css';

const toPlainText = (html) =>
  (html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();

const mapPage = (node) => ({
  id: node.id,
  highlight: node.field_highlight || '',
  title: node.title || '',
  description: toPlainText(node.body),
  cards: (node.paragraphs?.field_cards || []).map((card) => ({
    id: card.id,
    title: card.title || card.field_title || '',
    body: toPlainText(card.body || card.field_body?.processed || card.field_body?.value || ''),
    image: card.image || '',
  })),
});

function WhyOmrania() {
  const [page, setPage] = useState(null);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await drupalApi.get('/jsonapi/node/why_omaria', {
          params: {
            include: 'field_cards,field_cards.field_img,field_cards.field_img.field_media_image',
          },
        });
        const nodes = parseDrupalMultipleNodes(data, DRUPAL_BASE_URL).sort(
          (a, b) => (a.rawAttributes?.drupal_internal__nid || 0) - (b.rawAttributes?.drupal_internal__nid || 0)
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

  return (
    <section ref={sectionRef} className={inView ? 'why is-visible' : 'why'} dir="ltr">
      <div className="why__inner">
        <div className="why__heading why__reveal">
          <div className="why__eyebrow">
            <span className="why__eyebrow-line" />
            <span className="why__eyebrow-label">{page.highlight}</span>
            <span className="why__eyebrow-line" />
          </div>
          <h2 className="why__title">{page.title}</h2>
        </div>

        <p className="why__intro why__reveal" style={{ '--reveal-delay': '0.1s' }}>{page.description}</p>

        <div className="why__grid">
          {page.cards.map((card) => (
            <article key={card.id} className="why__card">
              {card.image && (
                <div className="why__icon">
                  <img src={card.image} alt="" />
                </div>
              )}
              <h3 className="why__card-title">{card.title}</h3>
              <p className="why__card-body">{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyOmrania;
