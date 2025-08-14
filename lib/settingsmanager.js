const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, '../settings.json');
let settingsCache = {}; // Cache to hold settings in memory

// Default settings structure
const DEFAULT_SETTINGS = {
    ANTICALL: true
};

// Initialize settings from file or create if not exists
const loadSettings = () => {
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            const fileContent = fs.readFileSync(SETTINGS_FILE, 'utf8');
            settingsCache = JSON.parse(fileContent);
            console.log("[SETTINGS] Settings loaded from file.");
            
            // Ensure all default settings exist
            let needsUpdate = false;
            for (const key in DEFAULT_SETTINGS) {
                if (typeof settingsCache[key] === 'undefined') {
                    settingsCache[key] = DEFAULT_SETTINGS[key];
                    needsUpdate = true;
                }
            }
            
            if (needsUpdate) {
                saveSettings();
            }
        } else {
            settingsCache = {...DEFAULT_SETTINGS};
            saveSettings();
            console.log("[SETTINGS] settings.json not found, created with default values.");
        }
    } catch (e) {
        console.error("[SETTINGS ERROR] Failed to load settings, resetting to defaults.", e);
        settingsCache = {...DEFAULT_SETTINGS};
        saveSettings();
    }
};

const saveSettings = () => {
    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settingsCache, null, 2), 'utf8');
        console.log("[SETTINGS] Settings saved to file.");
    } catch (e) {
        console.error("[SETTINGS ERROR] Failed to save settings.json", e);
        // Consider throwing the error if you want calling code to handle it
    }
};

const getSetting = (key) => {
    return settingsCache[key];
};

const setSetting = (key, value) => {
    if (settingsCache[key] !== value) {
        settingsCache[key] = value;
        saveSettings(); // Save immediately after setting
    }
};

// Load settings when the module is required
loadSettings();

module.exports = {
    getSetting,
    setSetting,
    loadSettings // Export for potential manual refresh if needed
};
