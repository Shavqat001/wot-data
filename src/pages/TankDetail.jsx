import { useState, useEffect } from 'react'
import axios from 'axios'
import { useSettings } from '../context/SettingsContext.jsx'
import { getCache, setCache } from '../utils/cache.js'
import './TankDetail.css'

const APP_ID = import.meta.env.VITE_WG_APP_ID
const TIER_ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

export default function TankDetail({ tank, onBack }) {
  const { t, apiBase, apiLang } = useSettings()
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDetails() }, [tank.tank_id, apiLang])

  async function fetchDetails() {
    try {
      setLoading(true)
      const cacheKey = `tankdetail_${tank.tank_id}_${apiBase}_${apiLang}`
      const cached = getCache(cacheKey)
      if (cached) { setDetails(cached); setLoading(false); return }

      const res = await axios.get(`${apiBase}/encyclopedia/vehicles/`, {
        params: {
          application_id: APP_ID,
          tank_id: tank.tank_id,
          fields: 'tank_id,name,nation,type,tier,images,description,default_profile',
          language: apiLang
        }
      })
      if (res.data.status === 'ok') {
        const data = res.data.data[tank.tank_id]
        setCache(cacheKey, data)
        setDetails(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const d = details || tank
  const profile = d.default_profile

  return (
    <div className="tank-detail">
      <button className="back-btn" onClick={onBack}>{t.backToTanks}</button>

      <div className="detail-hero">
        <div className="detail-hero-img">
          {d.images?.big_icon && <img src={d.images.big_icon} alt={d.name} />}
        </div>
        <div className="detail-hero-info">
          <div className="detail-tier">TIER {TIER_ROMAN[d.tier]}</div>
          <h1 className="detail-name">{d.name}</h1>
          <div className="detail-tags">
            <span className="tag">{d.nation?.toUpperCase()}</span>
            <span className="tag">{d.type}</span>
          </div>
          {d.description && <p className="detail-desc">{d.description}</p>}
        </div>
      </div>

      {loading && <div className="detail-loading">Loading specs...</div>}

      {!loading && profile && (() => {
        const gun = profile.gun
        const isAutoloader = gun?.reload_time > 12
        return (
          <div className="stats-grid">
            <StatBlock title={t.firepower}>
              <Stat label="Damage"       value={profile.ammo?.[0]?.damage?.[1] ?? '—'} />
              <Stat label="Penetration"  value={profile.ammo?.[0]?.penetration?.[1] != null ? `${profile.ammo[0].penetration[1]} mm` : '—'} />
              {isAutoloader
                ? <>
                    <Stat label="Mag. Reload" value={gun.reload_time ? `${gun.reload_time}s` : '—'} highlight />
                    <Stat label="Fire Rate"   value={gun.fire_rate   ? `${gun.fire_rate}/min` : '—'} />
                  </>
                : <Stat label="Reload"     value={gun?.reload_time ? `${gun.reload_time}s` : '—'} />
              }
              <Stat label="Aim Time"     value={gun?.aim_time    ? `${gun.aim_time}s`    : '—'} />
              <Stat label="Dispersion"   value={gun?.dispersion  ? `${gun.dispersion} m` : '—'} />
            </StatBlock>

            <StatBlock title={t.survivability}>
              <Stat label="HP"           value={profile.hp ?? '—'} highlight />
              <Stat label="Hull Armor"   value={profile.armor?.hull   ? `${profile.armor.hull.front} / ${profile.armor.hull.sides} / ${profile.armor.hull.rear}` : '—'} />
              <Stat label="Turret Armor" value={profile.armor?.turret ? `${profile.armor.turret.front} / ${profile.armor.turret.sides} / ${profile.armor.turret.rear}` : '—'} />
            </StatBlock>

            <StatBlock title={t.mobility}>
              <Stat label="Speed"         value={profile.speed_forward  ? `${profile.speed_forward} km/h`  : '—'} />
              <Stat label="Reverse"       value={profile.speed_backward ? `${profile.speed_backward} km/h` : '—'} />
              <Stat label="Hull Traverse" value={profile.suspension?.traverse_speed ? `${profile.suspension.traverse_speed}°/s` : '—'} />
              <Stat label="Turr. Traverse" value={profile.turret?.traverse_speed    ? `${profile.turret.traverse_speed}°/s`    : '—'} />
              <Stat label="Engine"        value={profile.engine?.power ? `${profile.engine.power} hp` : '—'} />
              <Stat label="Weight"        value={profile.weight ? `${(profile.weight / 1000).toFixed(1)}t` : '—'} />
            </StatBlock>

            <StatBlock title={t.recon}>
              <Stat label="View Range"   value={profile.turret?.view_range    ? `${profile.turret.view_range} m`    : '—'} />
              <Stat label="Signal Range" value={profile.radio?.signal_range   ? `${profile.radio.signal_range} m`   : '—'} />
            </StatBlock>
          </div>
        )
      })()}

      {!loading && !profile && <div className="detail-loading">No specs available</div>}
    </div>
  )
}

function StatBlock({ title, children }) {
  return (
    <div className="stat-block">
      <div className="stat-block-title">{title}</div>
      <div className="stat-block-body">{children}</div>
    </div>
  )
}

function Stat({ label, value, highlight }) {
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${highlight ? 'highlight' : ''}`}>{value}</span>
    </div>
  )
}
