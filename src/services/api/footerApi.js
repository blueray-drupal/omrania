import { parseDrupalMultipleNodes } from '../../utils/drupalParser';

const baseUrl = import.meta.env.VITE_BASE_URL;

const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
};

const PHONE_VALUE_PATTERN = /^[\d\s+\-()]+$/;

export function parseContactLine(text) {
    const colonMatch = text.match(/^([^:]+[:：])\s*(.+)$/);
    if (!colonMatch) {
        return { prefix: text, value: null, isPhone: false };
    }

    const prefix = colonMatch[1];
    const value = colonMatch[2].trim();
    const isPhone = PHONE_VALUE_PATTERN.test(value) || value.startsWith('00962') || value.startsWith('+');

    return { prefix, value, isPhone };
}

const titleFromImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    const filename = imageUrl.split('/').pop() || '';
    const name = filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1);
};

const getLinkUri = (linkField) => {
    if (!linkField) return '';

    if (typeof linkField === 'string') {
        return linkField;
    }

    const uri = linkField.uri || linkField.url || '';
    if (!uri) return '';

    if (uri.startsWith('internal:')) {
        const path = uri.replace('internal:', '');
        return path || '/';
    }

    return uri;
};

const FOOTER_INCLUDE =
    'field_footer_informaion,' +
    'field_partner,field_partner.field_media_image,field_partner.field_media_image.field_media_image,' +
    'field_social_icons,field_social_icons.field_media_image,field_social_icons.field_media_image.field_media_image,' +
    'field_bottom_links';

export async function fetchFooterData() {
    const response = await fetch(`${baseUrl}/jsonapi/node/footer?include=${FOOTER_INCLUDE}`);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const nodes = parseDrupalMultipleNodes(data, baseUrl);
    const footer = nodes[0];

    if (!footer) {
        return null;
    }

    const contactItems = (footer.paragraphs?.field_footer_informaion || []).map((item) => {
        const body = stripHtml(item.body);
        const title = item.title?.trim() || '';
        const text = body || title;

        return {
            id: item.id,
            title,
            body,
            text: title && body && !body.startsWith(title) ? `${title}: ${body}` : text,
        };
    });

    const importantLinks = (footer.field_multiple_body || [])
        .filter(Boolean)
        .map((text, index) => ({
            id: `footer-link-${index}`,
            title: stripHtml(text),
            link: '',
        }));

    const partners = (footer.paragraphs?.field_partner || []).map((item) => ({
        id: item.id,
        image: item.image,
        title: item.title || '',
        link: getLinkUri(item.field_link),
    }));

    const socialIcons = (footer.paragraphs?.field_social_icons || [])
        .map((item) => ({
            id: item.id,
            image: item.image,
            title:
                item.title ||
                stripHtml(item.field_title) ||
                titleFromImageUrl(item.image) ||
                'وسيلة تواصل',
            link: getLinkUri(item.field_link || item.link),
        }))
        .filter((item) => item.image);

    const bottomLinks = (footer.paragraphs?.field_bottom_links || [])
        .map((item) => ({
            id: item.id,
            title: stripHtml(item.field_title) || item.title || '',
            link: getLinkUri(item.field_link || item.link),
        }))
        .filter((item) => item.title);

    return {
        contactItems,
        importantLinks,
        partners,
        socialIcons,
        bottomLinks,
    };
}
