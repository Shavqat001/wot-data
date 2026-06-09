import './Titlebar.css'

export default function Titlebar() {
  const api = window.electronAPI

  return (
    <div className="titlebar">
      <div className="titlebar-drag">
        <span className="titlebar-logo">ARMOR CODER</span>
        <span className="titlebar-sub">DASHBOARD</span>
      </div>
      <div className="titlebar-controls">
        <button className="tb-btn minimize" onClick={() => api?.minimize()}>─</button>
        <button className="tb-btn maximize" onClick={() => api?.maximize()}>□</button>
        <button className="tb-btn close" onClick={() => api?.close()}>✕</button>
      </div>
    </div>
  )
}
