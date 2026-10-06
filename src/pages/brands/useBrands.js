import { useEffect, useState } from 'react';
import { drupalApi, DRUPAL_BASE_URL } from '../../services/api/axios.config';
import { parseDrupalMultipleNodes } from '../../utils/drupalParser';

const toPlainText = (html) =>
  (html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .trim();

const mapBrand = (node) => ({
  id: node.id,
  title: (node.title || '').trim(),
  subtitle: node.field_sub_title || '',
  location: node.field_location || '',
  description: toPlainText(node.body),
  image: node.image || '',
});

export function buildBrandLoop(brands) {
  if (brands.length === 0) return [];

  let row = [...brands];
  while (row.length < 10) {
    row = row.concat(brands);
  }

  return [...row, ...row];
}

export function useBrands() {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await drupalApi.get('/jsonapi/node/brands', {
          params: { include: 'field_img.field_media_image' },
        });
        const nodes = parseDrupalMultipleNodes(data, DRUPAL_BASE_URL).sort(
          (a, b) => (a.rawAttributes?.drupal_internal__nid || 0) - (b.rawAttributes?.drupal_internal__nid || 0)
        );
        setBrands(nodes.map(mapBrand));
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  return brands;
}
