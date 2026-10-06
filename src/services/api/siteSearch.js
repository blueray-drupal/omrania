import { drupalApi } from './axios.config.js';

const stripHtml = (html = '') =>
  html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

export const STATIC_SEARCH_PAGES = [
  {
    title: 'الرئيسية',
    path: '/',
    badge: 'صفحة',
    description: 'الصفحة الرئيسية لمرصد المرأة الأردني.',
  },
  {
    title: 'كلمة سمو الأميرة',
    path: '/about-princess-message',
    badge: 'عن المرصد',
    description: 'كلمة سمو الأميرة بسمة بنت طلال حول مرصد المرأة الأردني.',
  },
  {
    title: 'نظرة عامة',
    path: '/about-princess-message#overview',
    badge: 'عن المرصد',
    description: 'نظرة عامة حول مرصد المرأة الأردني وأهدافه.',
  },
  {
    title: 'محاور البيانات',
    path: '/data-axsis/20',
    badge: 'بيانات',
    description: 'محاور ومؤشرات بيانات أوضاع المرأة الأردنية.',
  },
  {
    title: 'المشاركة في سوق العمل',
    path: '/data-axsis/25',
    badge: 'بيانات',
    description: 'بيانات ومؤشرات مشاركة المرأة في سوق العمل.',
  },
  {
    title: 'التشريعات والوثائق',
    path: '/legislation',
    badge: 'سياسات',
    description: 'التشريعات والوثائق المتعلقة بحقوق المرأة.',
  },
  {
    title: 'الاستراتيجيات الوطنية',
    path: '/national-strategies',
    badge: 'سياسات',
    description: 'الاستراتيجيات الوطنية ذات الصلة بالمرأة.',
  },
  {
    title: 'الاتفاقيات',
    path: '/agreements',
    badge: 'سياسات',
    description: 'الاتفاقيات والمعاهدات الدولية والوطنية.',
  },
  {
    title: 'دراسات وأوراق سياسات',
    path: '/studies',
    badge: 'دراسات',
    description: 'الدراسات والأوراق البحثية والسياسات.',
  },
  {
    title: 'المؤشرات الدولية',
    path: '/international-indicators',
    badge: 'بيانات',
    description: 'مقارنة المؤشرات الوطنية بالمعايير الدولية.',
  },
  {
    title: 'اتصل بنا',
    path: '/contact',
    badge: 'تواصل',
    description: 'طرق التواصل مع مرصد المرأة الأردني.',
  },
];

const SEARCHABLE_CONTENT = [
  {
    type: 'policies',
    badge: 'تشريعات',
    getPath: (node) => `/legislation/${node.attributes.drupal_internal__nid}`,
    getDescription: (node) =>
      stripHtml(node.attributes.field_breif?.processed || node.attributes.field_breif?.value || ''),
  },
  {
    type: 'studies_and_papers',
    badge: 'دراسات',
    getPath: () => '/studies',
    getDescription: (node) =>
      stripHtml(
        node.attributes.body?.summary ||
          node.attributes.body?.processed ||
          node.attributes.body?.value ||
          ''
      ),
  },
  {
    type: 'about_us',
    badge: 'عن المرصد',
    getPath: () => '/about-princess-message',
    getDescription: (node) =>
      stripHtml(
        node.attributes.body?.summary ||
          node.attributes.body?.processed ||
          node.attributes.body?.value ||
          ''
      ),
  },
];

function matchesQuery(text, query) {
  return text.toLowerCase().includes(query.toLowerCase());
}

function filterStaticPages(query) {
  return STATIC_SEARCH_PAGES.filter(
    (page) =>
      matchesQuery(page.title, query) ||
      matchesQuery(page.description, query) ||
      matchesQuery(page.badge, query)
  );
}

async function searchNodesByTitle(type, query) {
  const { data } = await drupalApi.get(`/jsonapi/node/${type}`, {
    params: {
      'filter[status]': 1,
      'filter[title][condition][path]': 'title',
      'filter[title][condition][operator]': 'CONTAINS',
      'filter[title][condition][value]': query,
      'page[limit]': 20,
    },
  });

  return data.data ?? [];
}

function mapDrupalResults(nodes, config) {
  return nodes.map((node) => ({
    id: node.id,
    title: node.attributes.title,
    path: config.getPath(node),
    badge: config.badge,
    description: config.getDescription(node) || config.badge,
  }));
}

export async function searchSite(query) {
  const term = query.trim();
  if (!term) return [];

  const staticResults = filterStaticPages(term);

  const drupalBatches = await Promise.allSettled(
    SEARCHABLE_CONTENT.map(async (config) => {
      const nodes = await searchNodesByTitle(config.type, term);
      return mapDrupalResults(nodes, config);
    })
  );

  const drupalResults = drupalBatches
    .filter((batch) => batch.status === 'fulfilled')
    .flatMap((batch) => batch.value);

  const seen = new Set();
  const merged = [];

  [...staticResults, ...drupalResults].forEach((item) => {
    const key = `${item.path}::${item.title}`;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(item);
  });

  return merged;
}
