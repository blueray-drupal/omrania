import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    applySitePreferences,
    clampFontScale,
    DEFAULT_PREFERENCES,
    loadSitePreferences,
    resetSitePreferences,
} from '../utils/sitePreferences';

const SitePreferencesContext = createContext(null);

export function SitePreferencesProvider({ children }) {
    const [preferences, setPreferences] = useState(() => loadSitePreferences());

    useEffect(() => {
        applySitePreferences(preferences);
    }, [preferences]);

    const updatePreferences = useCallback((updater) => {
        setPreferences((current) => {
            const next = typeof updater === 'function' ? updater(current) : updater;
            return applySitePreferences(next);
        });
    }, []);

    const setTheme = useCallback((theme) => {
        updatePreferences((current) => ({
            ...current,
            theme: theme === 'dark' ? 'dark' : 'light',
        }));
    }, [updatePreferences]);

    const increaseFontSize = useCallback(() => {
        updatePreferences((current) => ({
            ...current,
            fontScale: clampFontScale(current.fontScale + 1),
        }));
    }, [updatePreferences]);

    const decreaseFontSize = useCallback(() => {
        updatePreferences((current) => ({
            ...current,
            fontScale: clampFontScale(current.fontScale - 1),
        }));
    }, [updatePreferences]);

    const toggleHideImages = useCallback(() => {
        updatePreferences((current) => ({
            ...current,
            hideImages: !current.hideImages,
        }));
    }, [updatePreferences]);

    const resetPreferences = useCallback(() => {
        setPreferences(resetSitePreferences());
    }, []);

    const value = useMemo(
        () => ({
            preferences,
            setTheme,
            increaseFontSize,
            decreaseFontSize,
            toggleHideImages,
            resetPreferences,
        }),
        [
            preferences,
            setTheme,
            increaseFontSize,
            decreaseFontSize,
            toggleHideImages,
            resetPreferences,
        ],
    );

    return (
        <SitePreferencesContext.Provider value={value}>
            {children}
        </SitePreferencesContext.Provider>
    );
}

export function useSitePreferences() {
    const context = useContext(SitePreferencesContext);
    if (!context) {
        throw new Error('useSitePreferences must be used within SitePreferencesProvider');
    }
    return context;
}

export { DEFAULT_PREFERENCES };
