import { useEffect, useMemo, useState } from 'react';
import { drupalApi, DRUPAL_BASE_URL } from '../../services/api/axios.config';
import { parseDrupalMultipleNodes } from '../../utils/drupalParser';

const mapProject = (node) => {
  const sector = node.field_sector;
  const texts = Array.isArray(node.field_multiple_text)
    ? node.field_multiple_text.filter(Boolean)
    : [];

  return {
    id: node.id,
    title: (node.title || '').trim(),
    location: node.field_location || '',
    sector: sector?.name || '',
    year: (node.field_date || '').slice(0, 4),
    scope: texts,
    description: texts.join(', '),
    image: node.image || '',
  };
};

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await drupalApi.get('/jsonapi/node/projects', {
          params: { include: 'field_img.field_media_image,field_sector' },
        });
        const nodes = parseDrupalMultipleNodes(data, DRUPAL_BASE_URL).sort(
          (a, b) => (a.rawAttributes?.drupal_internal__nid || 0) - (b.rawAttributes?.drupal_internal__nid || 0)
        );
        setProjects(nodes.map(mapProject));
      } catch (error) {
        console.log(error);
      } finally {
        setLoaded(true);
      }
    };

    fetchData();
  }, []);

  const sectors = useMemo(() => {
    const names = [];
    projects.forEach((project) => {
      if (project.sector && !names.includes(project.sector)) {
        names.push(project.sector);
      }
    });
    return names;
  }, [projects]);

  return { projects, sectors, loaded };
}
