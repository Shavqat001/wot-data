import { useState } from 'react'
import axios from 'axios'
import { useSettings } from '../context/SettingsContext.jsx'
import './Stats.css'

const APP_ID = import.meta.env.VITE_WG_APP_ID

async function fetchPlayer(apiBase, apiLang, nickname) {
  const searchRes = await axios.get(`${apiBase}/account/list/`, {
    params: { application_id: APP_ID, search: nickname.trim(), limit: 1, language: apiLang }
  })
  if (!searchRes.data.data?.length) return null
  const p = searchRes.data.data[0]
  const statsRes = await axios.get(`${apiBase}/account/info/`, {
    params: { application_id: APP_ID, account_id: p.account_id, language: apiLang,
      fields: 'statistics.all,nickname,last_battle_time' }
  })
  const s = statsRes.data.data[p.account_id]
  return { ...s, account_id: p.account_id }
}

const STATS = [
  { key: 'battles',        label: 'BATTLES',    fmt: v => v?.toLocaleString(),                   higher: true  },
  { key: 'winrate',        label: 'WIN RATE',   fmt: v => v != null ? `${v}%` : null,            higher: true  },
  { key: 'avgDamage',      label: 'AVG DAMAGE', fmt: v => v?.toLocaleString(),                   higher: true  },
  { key: 'frags',          label: 'FRAGS',      fmt: v => v?.toLocaleString(),                   higher: true  },
  { key: 'survived',       label: 'SURVIVED',   fmt: v => v != null ? `${v}%` : null,            higher: true  },
  { key: 'avgXP',          label: 'AVG XP',     fmt: v => v?.toLocaleString(),                   higher: true  },
  { key: 'spotted',        label: 'SPOTTED',    fmt: v => v?.toLocaleString(),                   higher: true  },
  { key: 'maxDamage',      label: 'MAX DAMAGE', fmt: v => v?.toLocaleString(),                   higher: true  },
]

function calcStats(s) {
  const all = s?.statistics?.all
  if (!all) return {}
  const b = all.battles || 1
  return {
    battles:   all.battles,
    winrate:   all.battles ? +((all.wins / all.battles) * 100).toFixed(1) : null,
    avgDamage: all.battles ? Math.round(all.damage_dealt / all.battles) : null,
    frags:     all.frags,
    survived:  all.battles ? +((all.survived_battles / all.battles) * 100).toFixed(1) : null,
    avgXP:     all.battles ? Math.round(all.xp / all.battles) : null,
    spotted:   all.spotted,
    maxDamage: all.max_damage,
  }
}

export default function Stats() {
  const { t, apiBase, apiLang } = useSettings()
  const [mode, setMode] = useState('single') // 'single' | 'compare'

  // single
  const [search, setSearch] = useState('')
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // compare
  const [nick1, setNick1] = useState('')
  const [nick2, setNick2] = useState('')
  const [p1, setP1] = useState(null)
  const [p2, setP2] = useState(null)
  const [cmpLoading, setCmpLoading] = useState(false)
  const [cmpError, setCmpError] = useState(null)

  async function handleSearch(e) {
    e.preventDefault()
    if (!search.trim()) return
    setLoading(true); setError(null); setPlayer(null)
    try {
      const data = await fetchPlayer(apiBase, apiLang, search)
      if (!data) { setError(t.playerNotFound); return }
      setPlayer(data)
    } catch { setError('Failed to load player data') }
    finally { setLoading(false) }
  }

  async function handleCompare(e) {
    e.preventDefault()
    if (!nick1.trim() || !nick2.trim()) return
    setCmpLoading(true); setCmpError(null); setP1(null); setP2(null)
    try {
      const [d1, d2] = await Promise.all([
        fetchPlayer(apiBase, apiLang, nick1),
        fetchPlayer(apiBase, apiLang, nick2),
      ])
      if (!d1 || !d2) { setCmpError(t.playerNotFound); return }
      setP1(d1); setP2(d2)
    } catch { setCmpError('Failed to load players') }
    finally { setCmpLoading(false) }
  }

  const s1 = calcStats(p1)
  const s2 = calcStats(p2)

  return (
    <div className="stats-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t.stats}</h1>
          <p className="page-subtitle">{t.searchPlayer}</p>
        </div>
        <div className="mode-tabs">
          <button className={`mode-tab ${mode === 'single' ? 'active' : ''}`} onClick={() => setMode('single')}>
            👤 PLAYER
          </button>
          <button className={`mode-tab ${mode === 'compare' ? 'active' : ''}`} onClick={() => setMode('compare')}>
            ⚔️ COMPARE
          </button>
        </div>
      </div>

      {mode === 'single' && (
        <>
          <form className="stats-search" onSubmit={handleSearch}>
            <input className="search-input" placeholder={t.enterNickname} value={search} onChange={e => setSearch(e.target.value)} />
            <button className="search-btn" type="submit" disabled={loading}>{loading ? '...' : t.search}</button>
          </form>
          {error && <div className="error-state">{error}</div>}
          {player && <PlayerProfile player={player} t={t} />}
        </>
      )}

      {mode === 'compare' && (
        <>
          <form className="compare-form" onSubmit={handleCompare}>
            <input className="search-input" placeholder="Player 1 nickname..." value={nick1} onChange={e => setNick1(e.target.value)} />
            <div className="vs-badge">VS</div>
            <input className="search-input" placeholder="Player 2 nickname..." value={nick2} onChange={e => setNick2(e.target.value)} />
            <button className="search-btn" type="submit" disabled={cmpLoading}>{cmpLoading ? '...' : 'COMPARE'}</button>
          </form>
          {cmpError && <div className="error-state">{cmpError}</div>}
          {p1 && p2 && (
            <div className="compare-grid" style={{ animation: 'fadeIn 0.4s ease' }}>
              {/* Headers */}
              <div className="cmp-player-header">
                <div className="profile-avatar" style={{ width: 40, height: 40, fontSize: 18 }}>{p1.nickname?.[0]?.toUpperCase()}</div>
                <span className="cmp-name">{p1.nickname}</span>
              </div>
              <div className="cmp-stat-col-label" />
              <div className="cmp-player-header cmp-player-header-right">
                <span className="cmp-name">{p2.nickname}</span>
                <div className="profile-avatar" style={{ width: 40, height: 40, fontSize: 18 }}>{p2.nickname?.[0]?.toUpperCase()}</div>
              </div>

              {STATS.map(stat => {
                const v1 = s1[stat.key]
                const v2 = s2[stat.key]
                const p1wins = v1 != null && v2 != null && (stat.higher ? v1 > v2 : v1 < v2)
                const p2wins = v1 != null && v2 != null && (stat.higher ? v2 > v1 : v2 < v1)
                return (
                  <>
                    <div key={stat.key + '_1'} className={`cmp-val cmp-val-left ${p1wins ? 'winner' : p2wins ? 'loser' : ''}`}>
                      {stat.fmt(v1) ?? '—'}
                    </div>
                    <div key={stat.key + '_lbl'} className="cmp-label">{stat.label}</div>
                    <div key={stat.key + '_2'} className={`cmp-val cmp-val-right ${p2wins ? 'winner' : p1wins ? 'loser' : ''}`}>
                      {stat.fmt(v2) ?? '—'}
                    </div>
                  </>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function PlayerProfile({ player, t }) {
  const all = player.statistics?.all
  const winrate = all?.battles ? ((all.wins / all.battles) * 100).toFixed(1) : null
  const avgDmg  = all?.battles ? Math.round(all.damage_dealt / all.battles) : null
  const avgXP   = all?.battles ? Math.round(all.xp / all.battles) : null
  const WR_COLOR = winrate >= 55 ? '#4caf50' : winrate >= 50 ? '#e8a020' : '#e57373'

  return (
    <div className="player-profile">
      <div className="profile-header">
        <div className="profile-avatar">{player.nickname?.[0]?.toUpperCase()}</div>
        <div>
          <div className="profile-name">{player.nickname}</div>
          <div className="profile-meta">
            <span>ID: {player.account_id}</span>
            <span>{player.last_battle_time ? new Date(player.last_battle_time * 1000).toLocaleDateString() : '—'}</span>
          </div>
        </div>
        <div className="winrate-badge" style={{ color: WR_COLOR, borderColor: WR_COLOR }}>
          <div className="wr-num">{winrate}%</div>
          <div className="wr-label">{t.winrate}</div>
        </div>
      </div>
      <div className="player-stats-grid">
        <StatCard label={t.battles}   value={all?.battles?.toLocaleString()}               color="var(--text-primary)" />
        <StatCard label={t.wins}      value={all?.wins?.toLocaleString()}                  color="#4caf50" />
        <StatCard label={t.avgDamage} value={avgDmg?.toLocaleString()}                    color="var(--accent-orange)" />
        <StatCard label={t.avgXP}     value={avgXP?.toLocaleString()}                     color="var(--accent-gold)" />
        <StatCard label={t.frags}     value={all?.frags?.toLocaleString()}                color="#e57373" />
        <StatCard label={t.survived}  value={all?.survived_battles?.toLocaleString()}     color="#4fc3f7" />
        <StatCard label={t.spotted}   value={all?.spotted?.toLocaleString()}              color="#ce93d8" />
        <StatCard label={t.maxDamage} value={all?.max_damage?.toLocaleString()}           color="var(--accent-orange)" />
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="player-stat-card">
      <div className="psc-value" style={{ color }}>{value ?? '—'}</div>
      <div className="psc-label">{label}</div>
    </div>
  )
}
