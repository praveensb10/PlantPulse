import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Navbar({ session }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-earth-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <span className="font-display text-lg font-semibold text-forest-800">PlantPulse</span>
        </button>

        <div className="flex items-center gap-4">
          <span className="text-xs text-earth-400 hidden sm:block">{session?.user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-earth-500 hover:text-forest-700 font-medium transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
