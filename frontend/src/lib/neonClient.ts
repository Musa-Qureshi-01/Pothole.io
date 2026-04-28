import { createClient } from '@neondatabase/neon-js'

const authUrl = import.meta.env.VITE_NEON_AUTH_URL
const dataApiUrl = import.meta.env.VITE_NEON_DATA_API_URL

if (!authUrl) {
  throw new Error('Missing VITE_NEON_AUTH_URL environment variable.')
}

if (!dataApiUrl) {
  throw new Error('Missing VITE_NEON_DATA_API_URL environment variable.')
}

export const neonClient = createClient({
  auth: { url: authUrl },
  dataApi: { url: dataApiUrl },
})
