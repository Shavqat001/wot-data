import { useSettings } from '../context/SettingsContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import './Sidebar.css'

export default function Sidebar({ activeNav, setActiveNav }) {
  const { t, server, SERVERS } = useSettings()
  const { user } = useAuth()

  const navItems = [
    { id: 'tanks',    label: t.allTanks,  icon: '🛡️' },
    { id: 'mygarage', label: t.myGarage,  icon: '⭐' },
    { id: 'stats',    label: t.stats,     icon: '📊' },
    { id: 'maps',     label: t.maps,      icon: '🗺️' },
    { id: 'settings', label: t.settings,  icon: '⚙️' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-armor">ARMOR</span>
        <span className="logo-coder">CODER</span>
        <div className="logo-sub">DASHBOARD</div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
            onClick={() => setActiveNav(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {activeNav === item.id && <div className="nav-indicator" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="server-badge">{SERVERS[server]?.label}</div>
        {user && <div className="user-chip">⭐ {user.nickname}</div>}
      </div>
    </aside>
  )
}
