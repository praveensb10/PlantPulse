function getNPKStatus(type, value) {
  const ranges = {
    nitrogen:   { low: 40, high: 120 },
    phosphorus: { low: 10, high: 40 },
    potassium:  { low: 50, high: 200 },
  }
  const r = ranges[type]
  if (value === null || value === undefined) return { label: '—', style: 'bg-earth-50 text-earth-400 border-earth-100' }
  if (value < r.low) return { label: 'Low', style: 'bg-red-50 text-red-600 border-red-200' }
  if (value > r.high) return { label: 'Excess', style: 'bg-orange-50 text-orange-600 border-orange-200' }
  return { label: 'Good', style: 'bg-forest-50 text-forest-700 border-forest-200' }
}

function NPKRow({ label, symbol, value, type }) {
  const status = getNPKStatus(type, value)
  return (
    <div className="flex items-center justify-between py-3 border-b border-earth-50 last:border-0">
      <div className="flex items-center gap-3">
        <span className="w-7 h-7 rounded-lg bg-earth-100 text-earth-600 text-xs font-bold flex items-center justify-center">{symbol}</span>
        <span className="text-sm text-forest-800">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-forest-900">
          {value !== null && value !== undefined ? `${value} mg/kg` : '—'}
        </span>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${status.style}`}>
          {status.label}
        </span>
      </div>
    </div>
  )
}

export default function NPKStatus({ nitrogen, phosphorus, potassium }) {
  return (
    <div className="bg-white rounded-3xl border border-earth-100 p-5">
      <h3 className="font-display text-lg font-semibold text-forest-900 mb-1">Nutrient Levels</h3>
      <p className="text-xs text-earth-400 mb-4">NPK soil analysis</p>
      <NPKRow label="Nitrogen" symbol="N" value={nitrogen} type="nitrogen" />
      <NPKRow label="Phosphorus" symbol="P" value={phosphorus} type="phosphorus" />
      <NPKRow label="Potassium" symbol="K" value={potassium} type="potassium" />
    </div>
  )
}
