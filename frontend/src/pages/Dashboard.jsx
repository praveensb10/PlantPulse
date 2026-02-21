import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import AddPlantModal from '../components/AddPlantModal'
import PlantCard from '../components/PlantCard'
import { getPlants } from '../api'

export default function Dashboard({ session }) {
  const navigate = useNavigate()
  const [plants, setPlants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')

  async function fetchPlants() {
    try {
      const data = await getPlants()
      setPlants(data)
    } catch (err) {
      setError('Failed to load plants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPlants() }, [])

  function handlePlantAdded(plant) {
    setPlants(prev => [plant, ...prev])
    setShowModal(false)
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar session={session} />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-10 fade-up">
          <div>
            <p className="text-earth-400 text-sm mb-1">Good day 🌤</p>
            <h1 className="font-display text-4xl font-bold text-forest-900">Your Garden</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-forest-600 hover:bg-forest-700 text-white px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            <span className="text-lg">+</span>
            Add plant
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-forest-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : plants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center fade-up">
            <div className="text-6xl mb-4">🪴</div>
            <h3 className="font-display text-2xl font-semibold text-forest-800 mb-2">No plants yet</h3>
            <p className="text-earth-400 text-sm mb-6">Add your first plant to start monitoring</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-forest-600 hover:bg-forest-700 text-white px-6 py-3 rounded-2xl text-sm font-medium transition-all"
            >
              + Add your first plant
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 fade-up">
            {plants.map(plant => (
              <PlantCard
                key={plant.id}
                plant={plant}
                onClick={() => navigate(`/plant/${plant.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <AddPlantModal
          onClose={() => setShowModal(false)}
          onPlantAdded={handlePlantAdded}
        />
      )}
    </div>
  )
}
