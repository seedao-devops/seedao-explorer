import { fetchAllEvents, fetchAllPeople } from '../_lib/fetcher.js'

export default async function handler(req, res) {
  try {
    const { id } = req.query
    const events = await fetchAllEvents()
    const evt = events.find(e => e.id === id)
    if (!evt) return res.status(404).json({ error: 'event not found' })

    // Enrich with participant names
    const people = await fetchAllPeople()
    const names = {}
    for (const p of people) {
      names[p.id] = p.data.profile?.name ?? p.id
    }

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600')
    res.status(200).json({
      ...evt.data,
      _enriched: {
        initiator_name: names[evt.data.initiator] ?? evt.data.initiator,
        co_creator_names: (evt.data.co_creators ?? []).map(c => names[c] ?? c),
      },
    })
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
}
