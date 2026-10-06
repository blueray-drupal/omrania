import { useEffect, useState } from 'react';
import { drupalApi, DRUPAL_BASE_URL } from '../../services/api/axios.config';
import { parseDrupalMultipleNodes } from '../../utils/drupalParser';

function plainText(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstImage(node) {
  const candidates = [node.field_img, node.image];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate) return candidate;
    if (Array.isArray(candidate) && typeof candidate[0] === 'string' && candidate[0]) {
      return candidate[0];
    }
  }
  return '';
}

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await drupalApi.get('/jsonapi/node/products', {
          params: {
            include: 'field_img.field_media_image,field_category,field_technical_specifications',
          },
        });

        const nodes = parseDrupalMultipleNodes(data, DRUPAL_BASE_URL)
          .map((node) => {
            const specs = node.paragraphs?.field_technical_specifications || [];
            return {
              id: node.id,
              nid: node.rawAttributes?.drupal_internal__nid || 0,
              title: node.title,
              body: plainText(node.body),
              image: firstImage(node),
              categoryId: node.field_category?.id || '',
              categoryName: node.field_category?.name || '',
              specs: specs.map((spec) => ({
                id: spec.id,
                label: plainText(spec.title),
                value: plainText(spec.body),
              })).filter((spec) => spec.label || spec.value),
            };
          })
          .filter((product) => product.title)
          .sort((a, b) => a.nid - b.nid);

        setProducts(nodes);
      } catch (error) {
        console.log(error);
      } finally {
        setLoaded(true);
      }
    };

    fetchData();
  }, []);

  return { products, loaded };
}
