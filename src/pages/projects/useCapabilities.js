import { useEffect, useState } from 'react';
import { drupalApi } from '../../services/api/axios.config';
import { parseDrupalMultipleNodes } from '../../utils/drupalParser';

export function useCapabilities() {
  const [title, setTitle] = useState('');
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await drupalApi.get('/jsonapi/node/alomrania_capabilities');
        const node = parseDrupalMultipleNodes(data)[0];
        if (!node) return;

        const texts = Array.isArray(node.field_multiple_text)
          ? node.field_multiple_text.filter(Boolean)
          : [];

        setTitle(node.title || '');
        setItems(texts);
      } catch (error) {
        console.log(error);
      } finally {
        setLoaded(true);
      }
    };

    fetchData();
  }, []);

  return { title, items, loaded };
}
