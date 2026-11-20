// Comfort and privacy preferences, kept in this browser (the server has no
// settings endpoint yet). Reduced motion and text size are applied to the page
// right away; the rest are saved so a server can enforce them later.
const SETTINGS_STORAGE_KEY = 'worqariumSettings'

export const DEFAULT_SETTINGS = {
  reducedMotion: false,
  ambientAudio: false,
  textSize: 'standard', // standard | large | larger
  focusMinutes: 25, // 15 | 25 | 45
  tankVisitors: 'friends', // friends | everyone | nobody
  directMessages: 'friends', // friends | everyone | nobody
  onlineStatus: 'friends', // friends | everyone | nobody
  showFocusStatus: true,
  chatNotifications: 'mentions', // mentions | all | none
}

// saved settings merged over the defaults (so new settings always have a value)
export function loadSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY)) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // storage full or blocked: the settings still apply for this visit
  }
}

// reflect the settings that change how the page looks (see index.css)
export function applySettingsToPage(settings) {
  const root = document.documentElement
  root.dataset.reducedMotion = String(settings.reducedMotion)
  root.dataset.textSize = settings.textSize
}
