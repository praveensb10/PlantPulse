export default function LightToggle({ isOn, onToggle, loading }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-forest-800">Grow Light</p>
        <p className="text-xs text-earth-400">{isOn ? 'Currently on' : 'Currently off'}</p>
      </div>
      <button
        onClick={onToggle}
        disabled={loading}
        className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isOn
            ? 'bg-yellow-400 focus:ring-yellow-400'
            : 'bg-earth-200 focus:ring-earth-300'
        } disabled:opacity-50`}
      >
        <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 flex items-center justify-center text-xs ${isOn ? 'translate-x-7' : 'translate-x-0'}`}>
          {isOn ? '💡' : ''}
        </span>
      </button>
    </div>
  )
}
