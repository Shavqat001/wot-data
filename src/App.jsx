import { useState } from 'react'
import { SettingsProvider } from './context/SettingsContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import Sidebar from './components/Sidebar.jsx'
import Titlebar from './components/Titlebar.jsx'
import TankList from './pages/TankList.jsx'
import TankDetail from './pages/TankDetail.jsx'
import Stats from './pages/Stats.jsx'
import Maps from './pages/Maps.jsx'
import MyGarage from './pages/MyGarage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import './App.css'

function AppInner() {
  const [selectedTank, setSelectedTank] = useState(null)
  const [activeNav, setActiveNav] = useState('tanks')
  const isElectron = !!window.electronAPI

  function renderPage() {
    if (selectedTank) return <TankDetail tank={selectedTank} onBack={() => setSelectedTank(null)} />
    if (activeNav === 'tanks')    return <TankList onSelectTank={setSelectedTank} />
    if (activeNav === 'mygarage') return <MyGarage />
    if (activeNav === 'stats')    return <Stats />
    if (activeNav === 'maps')     return <Maps />
    if (activeNav === 'settings') return <SettingsPage />
  }

  return (
    <div className="app-wrapper">
      {isElectron && <Titlebar />}
      <div className="app-layout">
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
        <main className="main-content">
          <div className="page-transition" key={activeNav + (selectedTank?.tank_id || '')}>
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </SettingsProvider>
  )
}
