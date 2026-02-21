import { supabase } from '../lib/supabaseClient'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession()
  return { Authorization: `Bearer ${session?.access_token}` }
}

// ── Plants ──────────────────────────────────────────────────

export async function getPlants() {
  const headers = await getAuthHeader()
  const res = await fetch(`${BACKEND_URL}/plants/`, { headers })
  if (!res.ok) throw new Error('Failed to fetch plants')
  return res.json()
}

export async function getPlant(plantId) {
  const headers = await getAuthHeader()
  const res = await fetch(`${BACKEND_URL}/plants/${plantId}`, { headers })
  if (!res.ok) throw new Error('Failed to fetch plant')
  return res.json()
}

export async function createPlant(plantData) {
  const headers = { ...(await getAuthHeader()), 'Content-Type': 'application/json' }
  const res = await fetch(`${BACKEND_URL}/plants/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(plantData),
  })
  if (!res.ok) throw new Error('Failed to create plant')
  return res.json()
}

export async function deletePlant(plantId) {
  const headers = await getAuthHeader()
  const res = await fetch(`${BACKEND_URL}/plants/${plantId}`, { method: 'DELETE', headers })
  if (!res.ok) throw new Error('Failed to delete plant')
  return res.json()
}

// ── Sensor Data ─────────────────────────────────────────────

export async function getLatestSensorData(plantId) {
  const headers = await getAuthHeader()
  const res = await fetch(`${BACKEND_URL}/sensor-data/${plantId}`, { headers })
  if (!res.ok) throw new Error('Failed to fetch sensor data')
  return res.json()
}

// ── Controls ────────────────────────────────────────────────

export async function getLightStatus(plantId) {
  const headers = await getAuthHeader()
  const res = await fetch(`${BACKEND_URL}/controls/light/${plantId}`, { headers })
  if (!res.ok) throw new Error('Failed to fetch light status')
  return res.json()
}

export async function toggleLight(plantId, isOn) {
  const headers = { ...(await getAuthHeader()), 'Content-Type': 'application/json' }
  const res = await fetch(`${BACKEND_URL}/controls/light/${plantId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ is_on: isOn }),
  })
  if (!res.ok) throw new Error('Failed to toggle light')
  return res.json()
}

export async function triggerWater(plantId) {
  const headers = { ...(await getAuthHeader()), 'Content-Type': 'application/json' }
  const res = await fetch(`${BACKEND_URL}/controls/water/${plantId}`, {
    method: 'POST',
    headers,
  })
  if (!res.ok) throw new Error('Failed to trigger watering')
  return res.json()
}

// ── Image Upload ─────────────────────────────────────────────

export async function uploadPlantImage(file) {
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  const fileName = `${userId}/${Date.now()}-${file.name}`

  const { data, error } = await supabase.storage
    .from('plant-images')
    .upload(fileName, file, { upsert: true })

  if (error) throw new Error(error.message)

  const { data: { publicUrl } } = supabase.storage
    .from('plant-images')
    .getPublicUrl(fileName)

  return publicUrl
}
