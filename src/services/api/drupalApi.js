import { drupalApi, DRUPAL_BASE_URL } from './axios.config';

/**
 * imageFields: array of image field configs
 * [
 *   { fieldName: 'field_image',       mode: 'file' },
 *   { fieldName: 'field_media_image', mode: 'media', mediaSourceField: 'field_media_image' },
 * ]
 */

// ─── Internal helpers ─────────────────────────────────────────────────────────

const resolveImageFields = (nodes, included = [], imageFields = []) => {
  const mediaById = {};
  const filesById = {};

  included.forEach((item) => {
    if (item.type === 'file--file') filesById[item.id] = item;
    if (item.type.startsWith('media--')) mediaById[item.id] = item;
  });

  const resolveRef = (ref, mode, mediaSourceField) => {
    if (!ref) return null;

    if (mode === 'file') {
      return filesById[ref.id] ?? null;
    }

    if (mode === 'media') {
      const media = mediaById[ref.id];
      if (!media) return null;
      const fileRef = media.relationships?.[mediaSourceField]?.data;
      return {
        ...media,
        file: fileRef ? filesById[fileRef.id] ?? null : null,
      };
    }

    return null;
  };

  return nodes.map((node) => {
    const resolved = {};

    imageFields.forEach(({ fieldName, mode = 'file', mediaSourceField = 'field_media_image' }) => {
      const rel = node.relationships?.[fieldName]?.data;

      if (!Array.isArray(rel)) {
        resolved[`${fieldName}_resolved`] = resolveRef(rel, mode, mediaSourceField);
      } else {
        resolved[`${fieldName}_resolved`] = rel
          .map((r) => resolveRef(r, mode, mediaSourceField))
          .filter(Boolean);
      }
    });

    return { ...node, ...resolved };
  });
};

const buildInclude = (imageFields = []) =>
  imageFields
    .flatMap(({ fieldName, mode, mediaSourceField = 'field_media_image' }) =>
      mode === 'media'
        ? [`${fieldName}`, `${fieldName}.${mediaSourceField}`]
        : [`${fieldName}`]
    )
    .join(',');

const buildPool = (included) => {
  const byId  = {};
  const files = {};
  const media = {};
  const terms = {};

  included.forEach((item) => {
    byId[item.id] = item;
    if (item.type === 'file--file')                  files[item.id] = item;
    else if (item.type.startsWith('media--'))         media[item.id] = item;
    else if (item.type.startsWith('taxonomy_term--')) terms[item.id] = item;
  });

  return { byId, files, media, terms };
};

const buildFullInclude = ({ imageFields = [], documentFields = [], taxonomyFields = [], paragraphField = 'field_paragraphs', paragraphFields = {} }) => {
  const paths = new Set();

  const addImagePaths = (prefix, fields) => {
    fields.forEach(({ fieldName, mode, mediaSourceField = 'field_media_image' }) => {
      const p = prefix ? `${prefix}.${fieldName}` : fieldName;
      paths.add(p);
      if (mode === 'media') paths.add(`${p}.${mediaSourceField}`);
    });
  };

  const addDocumentPaths = (prefix, fields) => {
    fields.forEach(({ fieldName, mediaSourceField = 'field_media_file' }) => {
      const p = prefix ? `${prefix}.${fieldName}` : fieldName;
      paths.add(p);
      paths.add(`${p}.${mediaSourceField}`);
    });
  };

  const addTaxonomyPaths = (prefix, fields) => {
    fields.forEach(({ fieldName, termImageFields = [], termDocumentFields = [] }) => {
      const p = prefix ? `${prefix}.${fieldName}` : fieldName;
      paths.add(p);
      addImagePaths(p, termImageFields);
      addDocumentPaths(p, termDocumentFields);
    });
  };

  addImagePaths('', imageFields);
  addDocumentPaths('', documentFields);
  addTaxonomyPaths('', taxonomyFields);

  if (paragraphField) {
    paths.add(paragraphField);
    Object.values(paragraphFields).forEach((cfg) => {
      addImagePaths(paragraphField, cfg.imageFields    ?? []);
      addDocumentPaths(paragraphField, cfg.documentFields ?? []);
      addTaxonomyPaths(paragraphField, cfg.taxonomyFields ?? []);
    });
  }

  return [...paths].join(',');
};

const resolveMediaRef = (ref, pool, mode, mediaSourceField) => {
  if (!ref) return null;
  if (mode === 'file') return pool.files[ref.id] ?? null;
  if (mode === 'media') {
    const mediaEntity = pool.media[ref.id];
    if (!mediaEntity) return null;
    const fileRef = mediaEntity.relationships?.[mediaSourceField]?.data;
    return { ...mediaEntity, file: fileRef ? pool.files[fileRef.id] ?? null : null };
  }
  return null;
};

const resolveDocumentRef = (ref, pool, mediaSourceField) => {
  if (!ref) return null;
  const mediaEntity = pool.media[ref.id];
  if (!mediaEntity) return null;
  const fileRef = mediaEntity.relationships?.[mediaSourceField]?.data;
  return { ...mediaEntity, file: fileRef ? pool.files[fileRef.id] ?? null : null };
};

const resolveAllFields = (entity, pool, { imageFields = [], documentFields = [], taxonomyFields = [] }) => {
  const resolved = {};

  imageFields.forEach(({ fieldName, mode = 'file', mediaSourceField = 'field_media_image' }) => {
    const rel = entity.relationships?.[fieldName]?.data;
    resolved[`${fieldName}_resolved`] = Array.isArray(rel)
      ? rel.map((r) => resolveMediaRef(r, pool, mode, mediaSourceField)).filter(Boolean)
      : resolveMediaRef(rel, pool, mode, mediaSourceField);
  });

  documentFields.forEach(({ fieldName, mediaSourceField = 'field_media_file' }) => {
    const rel = entity.relationships?.[fieldName]?.data;
    resolved[`${fieldName}_resolved`] = Array.isArray(rel)
      ? rel.map((r) => resolveDocumentRef(r, pool, mediaSourceField)).filter(Boolean)
      : resolveDocumentRef(rel, pool, mediaSourceField);
  });

  taxonomyFields.forEach(({ fieldName, termImageFields = [], termDocumentFields = [] }) => {
    const rel = entity.relationships?.[fieldName]?.data;

    const resolveTerm = (ref) => {
      if (!ref) return null;
      const term = pool.terms[ref.id];
      if (!term) return null;
      if (!termImageFields.length && !termDocumentFields.length) return term;
      return resolveAllFields(term, pool, {
        imageFields:    termImageFields,
        documentFields: termDocumentFields,
        taxonomyFields: [],
      });
    };

    resolved[`${fieldName}_resolved`] = Array.isArray(rel)
      ? rel.map(resolveTerm).filter(Boolean)
      : resolveTerm(rel);
  });

  return { ...entity, ...resolved };
};

const resolveParagraphsFromPool = (node, pool, paragraphField, paragraphFields) => {
  const rel = node.relationships?.[paragraphField]?.data;
  if (!rel) return [];

  return (Array.isArray(rel) ? rel : [rel])
    .map((ref) => {
      const paragraph = pool.byId[ref.id];
      if (!paragraph) return null;
      const typeConfig = paragraphFields[paragraph.type];
      if (!typeConfig) return paragraph;
      return resolveAllFields(paragraph, pool, {
        imageFields:    typeConfig.imageFields    ?? [],
        documentFields: typeConfig.documentFields ?? [],
        taxonomyFields: typeConfig.taxonomyFields ?? [],
      });
    })
    .filter(Boolean);
};

export const normalizeDrupalUrl = (url) => {
  if (!url) return null;
  return url.replace('http://modest-turquoise-bear.168-235-125-96.cpanel.site', '');
};

// ─── GET all nodes ────────────────────────────────────────────────────────────

export const getNodes = async (type, imageFields = [], filters = {}) => {
  const include = buildInclude(imageFields);

  const params = {};
  if (include) params.include = include;
  Object.entries(filters).forEach(([key, value]) => {
    params[`filter[${key}]`] = value;
  });

  const { data } = await drupalApi.get(`/jsonapi/node/${type}`, { params });

  return imageFields.length
    ? resolveImageFields(data.data, data.included ?? [], imageFields)
    : data.data;
};

// ─── GET single node by UUID ──────────────────────────────────────────────────

export const getNode = async (type, uuid, imageFields = []) => {
  const include = buildInclude(imageFields);
  const params = include ? { include } : {};

  const { data } = await drupalApi.get(`/jsonapi/node/${type}/${uuid}`, { params });

  const nodes = resolveImageFields([data.data], data.included ?? [], imageFields);
  return nodes[0];
};

// ─── GET taxonomy terms ───────────────────────────────────────────────────────

export const getTerms = async (vocabulary, imageFields = [], filters = {}) => {
  const include = buildInclude(imageFields);

  const params = {};
  if (include) params.include = include;
  Object.entries(filters).forEach(([key, value]) => {
    params[`filter[${key}]`] = value;
  });

  const { data } = await drupalApi.get(`/jsonapi/taxonomy_term/${vocabulary}`, { params });

  return imageFields.length
    ? resolveImageFields(data.data, data.included ?? [], imageFields)
    : data.data;
};

// ─── GET single taxonomy term by UUID ────────────────────────────────────────

export const getTerm = async (vocabulary, uuid, imageFields = []) => {
  const include = buildInclude(imageFields);
  const params = include ? { include } : {};

  const { data } = await drupalApi.get(`/jsonapi/taxonomy_term/${vocabulary}/${uuid}`, { params });

  const terms = resolveImageFields([data.data], data.included ?? [], imageFields);
  return terms[0];
};

// ─── GET single taxonomy term by Drupal internal TID ─────────────────────────

export const getTermByTid = async (vocabulary, tid, imageFields = []) => {
  const include = buildInclude(imageFields);

  const params = { 'filter[drupal_internal__tid]': tid };
  if (include) params.include = include;

  const { data } = await drupalApi.get(`/jsonapi/taxonomy_term/${vocabulary}`, { params });

  if (!data.data?.length) return null;

  const terms = resolveImageFields(data.data, data.included ?? [], imageFields);
  return terms[0];
};

// ─── GET single node with paragraphs, media images, media documents, taxonomy ─

/**
 * imageFields:    [{ fieldName, mode: 'file'|'media', mediaSourceField? }]
 * documentFields: [{ fieldName, mediaSourceField? }]
 * taxonomyFields: [{ fieldName, termImageFields?, termDocumentFields? }]
 * paragraphField: 'field_paragraphs'
 * paragraphFields: {
 *   'paragraph--type': { imageFields, documentFields, taxonomyFields }
 * }
 */
export const getNodeFull = async (
  type,
  uuid,
  {
    imageFields    = [],
    documentFields = [],
    taxonomyFields = [],
    paragraphField  = 'field_paragraphs',
    paragraphFields = {},
  } = {}
) => {
  const include = buildFullInclude({ imageFields, documentFields, taxonomyFields, paragraphField, paragraphFields });
  const params = include ? { include } : {};

  const { data } = await drupalApi.get(`/jsonapi/node/${type}/${uuid}`, { params });

  const pool = buildPool(data.included ?? []);
  const node = resolveAllFields(data.data, pool, { imageFields, documentFields, taxonomyFields });
  const paragraphs = resolveParagraphsFromPool(node, pool, paragraphField, paragraphFields);

  return { ...node, [`${paragraphField}_resolved`]: paragraphs };
};

// ─── GET all nodes with paragraphs, media images, media documents, taxonomy ───

export const getNodesFull = async (
  type,
  {
    imageFields    = [],
    documentFields = [],
    taxonomyFields = [],
    paragraphField  = 'field_paragraphs',
    paragraphFields = {},
    filters         = {},
  } = {}
) => {
  const include = buildFullInclude({ imageFields, documentFields, taxonomyFields, paragraphField, paragraphFields });

  const params = {};
  if (include) params.include = include;
  Object.entries(filters).forEach(([key, value]) => {
    params[`filter[${key}]`] = value;
  });

  const { data } = await drupalApi.get(`/jsonapi/node/${type}`, { params });

  const pool = buildPool(data.included ?? []);

  return data.data.map((entity) => {
    const node = resolveAllFields(entity, pool, { imageFields, documentFields, taxonomyFields });
    const paragraphs = resolveParagraphsFromPool(node, pool, paragraphField, paragraphFields);
    return { ...node, [`${paragraphField}_resolved`]: paragraphs };
  });
};

// ─── GET single node by Drupal internal ID (nid) ─────────────────────────────

export const getNodeByNid = async (type, nid, imageFields = []) => {
  const include = buildInclude(imageFields);

  const params = { 'filter[drupal_internal__nid]': nid };
  if (include) params.include = include;

  const { data } = await drupalApi.get(`/jsonapi/node/${type}`, { params });

  if (!data.data?.length) return null;

  const nodes = resolveImageFields(data.data, data.included ?? [], imageFields);
  return nodes[0];
};

// ─── GET single node by nid — full resolution (paragraphs, docs, taxonomy) ───

export const getNodeFullByNid = async (
  type,
  nid,
  {
    imageFields    = [],
    documentFields = [],
    taxonomyFields = [],
    paragraphField  = 'field_paragraphs',
    paragraphFields = {},
  } = {}
) => {
  const include = buildFullInclude({ imageFields, documentFields, taxonomyFields, paragraphField, paragraphFields });

  const params = { 'filter[drupal_internal__nid]': nid };
  if (include) params.include = include;

  const { data } = await drupalApi.get(`/jsonapi/node/${type}`, { params });

  if (!data.data?.length) return null;

  const pool = buildPool(data.included ?? []);
  const node = resolveAllFields(data.data[0], pool, { imageFields, documentFields, taxonomyFields });
  const paragraphs = resolveParagraphsFromPool(node, pool, paragraphField, paragraphFields);

  return { ...node, [`${paragraphField}_resolved`]: paragraphs };
};

// ─── Submit webform ───────────────────────────────────────────────────────────

export const submitWebform = async (webformId, formData) => {
  const { data } = await drupalApi.post(`/webform_rest/${webformId}/submit`, {
    webform_id: webformId,
    ...formData,
  });
  return data;
};

// ─── Fetch menu items ─────────────────────────────────────────────────────────

export const fetchMenuItems = async (menuName = 'main') => {
  const { data } = await drupalApi.get(`/jsonapi/menu_items/${menuName}`);
  return data.data
    .map((item) => ({
      id:     item.id,
      title:  item.attributes.title,
      url:    item.attributes.url,
      weight: item.attributes.weight,
    }))
    .sort((a, b) => a.weight - b.weight);
};