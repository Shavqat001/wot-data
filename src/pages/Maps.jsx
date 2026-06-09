import { useState } from 'react'
import { MAPS, MAP_TYPES, TYPE_COLORS } from '../data/maps.js'
import './Maps.css'

const MODE_COLORS = {
  'Standard':  '#4fc3f7',
  'Assault':   '#e57373',
  'Encounter': '#81c784',
}

export default function Maps() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = MAPS.filter(m => {
    const matchType = filter === 'All' || m.type === filter
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.tags.some(t => t.includes(search.toLowerCase()))
    return matchType && matchSearch
  })

  if (selected) return <MapDetail map={selected} onBack={() => setSelected(null)} />

  return (
    <div className="maps-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">MAPS</h1>
          <p className="page-subtitle">{filtered.length} maps available</p>
        </div>
      </div>

      <div className="filters">
        <input
          className="search-input"
          placeholder="Search map or tag..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="type-filters">
          {MAP_TYPES.map(t => (
            <button
              key={t}
              className={`type-btn ${filter === t ? 'active' : ''}`}
              onClick={() => setFilter(t)}
              style={filter === t && t !== 'All' ? {
                borderColor: TYPE_COLORS[t]?.label,
                color: TYPE_COLORS[t]?.label
              } : {}}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="maps-grid">
        {filtered.map(map => (
          <MapCard key={map.id} map={map} onClick={() => setSelected(map)} />
        ))}
      </div>
    </div>
  )
}

function MapCard({ map, onClick }) {
  const colors = TYPE_COLORS[map.type] || TYPE_COLORS.mixed

  return (
    <div className="map-card" onClick={onClick} style={{ background: colors.bg, borderColor: colors.border }}>
      <div className="map-card-visual" style={{ borderColor: colors.border }}>
        {map.image
          ? <img src={map.image} alt={map.name} className="map-card-img" />
          : <div className="map-card-icon">🗺️</div>
        }
        <div className="map-card-type-badge" style={{ color: colors.label, borderColor: colors.border }}>
          {map.type.toUpperCase()}
        </div>
      </div>
      <div className="map-card-body">
        <div className="map-card-name">{map.name}</div>
        <div className="map-card-size">{map.size} m</div>
        <div className="map-card-modes">
          {map.modes.map(m => (
            <span key={m} className="mode-tag" style={{ color: MODE_COLORS[m], borderColor: MODE_COLORS[m] + '44' }}>
              {m}
            </span>
          ))}
        </div>
        <div className="map-card-tags">
          {map.tags.map(t => <span key={t} className="tag-chip">{t}</span>)}
        </div>
      </div>
      <div className="map-card-hover">VIEW MAP</div>
    </div>
  )
}

function MapDetail({ map, onBack }) {
  const colors = TYPE_COLORS[map.type] || TYPE_COLORS.mixed
  const [lightbox, setLightbox] = useState(false)

  return (
    <div className="map-detail" style={{ '--map-color': colors.label }}>
      <button className="back-btn" onClick={onBack}>← BACK TO MAPS</button>

      {lightbox && map.image && (
        <div className="lightbox" onClick={() => setLightbox(false)}>
          <div className="lightbox-close">✕</div>
          <img src={map.image} alt={map.name} className="lightbox-img" onClick={e => e.stopPropagation()} />
        </div>
      )}

      <div className="map-detail-hero" style={{ background: colors.bg, borderColor: colors.border }}>
        <div className={`map-detail-visual ${map.image ? 'clickable' : ''}`} onClick={() => map.image && setLightbox(true)}>
          {map.image
            ? <img src={map.image} alt={map.name} className="map-detail-img" />
            : <div className="map-detail-icon">🗺️</div>
          }
          {map.image && <div className="map-detail-zoom">🔍 CLICK TO EXPAND</div>}
          <div className="map-detail-size">{map.size} m</div>
        </div>
        <div className="map-detail-info">
          <div className="map-detail-type" style={{ color: colors.label }}>{map.type.toUpperCase()} MAP</div>
          <h1 className="map-detail-name">{map.name}</h1>
          <p className="map-detail-desc">{map.description}</p>

          <div className="map-detail-modes">
            <div className="detail-section-title">BATTLE MODES</div>
            <div className="modes-list">
              {map.modes.map(m => (
                <div key={m} className="mode-item" style={{ borderColor: MODE_COLORS[m] }}>
                  <span className="mode-dot" style={{ background: MODE_COLORS[m] }} />
                  <span style={{ color: MODE_COLORS[m] }}>{m}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="map-detail-tags-section">
            <div className="detail-section-title">PLAYSTYLE TAGS</div>
            <div className="tags-list">
              {map.tags.map(t => (
                <span key={t} className="tag-chip large" style={{ borderColor: colors.label + '66', color: colors.label }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
