export const STORAGE_KEY = 'jhr-site-preferences';

export const DEFAULT_PREFERENCES = {
    theme: 'light',
    fontScale: 0,
    hideImages: false,
};

export const FONT_SCALE_MIN = -3;
export const FONT_SCALE_MAX = 3;
export const FONT_SCALE_STEP = 0.1;

export function loadSitePreferences() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            const legacyTheme = localStorage.getItem('theme');
            if (legacyTheme === 'dark' || legacyTheme === 'light') {
                return { ...DEFAULT_PREFERENCES, theme: legacyTheme };
            }
            return { ...DEFAULT_PREFERENCES };
        }

        const parsed = JSON.parse(stored);
        return {
            theme: parsed.theme === 'dark' ? 'dark' : 'light',
            fontScale: clampFontScale(Number(parsed.fontScale) || 0),
            hideImages: Boolean(parsed.hideImages),
        };
    } catch {
        return { ...DEFAULT_PREFERENCES };
    }
}

export function saveSitePreferences(preferences) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export function clampFontScale(value) {
    return Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, value));
}

export function getFontScaleFactor(fontScale) {
    return 1 + clampFontScale(fontScale) * FONT_SCALE_STEP;
}

function applyThemeClasses(root, body, theme) {
    const isDark = theme === 'dark';

    root.setAttribute('data-theme', theme);
    root.style.colorScheme = isDark ? 'dark' : 'light';

    body.classList.toggle('site-dark-theme', isDark);
    body.classList.toggle('site-light-theme', !isDark);
}

function applyFontScale(root, fontScale) {
    const factor = getFontScaleFactor(fontScale);

    root.setAttribute('data-font-scale', String(fontScale));
    root.style.setProperty('--font-scale', String(factor));

    if (factor !== 1) {
        root.style.zoom = String(factor);
    } else {
        root.style.removeProperty('zoom');
    }
}

function applyHideImages(root, body, hideImages) {
    if (hideImages) {
        root.setAttribute('data-hide-images', 'true');
    } else {
        root.removeAttribute('data-hide-images');
    }

    body.classList.toggle('site-hide-images', hideImages);
}

/**
 * Applies theme, font scale, and hide-images preferences to the whole site.
 * Call on boot (main.jsx) and whenever preferences change.
 */
export function applySitePreferences(preferences) {
    const root = document.documentElement;
    const body = document.body;

    const normalized = {
        theme: preferences.theme === 'dark' ? 'dark' : 'light',
        fontScale: clampFontScale(preferences.fontScale),
        hideImages: Boolean(preferences.hideImages),
    };

    applyThemeClasses(root, body, normalized.theme);
    applyFontScale(root, normalized.fontScale);
    applyHideImages(root, body, normalized.hideImages);

    saveSitePreferences(normalized);
    return normalized;
}

export function resetSitePreferences() {
    return applySitePreferences({ ...DEFAULT_PREFERENCES });
}
