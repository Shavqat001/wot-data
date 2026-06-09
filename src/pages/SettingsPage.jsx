import { useState } from 'react'
import { useSettings } from '../context/SettingsContext.jsx'
import { LANGUAGES } from '../i18n/translations.js'
import './SettingsPage.css'

export default function SettingsPage() {
  const { t, theme, setTheme, language, setLanguage, server, setServer, launcherPath, setLauncherPath, SERVERS } = useSettings()
  const [pathInput, setPathInput] = useState(launcherPath)
  const [saved, setSaved] = useState(false)

  function saveLauncher() {
    setLauncherPath(pathInput)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    if (window.electronAPI) window.electronAPI.setLauncherPath(pathInput)
  }

  async function browseLauncher() {
    if (window.electronAPI?.browseLauncher) {
      const result = await window.electronAPI.browseLauncher()
      if (result) setPathInput(result)
    }
  }

  return (
    <div className="settings-page">
      <h1 className="page-title">{t.settingsTitle}</h1>

      <div className="settings-grid">

        {/* THEME */}
        <div className="settings-card">
          <div className="settings-card-title">{t.theme}</div>
          <div className="theme-btns">
            <button className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>
              🌙 {t.dark}
            </button>
            <button className={`theme-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>
              ☀️ {t.light}
            </button>
          </div>
        </div>

        {/* LANGUAGE */}
        <div className="settings-card">
          <div className="settings-card-title">{t.language}</div>
          <div className="lang-btns">
            {LANGUAGES.map(l => (
              <button key={l.code} className={`lang-btn ${language === l.code ? 'active' : ''}`} onClick={() => setLanguage(l.code)}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* SERVER / PLATFORM */}
        <div className="settings-card">
          <div className="settings-card-title">{t.platform} / {t.server}</div>
          <div className="server-btns">
            {Object.entries(SERVERS).map(([key, s]) => (
              <button key={key} className={`server-btn ${server === key ? 'active' : ''}`} onClick={() => setServer(key)}>
                {s.label}
              </button>
            ))}
          </div>
          <p className="settings-note">{t.serverNote || 'Changing server requires re-login'}</p>
        </div>

        {/* LAUNCHER */}
        <div className="settings-card settings-card-wide">
          <div className="settings-card-title">{t.launcher}</div>
          <div className="launcher-row">
            <input
              className="search-input launcher-input"
              value={pathInput}
              onChange={e => setPathInput(e.target.value)}
              placeholder={t.launcherPath}
            />
            {window.electronAPI && (
              <button className="browse-btn" onClick={browseLauncher}>
                📁 {t.browse}
              </button>
            )}
            <button className="play-btn" onClick={saveLauncher}>
              {saved ? '✓' : t.save}
            </button>
          </div>
          <p className="settings-note launcher-hint">
            {t.launcherHint || 'Select your game launcher (Lesta Game Center, WG Game Center, Steam, etc.)'}
          </p>
        </div>

      </div>
    </div>
  )
}
