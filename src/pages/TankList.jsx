import { useState, useEffect } from 'react'
import axios from 'axios'
import TankCard from '../components/TankCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useSettings } from '../context/SettingsContext.jsx'
import { getCache, setCache } from '../utils/cache.js'
import './TankList.css'

const APP_ID = import.meta.env.VITE_WG_APP_ID

const NATIONS = ['All', 'ussr', 'germany', 'usa', 'france', 'uk', 'china', 'japan', 'czech', 'sweden', 'poland', 'italy']
const TYPES = ['All', 'lightTank', 'mediumTank', 'heavyTank', 'AT-SPG', 'SPG']

function loadFilter(key, def) {
  try { return localStorage.getItem('filter_' + key) || def } catch { return def }
}
function saveFilter(key, val) {
  try { localStorage.setItem('filter_' + key, val) } catch {}
}

export default function TankList({ onSelectTank }) {
  const { user } = useAuth()
  const { t, apiBase, apiLang, launcherPath } = useSettings()
  const [tanks, setTanks] = useState([])
  const [filtered, setFiltered] = useState([])
  const [garageTankIds, setGarageTankIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState(loadFilter('search', ''))
  const [nation, setNation] = useState(loadFilter('nation', 'All'))
  const [type, setType] = useState(loadFilter('type', 'All'))
  const [inGarageOnly, setInGarageOnly] = useState(false)
  const [page, setPage] = useState(1)
  const PER_PAGE = 24

  useEffect(() => { fetchTanks() }, [apiBase, apiLang])
  useEffect(() => { if (user) fetchGarageTanks(); else setGarageTankIds(new Set()) }, [user, apiBase])

  useEffect(() => {
    let result = tanks
    if (search) result = result.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    if (nation !== 'All') result = result.filter(t => t.nation === nation)
    if (type !== 'All') result = result.filter(t => t.type === type)
    if (inGarageOnly) result = result.filter(t => garageTankIds.has(t.tank_id))
    setFiltered(result)
    setPage(1)
  }, [search, nation, type, inGarageOnly, tanks, garageTankIds])

  function setSearchPersist(v) { setSearch(v); saveFilter('search', v) }
  function setNationPersist(v) { setNation(v); saveFilter('nation', v) }
  function setTypePersist(v) { setType(v); saveFilter('type', v) }

  async function fetchTanks() {
    try {
      setLoading(true)
      const cacheKey = `alltanks_${apiBase}_${apiLang}`
      const cached = getCache(cacheKey)
      if (cached) { setTanks(cached); setFiltered(cached); setLoading(false); return }

      const res = await axios.get(`${apiBase}/encyclopedia/vehicles/`, {
        params: { application_id: APP_ID, fields: 'tank_id,name,nation,type,tier,images', language: apiLang, limit: 100 }
      })
      if (res.data.status === 'ok') {
        const list = Object.values(res.data.data).sort((a, b) => b.tier - a.tier)
        setCache(cacheKey, list)
        setTanks(list)
        setFiltered(list)
      } else {
        setError('API error: ' + res.data.error?.message)
      }
    } catch (e) {
      setError('Failed to fetch tanks. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchGarageTanks() {
    try {
      const cacheKey = `garage_ids_${user.accountId}_${apiBase}`
      const cached = getCache(cacheKey)
      if (cached) { setGarageTankIds(cached); return }

      const res = await axios.get(`${apiBase}/account/tanks/`, {
        params: { application_id: APP_ID, account_id: user.accountId, access_token: user.token, fields: 'tank_id,in_garage' }
      })
      if (res.data.status === 'ok') {
        const ids = new Set(
          (res.data.data[user.accountId] || [])
            .filter(t => t.in_garage === true || t.in_garage === 1)
            .map(t => t.tank_id)
        )
        setCache(cacheKey, ids)
        setGarageTankIds(ids)
      }
    } catch (e) { console.error(e) }
  }

  function handleLaunch() {
    if (window.electronAPI) window.electronAPI.launchWOT(launcherPath)
    else window.open('wotgame://', '_blank')
  }

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  return (
    <div className="tank-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t.allTanks}</h1>
          <p className="page-subtitle">{filtered.length} {t.vehiclesFound}</p>
        </div>
        <button className="play-btn" onClick={handleLaunch}>▶ {t.launchGame}</button>
      </div>

      <div className="filters">
        <input className="search-input" placeholder={t.search} value={search} onChange={e => setSearchPersist(e.target.value)} />
        <select className="filter-select" value={nation} onChange={e => setNationPersist(e.target.value)}>
          {NATIONS.map(n => <option key={n} value={n}>{n === 'All' ? t.allNations : n.toUpperCase()}</option>)}
        </select>
        <select className="filter-select" value={type} onChange={e => setTypePersist(e.target.value)}>
          {TYPES.map(tp => <option key={tp} value={tp}>{tp === 'All' ? t.allTypes : tp}</option>)}
        </select>
      </div>

      {loading && <div className="loading-state"><div className="loader" /><p>{t.loading}</p></div>}
      {error && <div className="error-state">{error}</div>}

      {!loading && !error && (
        <>
          <div className="tank-grid">
            {paginated.map(tank => (
              <TankCard key={tank.tank_id} tank={tank} inGarage={garageTankIds.has(tank.tank_id)} onClick={() => onSelectTank(tank)} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>{t.prev}</button>
              <span>{page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>{t.next}</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
