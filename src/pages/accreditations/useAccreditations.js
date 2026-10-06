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

const paragraphsFromHtml = (html) => {
  const matches = [...(html || '').matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
  const paragraphs = matches.map((match) => toPlainText(match[1])).filter(Boolean);
  return paragraphs.length > 0 ? paragraphs : [toPlainText(html)].filter(Boolean);
};

const mapAccreditation = (node) => {
  const code = node.field_code || '';

  return {
    id: node.id,
    title: (node.title || '').trim(),
    code,
    badge: code.trim().split(/\s+/)[0] || '',
    subtitle: node.field_sub_title || '',
    organization: node.field_organization_name || '',
    description: toPlainText(node.body),
    image: node.image || '',
  };
};

export function useAccreditations() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await drupalApi.get('/jsonapi/node/our_accreditations', {
          params: { include: 'field_img.field_media_image' },
        });
        const nodes = parseDrupalMultipleNodes(data, DRUPAL_BASE_URL).sort(
          (a, b) => (a.rawAttributes?.drupal_internal__nid || 0) - (b.rawAttributes?.drupal_internal__nid || 0)
        );
        setItems(nodes.map(mapAccreditation));
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  return items;
}

const mapStandardRow = (paragraph) => ({
  id: paragraph.id,
  category: (paragraph.title || paragraph.field_title || '').trim(),
  value: toPlainText(paragraph.body).replace(/\s+/g, ' '),
});

export function useProductStandards() {
  const [standards, setStandards] = useState({ title: '', rows: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await drupalApi.get('/jsonapi/node/product_standards', {
          params: { include: 'field_product_standards' },
        });
        const node = parseDrupalMultipleNodes(data, DRUPAL_BASE_URL)[0];
        if (!node) return;

        setStandards({
          title: (node.title || '').trim(),
          rows: (node.paragraphs?.field_product_standards || [])
            .map(mapStandardRow)
            .filter((row) => row.category || row.value),
        });
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  return standards;
}

export function useOurQuality() {
  const [quality, setQuality] = useState({ title: '', paragraphs: [], checks: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await drupalApi.get('/jsonapi/node/our_quality');
        const node = parseDrupalMultipleNodes(data, DRUPAL_BASE_URL)[0];
        if (!node) return;

        const checks = Array.isArray(node.field_multiple_text)
          ? node.field_multiple_text
          : [node.field_multiple_text].filter(Boolean);

        setQuality({
          title: (node.title || '').trim(),
          paragraphs: paragraphsFromHtml(node.body),
          checks: checks.map((item) => String(item).trim()).filter(Boolean),
        });
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  return quality;
}
