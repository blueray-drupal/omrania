import { useEffect, useState } from 'react';
import { drupalApi, DRUPAL_BASE_URL } from '../../services/api/axios.config';
import { parseDrupalMultipleNodes } from '../../utils/drupalParser';

const imageOf = (node) => {
  if (typeof node.image === 'string' && node.image) return node.image;
  if (typeof node.field_image === 'string' && node.field_image) return node.field_image;
  return '';
};

export function useProductCategories() {
  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await drupalApi.get('/jsonapi/taxonomy_term/product_categories', {
          params: { include: 'field_image.field_media_image' },
        });
        const terms = parseDrupalMultipleNodes(data, DRUPAL_BASE_URL)
          .map((node) => ({
            id: node.id,
            name: node.rawAttributes?.name || '',
            body: typeof node.field_body === 'string' ? node.field_body : '',
            image: imageOf(node),
            weight: node.rawAttributes?.weight ?? 0,
            tid: node.rawAttributes?.drupal_internal__tid || 0,
          }))
          .filter((term) => term.name)
          .sort((a, b) => a.weight - b.weight || a.tid - b.tid);

        setCategories(terms);
      } catch (error) {
        console.log(error);
      } finally {
        setLoaded(true);
      }
    };

    fetchData();
  }, []);

  return { categories, loaded };
}
