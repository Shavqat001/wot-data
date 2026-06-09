import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext.jsx'
import { useSettings } from '../context/SettingsContext.jsx'
import { getCache, setCache } from '../utils/cache.js'
import TankCard from '../components/TankCard.jsx'
import PersonalTankDetail from './PersonalTankDetail.jsx'
import './MyGarage.css'

const APP_ID = import.meta.env.VITE_WG_APP_ID

export default function MyGarage() {
  const { user, login, logout } = useAuth()
  const { t, apiBase, apiLang, authUrl } = useSettings()
  const [allTanks, setAllTanks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => { if (user) fetchMyTanks() }, [user, apiBase, apiLang])

  async function fetchMyTanks() {
    setLoading(true)
    setError(null)
    try {
      const cacheKey = `mygarage_v2_${user.accountId}_${apiBase}_${apiLang}`
      const cached = getCache(cacheKey)
      if (cached) {
        setAllTanks(cached.all)
        setLoading(false)
        return
      }

      const garageRes = await axios.get(`${apiBase}/account/tanks/`, {
        params: {
          application_id: APP_ID,
          account_id: user.accountId,
          access_token: user.token,
          fields: 'tank_id,statistics'
        }
      })

      if (garageRes.data.status !== 'ok') throw new Error(garageRes.data.error?.message)

      const raw = garageRes.data.data[user.accountId] || []
      if (!raw.length) { setLoading(false); return }

      const tankIds = raw.map(t => t.tank_id).join(',')

      // parallel: encyclopedia info + detailed stats (no tank_id filter — avoids URL length limit)
      const [infoRes, detailRes] = await Promise.all([
        axios.get(`${apiBase}/encyclopedia/vehicles/`, {
          params: { application_id: APP_ID, tank_id: tankIds, language: apiLang,
            fields: 'tank_id,name,nation,type,tier,images' }
        }),
        axios.get(`${apiBase}/tanks/stats/`, {
          params: { application_id: APP_ID, account_id: user.accountId,
            access_token: user.token,
            fields: 'tank_id,all' }
        })
      ])

      // build detailed stats map: tank_id → all stats
      const detailMap = {}
      const detailRaw = detailRes.data?.data?.[user.accountId] || []
      detailRaw.forEach(t => { detailMap[t.tank_id] = t.all })

      const allIds = new Set(raw.map(t => t.tank_id))
      const allList = Object.values(infoRes.data.data)
        .filter(t => t && allIds.has(t.tank_id))
        .map(t => ({ ...t, myStats: detailMap[t.tank_id] || null }))
        .sort((a, b) => b.tier - a.tier)

      setCache(cacheKey, { all: allList })
      setAllTanks(allList)
    } catch (e) {
      setError(e.message || 'Failed to load your garage')
    } finally {
      setLoading(false)
    }
  }

  if (selected) return <PersonalTankDetail tank={selected} onBack={() => setSelected(null)} />
  if (!user) return <LoginScreen onLogin={() => login(authUrl)} t={t} />

  return (
    <div className="mygarage-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t.myGarage}</h1>
          <p className="page-subtitle">{allTanks.length} {t.tanksInGarage}</p>
        </div>
        <div className="user-info">
          <div className="user-avatar">{user.nickname?.[0]?.toUpperCase()}</div>
          <div>
            <div className="user-name">{user.nickname}</div>
            <button className="logout-btn" onClick={logout}>{t.logout}</button>
          </div>
        </div>
      </div>

      {loading && <div className="loading-state"><div className="loader" /><p>{t.loading}</p></div>}
      {error && <div className="error-state">{error}</div>}

      {!loading && !error && (
        <div className="tank-grid">
          {allTanks.map(tank => (
            <TankCard
              key={tank.tank_id}
              tank={tank}
              inGarage={false}
              onClick={() => setSelected(tank)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function LoginScreen({ onLogin, t }) {
  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-icon">🔐</div>
        <h2 className="login-title">{t.loginTitle}</h2>
        <p className="login-desc">{t.loginDesc}</p>
        <button className="login-btn" onClick={onLogin}>
          <span>⚔️</span> {t.loginBtn}
        </button>
        <p className="login-note">{t.loginNote}</p>
      </div>
    </div>
  )
}
