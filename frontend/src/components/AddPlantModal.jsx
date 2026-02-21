import { useState } from 'react'
import { createPlant, uploadPlantImage } from '../api'

export default function AddPlantModal({ onClose, onPlantAdded }) {
  const [name, setName] = useState('')
  const [variety, setVariety] = useState('')
  const [plantType, setPlantType] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')

    try {
      let imageUrl = null
      if (imageFile) {
        imageUrl = await uploadPlantImage(imageFile)
      }

      const plant = await createPlant({
        name: name.trim(),
        variety: variety.trim() || null,
        plant_type: plantType.trim() || null,
        image_url: imageUrl,
      })

      onPlantAdded(plant)
    } catch (err) {
      setError(err.message || 'Failed to add plant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md fade-up">
        <div className="p-6 border-b border-earth-100 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-forest-900">Add a plant</h2>
          <button onClick={onClose} className="text-earth-300 hover:text-earth-500 text-xl transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image upload */}
          <div>
            <label className="block text-xs font-medium text-earth-700 mb-2">Plant photo</label>
            <div
              onClick={() => document.getElementById('img-upload').click()}
              className="relative h-36 bg-forest-50 border-2 border-dashed border-forest-200 rounded-2xl flex items-center justify-center cursor-pointer hover:border-forest-400 transition-colors overflow-hidden"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <div className="text-center">
                  <div className="text-3xl mb-1">📷</div>
                  <p className="text-xs text-earth-400">Click to upload photo</p>
                </div>
              )}
            </div>
            <input id="img-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-earth-700 mb-1.5">Plant name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="e.g. Tulsi, Green Chilli, Spinach"
              className="w-full bg-cream border border-earth-200 rounded-xl px-4 py-3 text-sm text-forest-900 placeholder-earth-300 focus:outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100 transition-all"
            />
          </div>

          {/* Variety */}
          <div>
            <label className="block text-xs font-medium text-earth-700 mb-1.5">Variety <span className="text-earth-300">(optional)</span></label>
            <input
              value={variety}
              onChange={e => setVariety(e.target.value)}
              placeholder="e.g. Krishna Tulsi, Kali Mirch"
              className="w-full bg-cream border border-earth-200 rounded-xl px-4 py-3 text-sm text-forest-900 placeholder-earth-300 focus:outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100 transition-all"
            />
          </div>

          {/* Plant type */}
          <div>
            <label className="block text-xs font-medium text-earth-700 mb-1.5">Plant type <span className="text-earth-300">(optional)</span></label>
            <input
              value={plantType}
              onChange={e => setPlantType(e.target.value)}
              placeholder="e.g. Herb, Vegetable, Flower"
              className="w-full bg-cream border border-earth-200 rounded-xl px-4 py-3 text-sm text-forest-900 placeholder-earth-300 focus:outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100 transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-earth-50 hover:bg-earth-100 text-earth-600 py-3 rounded-xl text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 bg-forest-600 hover:bg-forest-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-all"
            >
              {loading ? 'Adding...' : 'Add plant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
