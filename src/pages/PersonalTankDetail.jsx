import { useSettings } from '../context/SettingsContext.jsx'
import './PersonalTankDetail.css'

const TIER_ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

export default function PersonalTankDetail({ tank, onBack }) {
  const { t } = useSettings()
  const s = tank.myStats
  const battles = s?.battles || 0
  const winrate = battles ? ((s.wins / battles) * 100).toFixed(1) : null
  const survivalRate = (battles && s.survived_battles != null) ? ((s.survived_battles / battles) * 100).toFixed(1) : null
  const WR_COLOR = winrate >= 55 ? '#4caf50' : winrate >= 50 ? '#e8a020' : '#e57373'

  const fmt = v => v != null ? Number(v).toLocaleString() : null
  const fmtFixed = (v, d = 0) => v != null ? Number(v).toFixed(d) : null

  return (
    <div className="ptd-page">
      <button className="back-btn" onClick={onBack}>{t.backToGarage}</button>

      <div className="ptd-hero">
        <div className="ptd-img-wrap">
          {tank.images?.big_icon
            ? <img src={tank.images.big_icon} alt={tank.name} className="ptd-img" />
            : <div className="ptd-no-img">?</div>}
        </div>
        <div className="ptd-info">
          <div className="ptd-tier">TIER {TIER_ROMAN[tank.tier]}</div>
          <h1 className="ptd-name">{tank.name}</h1>
          <div className="ptd-tags">
            <span className="tag">{tank.nation?.toUpperCase()}</span>
            <span className="tag">{tank.type}</span>
          </div>
          {winrate && (
            <div className="ptd-winrate" style={{ color: WR_COLOR, borderColor: WR_COLOR }}>
              <div className="wr-num">{winrate}%</div>
              <div className="wr-label">{t.winrate}</div>
            </div>
          )}
        </div>
      </div>

      <div className="ptd-section-title">{t.personalStats}</div>

      {!battles ? (
        <div className="ptd-no-stats">No battles played yet</div>
      ) : (
        <div className="ptd-stats-grid">
          {/* Row 1: battle results */}
          <StatCard label={t.battles}   value={fmt(battles)}          color="var(--text-primary)" />
          <StatCard label={t.wins}      value={fmt(s.wins)}           color="#4caf50" />
          <StatCard label={t.losses}     value={fmt(s.losses)}         color="#e57373" />
          <StatCard label={t.survived}  value={survivalRate != null ? `${survivalRate}%` : null} color="#4fc3f7" />

          {/* Row 2: damage */}
          <StatCard label={t.avgDamage}   value={s.damage_dealt != null && battles ? fmt(Math.round(s.damage_dealt / battles)) : null} color="var(--accent-orange)" />
          <StatCard label={t.avgAssisted}  value={fmtFixed(s.avg_damage_assisted_radio, 0)} color="#ffb74d" />
          <StatCard label={t.avgBlocked}  value={fmtFixed(s.avg_damage_blocked, 0)}        color="#81c784" />

          {/* Row 3: combat */}
          <StatCard label={t.frags}   value={fmt(s.frags)}          color="#e57373" />
          <StatCard label={t.accuracy} value={s.hits_percents != null ? `${s.hits_percents}%` : null} color="#90caf9" />
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="ptd-stat-card">
      <div className="ptd-stat-value" style={{ color }}>{value ?? '—'}</div>
      <div className="ptd-stat-label">{label}</div>
    </div>
  )
}
