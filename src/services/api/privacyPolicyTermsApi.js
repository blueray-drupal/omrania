import { getNodesFull } from '@/services/api/drupalApi.js';

const CONTENT_TYPE = 'privacy_policy_terms_of_use';
const PARAGRAPH_FIELD = 'field_privacy_and_terms_card';
const PARAGRAPH_TYPE = 'paragraph--privacy_policy_terms_of_use';

/**
 * @param {'privacy_policy' | 'terms_of_use'} classification
 */
export async function fetchPrivacyPolicyTermsPage(classification) {
  const nodes = await getNodesFull(CONTENT_TYPE, {
    paragraphField: PARAGRAPH_FIELD,
    paragraphFields: {
      [PARAGRAPH_TYPE]: {},
    },
    filters: {
      status: 1,
      'field_classification_page': classification,
    },
  });

  const node = nodes.find(
    (item) => item.attributes?.field_classification_page === classification,
  ) ?? nodes[0];

  if (!node) return null;

  const cards = (node[`${PARAGRAPH_FIELD}_resolved`] ?? []).map((paragraph) => {
    const title = paragraph.attributes?.field_title?.trim() || '';
    const bodyHtml =
      paragraph.attributes?.field_body?.processed?.trim() ||
      paragraph.attributes?.field_body?.value?.trim() ||
      '';

    return {
      id: paragraph.id,
      title,
      bodyHtml,
    };
  });

  return {
    topNote: node.attributes?.field_top_note?.trim() || '',
    classification: node.attributes?.field_classification_page || classification,
    cards,
  };
}
