import { parseDrupalMultipleNodes } from '../../utils/drupalParser';

const baseUrl = import.meta.env.VITE_BASE_URL;

export async function fetchMediaCenterNews() {
    const response = await fetch(
        `${baseUrl}/jsonapi/node/media_center?include=field_media_image.field_media_image`
    );

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const allData = parseDrupalMultipleNodes(data, baseUrl);

    return allData.filter(
        (card) => card.field_media_center_classificatio === 'news'
    );
}
