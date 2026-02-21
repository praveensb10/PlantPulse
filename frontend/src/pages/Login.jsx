import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Check your email to confirm your account!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-forest-700 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 70%, #bbdabc 0%, transparent 60%),
                              radial-gradient(circle at 70% 30%, #5a9e5d 0%, transparent 50%)`
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="font-display text-xl font-semibold text-white">PlantPulse</span>
          </div>
        </div>
        <div className="relative z-10">
          <p className="font-display text-4xl text-white font-light italic leading-snug mb-6">
            "Every plant tells a story.<br />We help you read it."
          </p>
          <div className="flex gap-6 text-forest-200 text-sm">
            <div><div className="text-2xl font-display font-bold text-white">7</div><div>Sensors</div></div>
            <div><div className="text-2xl font-display font-bold text-white">24/7</div><div>Monitoring</div></div>
            <div><div className="text-2xl font-display font-bold text-white">ML</div><div>Powered</div></div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm fade-up">
          <button onClick={() => navigate('/')} className="text-earth-500 text-sm mb-8 hover:text-earth-700 transition-colors">
            ← Back
          </button>

          <h2 className="font-display text-3xl font-bold text-forest-900 mb-2">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h2>
          <p className="text-earth-500 text-sm mb-8">
            {isSignUp ? 'Start monitoring your plants today' : 'Sign in to your garden dashboard'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-earth-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-white border border-earth-200 rounded-xl px-4 py-3 text-sm text-forest-900 placeholder-earth-300 focus:outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-earth-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-white border border-earth-200 rounded-xl px-4 py-3 text-sm text-forest-900 placeholder-earth-300 focus:outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100 transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-forest-50 border border-forest-200 text-forest-700 text-xs px-4 py-3 rounded-xl">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest-600 hover:bg-forest-700 disabled:opacity-60 text-white py-3 rounded-xl font-medium text-sm transition-all duration-200 hover:shadow-md"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-earth-500 mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('') }}
              className="text-forest-600 font-medium hover:text-forest-800 transition-colors"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
