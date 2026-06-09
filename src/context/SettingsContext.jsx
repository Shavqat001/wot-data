import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../i18n/translations.js'

const SettingsContext = createContext(null)

export const SERVERS = {
  wg_eu:   { label: 'WG EU',      api: 'https://api.worldoftanks.eu/wot',    auth: 'https://api.worldoftanks.eu/wot/auth/login' },
  wg_na:   { label: 'WG NA',      api: 'https://api.worldoftanks.com/wot',   auth: 'https://api.worldoftanks.com/wot/auth/login' },
  wg_asia: { label: 'WG ASIA',    api: 'https://api.worldoftanks.asia/wot',  auth: 'https://api.worldoftanks.asia/wot/auth/login' },
  lesta:   { label: 'LESTA RU',   api: 'https://api.tanki.su/wot',           auth: 'https://api.tanki.su/wot/auth/login' },
}

const DEFAULTS = {
  theme: 'dark',
  language: 'en',
  server: 'wg_eu',
  launcherPath: 'D:\\programs\\Lesta\\GameCenter\\lgc.exe',
}

function load(key) {
  try { return JSON.parse(localStorage.getItem('wot_' + key)) } catch { return null }
}
function save(key, val) {
  localStorage.setItem('wot_' + key, JSON.stringify(val))
}

export function SettingsProvider({ children }) {
  const [theme, setThemeState] = useState(load('theme') || DEFAULTS.theme)
  const [language, setLanguageState] = useState(load('language') || DEFAULTS.language)
  const [server, setServerState] = useState(load('server') || DEFAULTS.server)
  const [launcherPath, setLauncherPathState] = useState(load('launcherPath') || DEFAULTS.launcherPath)

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme) }, [theme])

  function setTheme(v) { setThemeState(v); save('theme', v) }
  function setLanguage(v) { setLanguageState(v); save('language', v) }
  function setServer(v) { setServerState(v); save('server', v) }
  function setLauncherPath(v) { setLauncherPathState(v); save('launcherPath', v) }

  const t = translations[language] || translations.en
  const apiBase = SERVERS[server]?.api || SERVERS.wg_eu.api
  const authUrl = SERVERS[server]?.auth || SERVERS.wg_eu.auth
  const API_LANG = { en: 'en', ru: 'ru', de: 'de', zh: 'zh-cn' }
  const apiLang = API_LANG[language] || 'en'

  return (
    <SettingsContext.Provider value={{ theme, setTheme, language, setLanguage, server, setServer, launcherPath, setLauncherPath, t, apiBase, authUrl, apiLang, SERVERS }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() { return useContext(SettingsContext) }
