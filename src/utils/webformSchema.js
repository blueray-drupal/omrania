/**
 * webformSchema.js
 *
 * Parses the raw response of `GET /webform_rest/{id}/elements` into a flat,
 * normalised field list. Shared by the generic <DrupalWebform /> component and
 * by pages that keep a custom layout but still want Drupal to drive the
 * options and the required flags.
 */

// ─── Type tables ──────────────────────────────────────────────────────────────

export const RENDERABLE_TYPES = new Set([
  'textfield', 'email', 'tel', 'url', 'number', 'date', 'datetime',
  'textarea', 'select', 'radios', 'checkboxes',
  'file', 'webform_document_file', 'hidden',
]);

export const SKIP_TYPES = new Set([
  'actions', 'webform_actions', 'submit', 'button',
  'captcha', 'captcha_element',
  'webform_markup', 'markup', 'processed_text',
  'label', 'webform_horizontal_rule', 'horizontal_rule',
]);

export const CONTAINER_TYPES = new Set([
  'fieldset', 'container', 'details',
  'flexbox', 'webform_flexbox', 'webform_section',
  'field_group', 'item',
]);

export const TYPE_ALIASES = {
  webform_select:       'select',
  webform_email:        'email',
  webform_telephone:    'tel',
  telephone:            'tel',
  managed_file:         'file',
  webform_image_file:   'file',
  webform_audio_file:   'file',
  webform_video_file:   'file',
  webform_document_file:'file',
  integer:              'number',
  numeric:              'number',
  float:                'number',
  webform_number:       'number',
  webform_date:         'date',
  datetime:             'datetime',
  webform_datetime:     'datetime',
  checkbox:             'checkbox',
};

// ─── Parsing ──────────────────────────────────────────────────────────────────

export const normalizeType = (rawType) => TYPE_ALIASES[rawType] ?? rawType;

/** Drupal sometimes nests everything under an `elements` key — unwrap it. */
export const unwrap = (raw) => {
  if (!raw || typeof raw !== 'object') return {};
  if (raw.elements && typeof raw.elements === 'object' && !raw.elements['#type']) {
    return raw.elements;
  }
  return raw;
};

/** Walks containers recursively and returns [key, element, normalisedType] tuples. */
export const collectFields = (obj, acc = []) => {
  if (!obj || typeof obj !== 'object') return acc;

  for (const [key, el] of Object.entries(obj)) {
    if (!el || typeof el !== 'object') continue;
    const rawType = el['#type'];
    if (!rawType) continue;
    if (SKIP_TYPES.has(rawType)) continue;

    if (CONTAINER_TYPES.has(rawType)) {
      const children = {};
      for (const [k, v] of Object.entries(el)) {
        if (!k.startsWith('#') && !k.startsWith('__') && v && typeof v === 'object' && v['#type']) {
          children[k] = v;
        }
      }
      collectFields(children, acc);
      continue;
    }

    if (el['#webform_element'] === false) continue;
    if (el['#access']          === false) continue;

    let type = normalizeType(rawType);
    if (!RENDERABLE_TYPES.has(type)) type = 'textfield';

    const fieldKey = el['#webform_key'] ?? key;
    acc.push([fieldKey, el, type]);
  }

  return acc;
};

export const parseOptions = (el) => {
  const raw = el['#options'];
  if (!raw || typeof raw !== 'object') return [];
  return Object.entries(raw)
    .filter(([value]) => value !== '_none_')
    .map(([value, label]) => ({ value, label: label != null ? String(label) : String(value) }));
};

/**
 * @param {object} rawSchema - Raw JSON from `GET /webform_rest/{id}/elements`
 * @returns {Array<object>} Flat field list sorted by Drupal weight
 */
export const buildFieldList = (rawSchema) => {
  const root = unwrap(rawSchema);
  const collected = collectFields(root);

  const byKey = new Map();
  for (const [key, el, type] of collected) {
    byKey.set(key, { key, el, type });
  }

  const fields = [...byKey.values()].map(({ key, el, type }) => ({
    key,
    type,
    title:        el['#title']          ?? '',
    placeholder:  el['#placeholder']    ?? '',
    required:     Boolean(el['#required']),
    requiredError:el['#required_error'] ?? '',
    description:  el['#description']    ?? '',
    options:      ['select', 'radios', 'checkboxes'].includes(type) ? parseOptions(el) : [],
    defaultValue: el['#default_value'],
    multiple:     Boolean(el['#multiple']),
    fileAccept:   el['#file_extensions']
      ? el['#file_extensions'].split(/[\s,]+/).map((ext) => `.${ext.trim()}`).filter((ext) => ext !== '.').join(',')
      : undefined,
    maxFilesize:  el['#max_filesize'] ? Number(el['#max_filesize']) : undefined, // megabytes
    weight: Number(el['#weight'] ?? 0),
  }));

  fields.sort((a, b) => a.weight - b.weight);
  return fields;
};

/** Convenience lookup: field key → parsed field metadata. */
export const buildFieldMap = (rawSchema) =>
  new Map(buildFieldList(rawSchema).map((field) => [field.key, field]));
