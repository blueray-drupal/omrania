import { drupalApi, DRUPAL_BASE_URL } from './axios.config';

// ─── Config ───────────────────────────────────────────────────────────────────

const NODE_INCLUDES = [
    'field_data_axes_chart',
    'field_data_axes_chart.field_media_file',
    'field_data_axes_chart.field_media_file.field_media_document',
    'field_data_axes_chart.field_data_axses_file_data',
    'field_data_axes_chart.field_data_axses_file_data.field_comparison',
    'field_data_axses_type',
    'field_icon',
    'field_icon.field_media_image',
].join(',');

// Palette reused across chart series / slices
const PALETTE = [
    '#8951A0',
    '#2A5C8A',
    '#69C9D0',
    '#D4AF37',
    '#8B5AA8',
    '#2F5F8F',
    '#E07A5F',
    '#3D9970',
    '#C0392B',
    '#16A085',
];

// Backend chart-type slug → internal renderer type
const CHART_TYPE_MAP = {
    simple_bar: 'bar',
    bar: 'bar',
    cluster_bar: 'groupedBar',
    line: 'line',
    grouped_bar: 'groupedBar',
    pie: 'pie',
    pi: 'pie',
};

// Sidebar icon (lucide name) per renderer type
const ICON_BY_TYPE = {
    bar: 'BarChart3',
    groupedBar: 'BarChart3',
    line: 'LineChart',
    pie: 'PieChart',
    embed: 'Globe',
};

/**
 * Hosts allowed inside an <iframe>.
 *
 * Keep in sync with the CSP `frame-src` directive on the frontend host — a URL
 * permitted here but missing from CSP renders as a blank box with no JS error.
 */
const ALLOWED_IFRAME_HOSTS = new Set([
    'pubsuperset.data.jo',
    'www.google.com',
]);

const color = (index) => PALETTE[index % PALETTE.length];

// ─── Low-level helpers ─────────────────────────────────────────────────────────

const indexIncluded = (included = []) => {
    const byId = {};
    included.forEach((item) => {
        byId[item.id] = item;
    });
    return byId;
};

const toNumber = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const n = Number.parseFloat(String(value).replace(',', '.'));
    return Number.isNaN(n) ? null : n;
};

const extractHtml = (body) => {
    if (!body) return '';
    if (typeof body === 'string') return body;
    return body.processed || body.value || '';
};

const absoluteUrl = (url) => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    return `${DRUPAL_BASE_URL.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
};

/**
 * Normalize a Drupal link-field value (`field_iframe`) into a safe absolute URL.
 *
 * Returns null — never a partial or unvalidated string — when the value is
 * empty, unparseable, not http(s), or points at a host outside the allow-list.
 *
 * @param {{uri?: string}|string|null} linkField
 * @returns {string|null}
 */
const extractIframeUrl = (linkField) => {
    const raw = typeof linkField === 'string' ? linkField : linkField?.uri;
    if (!raw || typeof raw !== 'string') return null;

    let candidate = raw.trim();
    if (!candidate) return null;

    if (candidate.startsWith('internal:')) {
        candidate = candidate.slice('internal:'.length);
    }
    if (candidate.startsWith('entity:')) return null;

    let url;
    try {
        url = new URL(candidate, DRUPAL_BASE_URL);
    } catch {
        console.warn('dataAxesApi: unparseable field_iframe value →', raw);
        return null;
    }

    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

    if (!ALLOWED_IFRAME_HOSTS.has(url.hostname)) {
        console.warn(`dataAxesApi: iframe host not allow-listed → ${url.hostname}`);
        return null;
    }

    // Superset only renders chrome-less in standalone mode; editors routinely
    // paste the plain dashboard URL, so force the flag rather than relying on it.
    if (url.hostname === 'pubsuperset.data.jo') {
        url.searchParams.set('standalone', '1');
    }

    return url.toString();
};

// ─── Entity transforms ─────────────────────────────────────────────────────────

const transformComparison = (comparison) => ({
    label: comparison?.attributes?.field_title ?? '',
    value: toNumber(comparison?.attributes?.field_number),
});

const transformFile = (file, byId) => {
    const attrs = file?.attributes ?? {};
    const compRefs = file?.relationships?.field_comparison?.data ?? [];
    const items = compRefs
        .map((ref) => byId[ref.id])
        .filter(Boolean)
        .map(transformComparison);

    return {
        // group / x-axis category label (year first, fallback to title)
        label: attrs.field_year || attrs.field_title || '',
        title: attrs.field_title || '',
        year: attrs.field_year || '',
        items,
    };
};

// Collect the ordered union of series labels across all files
const collectSeries = (files) => {
    const labels = [];
    files.forEach((file) => {
        file.items.forEach((item) => {
            if (item.label && !labels.includes(item.label)) labels.push(item.label);
        });
    });
    return labels;
};

// Build grouped rows: one row per file, keyed by series label
const buildGroupedRows = (files) =>
    files.map((file) => {
        const row = { name: file.label };
        file.items.forEach((item) => {
            row[item.label] = item.value;
        });
        return row;
    });

/**
 * Normalize the paragraph data into props consumed by the chart renderer.
 * - Multiple files  → grouped over file labels, one series per comparison label.
 * - Single file     → each comparison is a category (bar/line) or slice (pie).
 */
const buildChartData = (type, files, seriesTitle) => {
    if (!files.length) {
        return { data: [] };
    }

    const multi = files.length > 1;

    if (type === 'pie') {
        const items = files[0].items;
        return {
            data: items.map((item, i) => ({
                name: item.label,
                value: item.value,
                color: color(i),
            })),
        };
    }

    if (type === 'groupedBar') {
        const series = collectSeries(files);
        return {
            xKey: 'name',
            bars: series.map((label, i) => ({ key: label, label, color: color(i) })),
            data: buildGroupedRows(files),
        };
    }

    if (type === 'line') {
        if (multi) {
            const series = collectSeries(files);
            return {
                xKey: 'name',
                lines: series.map((label, i) => ({ key: label, label, color: color(i) })),
                data: buildGroupedRows(files),
            };
        }
        const items = files[0].items;
        return {
            xKey: 'name',
            lines: [{ key: 'value', label: seriesTitle || 'القيمة', color: color(0) }],
            data: items.map((item) => ({ name: item.label, value: item.value })),
        };
    }

    // default: simple bar
    if (multi) {
        const series = collectSeries(files);
        return {
            xKey: 'name',
            type: 'groupedBar',
            bars: series.map((label, i) => ({ key: label, label, color: color(i) })),
            data: buildGroupedRows(files),
        };
    }
    const items = files[0].items;
    return {
        layout: 'horizontal',
        color: color(0),
        data: items.map((item) => ({ name: item.label, value: item.value })),
    };
};

const transformChart = (chart, byId) => {
    const attrs = chart?.attributes ?? {};
    const title = attrs.field_title || '';

    // `field_iframe` is now the single source of truth for embeds. field_body is
    // no longer scanned for <iframe> markup — editors use the link field instead.
    const iframeUrl = extractIframeUrl(attrs.field_iframe);
    const isEmbed = Boolean(iframeUrl);

    if (isEmbed) {
        return {
            id: chart.id,
            type: 'embed',
            rawType: attrs.field_chart_type ?? null,
            title,
            isEmbed: true,
            iframeUrl,
            // Free-text body still renders as a caption above the frame if present.
            description: extractHtml(attrs.field_body),
            fileName: null,
        };
    }

    const type = CHART_TYPE_MAP[attrs.field_chart_type] || 'bar';

    const mediaRef = chart?.relationships?.field_media_file?.data;
    const media = mediaRef ? byId[mediaRef.id] : null;

    const fileRefs = chart?.relationships?.field_data_axses_file_data?.data ?? [];
    const files = fileRefs
        .map((ref) => byId[ref.id])
        .filter(Boolean)
        .map((file) => transformFile(file, byId));

    const base = {
        id: chart.id,
        type,
        rawType: attrs.field_chart_type,
        title,
        isEmbed: false,
        iframeUrl: null,
        description: '',
        fileName: media?.attributes?.name ?? null,
    };

    return { ...base, ...buildChartData(type, files, title) };
};

const transformNode = (node, byId) => {
    const attrs = node?.attributes ?? {};

    const typeRef = node?.relationships?.field_data_axses_type?.data;
    const term = typeRef ? byId[typeRef.id] : null;

    const chartRefs = node?.relationships?.field_data_axes_chart?.data ?? [];
    const charts = chartRefs
        .map((ref) => byId[ref.id])
        .filter(Boolean)
        .map((chart) => transformChart(chart, byId));

    // Prefer a real chart for the sidebar icon; fall back to the first entry.
    const primaryType = (charts.find((chart) => !chart.isEmbed) || charts[0])?.type;

    return {
        id: node.id,
        nid: attrs.drupal_internal__nid,
        label: attrs.title,
        title: attrs.title,
        icon: ICON_BY_TYPE[primaryType] || 'Layers',
        termId: term?.id ?? null,
        termTid: term?.attributes?.drupal_internal__tid ?? null,
        termName: term?.attributes?.name ?? null,
        charts,
    };
};

// ─── Public API ────────────────────────────────────────────────────────────────

/** Fetch every data_axses node with its charts fully resolved. */
export const fetchDataAxesNodes = async () => {
    const { data } = await drupalApi.get('/jsonapi/node/data_axses', {
        params: {
            include: NODE_INCLUDES,
            'filter[status]': 1,
        },
    });

    const byId = indexIncluded(data.included);
    return (data.data ?? []).map((node) => transformNode(node, byId));
};

/** Fetch the data_axses taxonomy terms as a flat list with parent references. */
export const fetchDataAxesTerms = async () => {
    const { data } = await drupalApi.get('/jsonapi/taxonomy_term/data_axses', {
        params: { 'filter[status]': 1 },
    });

    return (data.data ?? []).map((term) => {
        const parentRef = term.relationships?.parent?.data?.[0];
        const parentId = parentRef && parentRef.id !== 'virtual' ? parentRef.id : null;
        return {
            id: term.id,
            tid: term.attributes.drupal_internal__tid,
            name: term.attributes.name,
            weight: term.attributes.weight ?? 0,
            parentId,
        };
    });
};

/** Return the set of tids for a root term and all of its descendants. */
export const collectDescendantTids = (terms, rootTid) => {
    const tidById = {};
    terms.forEach((term) => {
        tidById[term.id] = term.tid;
    });

    const childrenByTid = {};
    terms.forEach((term) => {
        const parentTid = term.parentId ? tidById[term.parentId] : null;
        if (parentTid == null) return;
        (childrenByTid[parentTid] ||= []).push(term.tid);
    });

    const result = new Set([rootTid]);
    const stack = [rootTid];
    while (stack.length) {
        const current = stack.pop();
        (childrenByTid[current] || []).forEach((childTid) => {
            if (!result.has(childTid)) {
                result.add(childTid);
                stack.push(childTid);
            }
        });
    }
    return result;
};

export { absoluteUrl, extractIframeUrl, ALLOWED_IFRAME_HOSTS };