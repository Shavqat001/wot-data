import './TankCard.css'

const TIER_ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

const TYPE_COLOR = {
  'lightTank': '#4fc3f7',
  'mediumTank': '#81c784',
  'heavyTank': '#e57373',
  'AT-SPG': '#ffb74d',
  'SPG': '#ce93d8',
}

export default function TankCard({ tank, onClick, inGarage }) {
  const color = TYPE_COLOR[tank.type] || '#888'
  const tier = TIER_ROMAN[tank.tier] || tank.tier

  return (
    <div className={`tank-card ${inGarage ? 'in-garage' : ''}`} onClick={onClick}>
      <div className="tank-card-tier" style={{ color }}>{tier}</div>
      {inGarage && <div className="tank-card-garage-badge">⭐</div>}
      <div className="tank-card-img-wrap">
        {tank.images?.big_icon ? (
          <img src={tank.images.big_icon} alt={tank.name} className="tank-card-img" />
        ) : (
          <div className="tank-card-no-img">?</div>
        )}
      </div>
      <div className="tank-card-info">
        <div className="tank-card-name">{tank.name}</div>
        <div className="tank-card-meta">
          <span className="tank-card-type" style={{ color }}>{tank.type}</span>
          <span className="tank-card-nation">{tank.nation?.toUpperCase()}</span>
        </div>
      </div>
      <div className="tank-card-hover-overlay">VIEW DETAILS</div>
    </div>
  )
}
