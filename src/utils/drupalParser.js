/**
 * Helper لفك واستخراج النصوص والـ Rich Text Formatted Fields
 * سواء كانت Object { processed, value } أو String مباشرة
 */
const extractFormattedText = (field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object') {
        return field.processed || field.value || '';
    }
    return '';
};

/**
 * 1. Helper استخراج رابط ومعلومات ملف مباشر (file--file) أو ميديا (media--*)
 */
const getFileOrMediaDetails = (entityId, included = [], domainUrl = '') => {
    if (!entityId || !included.length) return null;

    // البحث أولاً إن كان Entity عبارة عن Media
    const mediaEntity = included.find(
        (inc) => inc.id === entityId && inc.type.startsWith('media--')
    );

    let fileId = entityId;

    if (mediaEntity) {
        fileId =
            mediaEntity?.relationships?.field_media_image?.data?.id ||
            mediaEntity?.relationships?.field_media_file?.data?.id ||
            mediaEntity?.relationships?.thumbnail?.data?.id;
    }

    if (!fileId) return null;

    // البحث عن الـ File Entity الأصلي
    const fileEntity = included.find(
        (inc) => inc.type === 'file--file' && inc.id === fileId
    );

    if (fileEntity?.attributes?.uri?.url) {
        const rawUrl = fileEntity.attributes.uri.url;
        const fullUrl = rawUrl.startsWith('http') ? rawUrl : `${domainUrl}${rawUrl}`;

        return {
            url: fullUrl,
            filename: fileEntity.attributes.filename || '',
            filesize: fileEntity.attributes.filesize || 0,
            filemime: fileEntity.attributes.filemime || '',
        };
    }

    return null;
};

/**
 * 2. Helper استخراج حقول الصور والوسائط (Single & Multiple Media)
 */
const extractMediaFields = (relationships = {}, included = [], domainUrl = '') => {
    const mediaResults = {};

    Object.keys(relationships).forEach((relKey) => {
        const relData = relationships[relKey]?.data;
        if (!relData) return;

        const dataArray = Array.isArray(relData) ? relData : [relData];
        const isMediaField = dataArray.some((d) => d.type && d.type.startsWith('media--'));

        if (isMediaField) {
            const mediaItems = dataArray
                .map((item) => getFileOrMediaDetails(item.id, included, domainUrl))
                .filter(Boolean);

            if (mediaItems.length > 0) {
                const urls = mediaItems.map((m) => m.url);
                mediaResults[relKey] = Array.isArray(relData) ? urls : urls[0];
            }
        }
    });

    return mediaResults;
};

/**
 * 3. Helper استخراج فقرات الـ Paragraphs وما بداخلها من نصوص وملفات وصور
 */
const extractParagraphs = (relationships = {}, included = [], domainUrl = '') => {
    const paragraphResults = {};

    Object.keys(relationships).forEach((relKey) => {
        const relData = relationships[relKey]?.data;
        if (!relData) return;

        const dataArray = Array.isArray(relData) ? relData : [relData];
        const isParagraphField = dataArray.some((d) => d.type && d.type.startsWith('paragraph--'));

        if (isParagraphField) {
            const parsedParagraphs = dataArray
                .map((pRef) => {
                    const pEntity = included.find(
                        (inc) => inc.type === pRef.type && inc.id === pRef.id
                    );

                    if (!pEntity) return null;

                    const pAttr = pEntity.attributes || {};
                    const pRel = pEntity.relationships || {};

                    // استخراج الملف/الصورة المربوط داخل الـ Paragraph (الملف المباشر)
                    let attachedFile = null;
                    if (pRel.field_file?.data?.id) {
                        attachedFile = getFileOrMediaDetails(pRel.field_file.data.id, included, domainUrl);
                    } else if (pRel.field_media_image?.data?.id) {
                        attachedFile = getFileOrMediaDetails(pRel.field_media_image.data.id, included, domainUrl);
                    }

                    // استخراج جميع صور وميديا الـ Paragraph
                    const paragraphMedia = extractMediaFields(pRel, included, domainUrl);
                    const mainParagraphImage =
                        paragraphMedia.field_media_image ||
                        paragraphMedia.field_flag ||
                        paragraphMedia.field_image ||
                        Object.values(paragraphMedia)[0] ||
                        null;

                    const parsedImage = Array.isArray(mainParagraphImage)
                        ? mainParagraphImage[0]
                        : mainParagraphImage;

                    // استخراج العنوان واستخراج النص/البودي المرن بجميع المسميات المحتملة في Drupal
                    const parsedTitle = extractFormattedText(pAttr.field_title) || extractFormattedText(pAttr.title);
                    const parsedBody =
                        extractFormattedText(pAttr.field_body) ||
                        extractFormattedText(pAttr.body) ||
                        extractFormattedText(pAttr.field_text) ||
                        extractFormattedText(pAttr.field_description) ||
                        '';

                    return {
                        id: pEntity.id,
                        type: pEntity.type,
                        ...extractCustomFields(pAttr),
                        title: parsedTitle,
                        date: pAttr.field_date || '',
                        body: parsedBody,
                        link: pAttr.field_link || '',
                        file: attachedFile,
                        image: parsedImage,
                        ...paragraphMedia,
                    };
                })
                .filter(Boolean);

            paragraphResults[relKey] = parsedParagraphs;
        }
    });

    return paragraphResults;
};

/**
 * 4. Helper استخراج باقي الحقول النصية العادية (field_*)
 */
const extractCustomFields = (attr = {}) => {
    const customFields = {};
    Object.keys(attr).forEach((key) => {
        if (key.startsWith('field_')) {
            customFields[key] = attr[key];
        }
    });
    return customFields;
};

/**
 * 5. Helper استخراج حقول التصنيفات (Taxonomy Terms) مع الاسم والترتيب
 */
const extractTaxonomyFields = (relationships = {}, included = []) => {
    const taxonomyResults = {};

    Object.keys(relationships).forEach((relKey) => {
        const relData = relationships[relKey]?.data;
        if (!relData) return;

        const dataArray = Array.isArray(relData) ? relData : [relData];
        const isTaxonomyField = dataArray.some((d) => d.type && d.type.startsWith('taxonomy_term--'));

        if (isTaxonomyField) {
            const terms = dataArray
                .filter((ref) => ref.id && ref.id !== 'virtual')
                .map((ref) => {
                    const termEntity = included.find(
                        (inc) => inc.type === ref.type && inc.id === ref.id
                    );

                    return {
                        id: ref.id,
                        name: termEntity?.attributes?.name || '',
                        weight: termEntity?.attributes?.weight ?? 0,
                    };
                });

            if (terms.length > 0) {
                taxonomyResults[relKey] = Array.isArray(relData) ? terms : terms[0];
            }
        }
    });

    return taxonomyResults;
};

/**
 * Main Parser: Multiple Nodes
 */
export const parseDrupalMultipleNodes = (jsonResponse, domainUrl = '') => {
    if (!jsonResponse || !jsonResponse.data || !Array.isArray(jsonResponse.data)) {
        return [];
    }

    const included = jsonResponse.included || [];

    return jsonResponse.data.map((item) => {
        const attr = item.attributes || {};
        const rel = item.relationships || {};

        const mediaFields = extractMediaFields(rel, included, domainUrl);
        const paragraphFields = extractParagraphs(rel, included, domainUrl);

        const rawSummary = extractFormattedText(attr.body?.summary) || extractFormattedText(attr.body);
        const cleanSummary = rawSummary.replace(/<[^>]*>?/gm, '').trim();

        const mainImage =
            mediaFields.field_media_image ||
            Object.values(mediaFields)[0] ||
            null;

        return {
            id: item.id,
            title: attr.title || '',
            created: attr.created ? attr.created.split('T')[0] : '',
            changed: attr.changed ? attr.changed.split('T')[0] : '',
            summary: cleanSummary.length > 150 ? cleanSummary.slice(0, 150) + '...' : cleanSummary,
            body: extractFormattedText(attr.body),

            image: Array.isArray(mainImage) ? mainImage[0] : mainImage,

            agreements: paragraphFields.field_agreements || [],
            files: paragraphFields.field_files || Object.values(paragraphFields)[0] || [],
            paragraphs: paragraphFields,

            ...mediaFields,
            ...extractCustomFields(attr),
            ...extractTaxonomyFields(rel, included),

            rawAttributes: attr,
        };
    });
};

/**
 * Main Parser: Single Node
 */
export const parseDrupalSingleNode = (jsonResponse, domainUrl = '') => {
    if (!jsonResponse || !jsonResponse.data) return null;

    const item = Array.isArray(jsonResponse.data) ? jsonResponse.data[0] : jsonResponse.data;
    if (!item) return null;

    const attr = item.attributes || {};
    const rel = item.relationships || {};
    const included = jsonResponse.included || [];

    const mediaFields = extractMediaFields(rel, included, domainUrl);
    const paragraphFields = extractParagraphs(rel, included, domainUrl);

    const mainImage =
        mediaFields.field_media_image ||
        Object.values(mediaFields)[0] ||
        null;

    return {
        id: item.id,
        title: attr.title || '',
        created: attr.created ? attr.created.split('T')[0] : '',
        changed: attr.changed ? attr.changed.split('T')[0] : '',
        body: extractFormattedText(attr.body),
        summary: attr.body?.summary || '',

        image: Array.isArray(mainImage) ? mainImage[0] : mainImage,
        agreements: paragraphFields.field_agreements || [],
        files: paragraphFields.field_files || Object.values(paragraphFields)[0] || [],
        paragraphs: paragraphFields,

        ...mediaFields,
        ...extractCustomFields(attr),
        ...extractTaxonomyFields(rel, included),

        rawAttributes: attr,
    };
};