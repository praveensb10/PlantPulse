export default function SensorCard({ icon, label, value, unit, color = 'forest' }) {
  const colorMap = {
    forest: 'bg-forest-50 border-forest-100 text-forest-600',
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    orange: 'bg-orange-50 border-orange-100 text-orange-600',
    yellow: 'bg-yellow-50 border-yellow-100 text-yellow-600',
  }

  return (
    <div className={`rounded-2xl border p-4 ${colorMap[color]}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-xs opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-display font-bold">
        {value !== null && value !== undefined ? value : '—'}
        {value !== null && value !== undefined && <span className="text-sm font-normal ml-1 opacity-70">{unit}</span>}
      </p>
    </div>
  )
}
