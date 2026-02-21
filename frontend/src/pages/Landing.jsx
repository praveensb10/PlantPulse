import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #bbdabc 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, #dfd0b8 0%, transparent 40%),
                            radial-gradient(circle at 60% 80%, #bbdabc 0%, transparent 35%)`
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="font-display text-xl font-semibold text-forest-800">PlantPulse</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="text-sm font-medium text-forest-600 hover:text-forest-800 transition-colors duration-200"
        >
          Sign in →
        </button>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] text-center px-6">
        <div className="fade-up">
          <div className="inline-flex items-center gap-2 bg-forest-100 text-forest-700 text-xs font-medium px-4 py-2 rounded-full mb-8 border border-forest-200">
            <span className="w-1.5 h-1.5 bg-forest-500 rounded-full pulse-green inline-block" />
            Live sensor monitoring
          </div>

          <h1 className="font-display text-6xl md:text-7xl font-bold text-forest-900 leading-tight mb-6 max-w-3xl">
            Your plants,<br />
            <span className="italic text-forest-500">always thriving</span>
          </h1>

          <p className="text-earth-600 text-lg max-w-xl mb-12 leading-relaxed font-light">
            Smart IoT monitoring for your indoor garden. Real-time soil moisture, NPK levels,
            temperature — automated watering and lighting so you never lose a plant again.
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="bg-forest-600 hover:bg-forest-700 text-white px-8 py-4 rounded-2xl font-medium text-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              Get started
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-white border border-earth-200 text-earth-700 px-8 py-4 rounded-2xl font-medium text-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              Sign in
            </button>
          </div>
        </div>

        {/* Feature pills */}
        <div className="mt-20 flex flex-wrap gap-3 justify-center max-w-2xl fade-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
          {['🌱 Soil Moisture', '🌡️ Temperature', '💧 Auto Watering', '💡 Smart Lighting', '🧪 NPK Levels', '🤖 ML Health Check'].map(f => (
            <span key={f} className="bg-white border border-earth-100 text-earth-700 text-xs px-4 py-2 rounded-full shadow-sm">
              {f}
            </span>
          ))}
        </div>
      </main>
    </div>
  )
}
