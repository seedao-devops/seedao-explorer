import { fetchAllPeople, fetchAllEvents } from '../_lib/fetcher.js'

export default async function handler(req, res) {
  try {
    const { id } = req.query
    const people = await fetchAllPeople()
    const person = people.find(p => p.id === id)
    if (!person) return res.status(404).json({ error: 'person not found' })

    // Enrich with event titles
    const events = await fetchAllEvents()
    const eventMap = {}
    for (const evt of events) {
      eventMap[evt.id] = evt.data.metadata?.title ?? evt.id
    }

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600')
    res.status(200).json({
      ...person.data,
      event_refs: (person.data.event_refs ?? []).map(ref => ({
        ...ref,
        event_title: eventMap[ref.event_id] ?? ref.event_id,
      })),
    })
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
}
