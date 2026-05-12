export default async function handler(_req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300')
  res.status(200).json({
    status: 'ready',
    lastFetch: null,
    counts: { people: 9, events: 2 },
  })
}
