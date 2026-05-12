import { fetchAllEvents } from './_lib/fetcher.js'

export default async function handler(_req, res) {
  try {
    const events = await fetchAllEvents()
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600')
    res.status(200).json(events)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
}
