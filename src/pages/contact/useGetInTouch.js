import { useEffect, useState } from 'react';
import { drupalApi, DRUPAL_BASE_URL } from '../../services/api/axios.config';
import { parseDrupalMultipleNodes } from '../../utils/drupalParser';

const linesFromHtml = (html) =>
  (html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const mapSrcFromBody = (html) => {
  const match = (html || '').match(/<iframe\b[^>]*\ssrc=["']([^"']+)["']/i);
  return match ? match[1] : '';
};

export function useGetInTouch() {
  const [contact, setContact] = useState({ title: '', cards: [], mapSrc: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await drupalApi.get('/jsonapi/node/get_in_touch', {
          params: {
            include: 'field_contact_cards,field_contact_cards.field_img,field_contact_cards.field_img.field_media_image',
          },
        });
        const node = parseDrupalMultipleNodes(data, DRUPAL_BASE_URL)[0];
        if (!node) return;

        setContact({
          title: (node.title || '').trim(),
          mapSrc: mapSrcFromBody(node.body),
          cards: (node.paragraphs?.field_contact_cards || [])
            .map((card) => ({
              id: card.id,
              label: (card.title || card.field_title || '').trim(),
              lines: linesFromHtml(card.body),
              image: card.image || card.field_img || '',
            }))
            .filter((card) => card.label || card.lines.length),
        });
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  return contact;
}
