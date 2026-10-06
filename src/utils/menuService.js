/**
 * جلب قائمة المنيو بناءً على الـ Machine Name الخاص بها من Drupal
 * @param {string} machineName - اسم القائمة (مثل: 'main', 'footer', 'admin')
 * @returns {Promise<Array>} - مصفوفة تحتوي على عناصر المنيو (id, title, link)
 */
export const getMenuByMachineName = async (machineName) => {
    try {
        const baseUrl = "http://backend.sinokrotholding.com.dedi8785.your-server.de";
        const response = await fetch(`${baseUrl}/jsonapi/menu_items/${machineName}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch menu '${machineName}': ${response.statusText}`);
        }

        const json = await response.json();

        // استخراج العناصر وتحويلها لتركيبة مبسطة (JSON Clean Format)
        const formattedMenu = (json.data || []).map((item, index) => ({
            id: item.id || index,
            title: item.attributes.title,
            link: item.attributes.url || "/",
            enabled: item.attributes.enabled,
            weight: item.attributes.weight,
        }));

        return formattedMenu;
    } catch (error) {
        console.error(`Error in getMenuByMachineName(${machineName}):`, error);
        return [];
    }
};