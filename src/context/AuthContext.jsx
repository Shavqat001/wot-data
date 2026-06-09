import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const APP_ID = import.meta.env.VITE_WG_APP_ID
const REDIRECT_URI = 'http://localhost:5173'

export function AuthProvider({ children, authUrl }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get('status')
    const token = params.get('access_token')
    const accountId = params.get('account_id')
    const nickname = params.get('nickname')
    const expiresAt = params.get('expires_at')

    if (status === 'ok' && token) {
      const userData = { token, accountId, nickname, expiresAt }
      localStorage.setItem('wg_user', JSON.stringify(userData))
      setUser(userData)
      window.history.replaceState({}, '', '/')
    } else {
      const saved = localStorage.getItem('wg_user')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.expiresAt && Date.now() / 1000 < parsed.expiresAt) {
          setUser(parsed)
        } else {
          localStorage.removeItem('wg_user')
        }
      }
    }
  }, [])

  function login(url) {
    const loginUrl = `${url || authUrl}/?application_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
    window.open(loginUrl, '_blank', 'width=800,height=600')

    const interval = setInterval(() => {
      const saved = localStorage.getItem('wg_user')
      if (saved) { setUser(JSON.parse(saved)); clearInterval(interval) }
    }, 500)
    setTimeout(() => clearInterval(interval), 120000)
  }

  function logout() {
    localStorage.removeItem('wg_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
