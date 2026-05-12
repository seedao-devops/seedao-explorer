/**
 * Express 缓存服务器
 * - 启动时拉取全量数据到内存
 * - 每小时自动刷新
 * - 提供 REST API: /api/community, /api/people, /api/events, /api/state, /api/graph
 */
import express from 'express'
import cors from 'cors'
import {
  fetchCommunity,
  fetchAllPeople,
  fetchAllEvents,
  fetchState,
  fetchGraph,
} from './fetcher.mjs'

const PORT = process.env.API_PORT || 3001
const REFRESH_MS = 60 * 60 * 1000 // 1 hour

const app = express()
app.use(cors())

// -- In-memory cache --
const cache = {
  community: null,
  people: null,
  events: null,
  state: null,
  graph: null,
}

let loading = false
let lastFetch = null

async function refreshAll() {
  if (loading) return
  loading = true
  console.log('[cache] refreshing all data from GitHub...')
  try {
    const [community, people, events, state, graph] = await Promise.all([
      fetchCommunity(),
      fetchAllPeople(),
      fetchAllEvents(),
      fetchState(),
      fetchGraph(),
    ])
    cache.community = community
    cache.people = people
    cache.events = events
    cache.state = state
    cache.graph = graph
    lastFetch = new Date()
    console.log(`[cache] refreshed — ${people.length} people, ${events.length} events`)
  } catch (err) {
    console.error('[cache] refresh failed:', err.message)
  } finally {
    loading = false
  }
}

// -- API routes --
app.get('/api/community', (_req, res) => {
  if (!cache.community) return res.status(503).json({ error: 'data not ready' })
  res.json(cache.community)
})

app.get('/api/people', (_req, res) => {
  if (!cache.people) return res.status(503).json({ error: 'data not ready' })
  res.json(cache.people)
})

app.get('/api/people/:id', (req, res) => {
  if (!cache.people) return res.status(503).json({ error: 'data not ready' })
  const person = cache.people.find(p => p.id === req.params.id)
  if (!person) return res.status(404).json({ error: 'person not found' })
  // 关联事件标题
  const eventMap = {}
  if (cache.events) {
    for (const evt of cache.events) {
      eventMap[evt.id] = evt.data.metadata?.title ?? evt.id
    }
  }
  const enriched = {
    ...person.data,
    event_refs: person.data.event_refs?.map(ref => ({
      ...ref,
      event_title: eventMap[ref.event_id] ?? ref.event_id,
    })) ?? [],
  }
  res.json(enriched)
})

app.get('/api/events', (_req, res) => {
  if (!cache.events) return res.status(503).json({ error: 'data not ready' })
  res.json(cache.events)
})

app.get('/api/events/:id', (req, res) => {
  if (!cache.events) return res.status(503).json({ error: 'data not ready' })
  const evt = cache.events.find(e => e.id === req.params.id)
  if (!evt) return res.status(404).json({ error: 'event not found' })
  // 注入参与者名称 (当前 profile 多为空，但预留)
  const participantNames = {}
  if (cache.people) {
    for (const p of cache.people) {
      participantNames[p.id] = p.data.profile?.name ?? p.id
    }
  }
  const enriched = {
    ...evt.data,
    _enriched: {
      initiator_name: participantNames[evt.data.initiator] ?? evt.data.initiator,
      co_creator_names: (evt.data.co_creators ?? []).map(
        c => participantNames[c] ?? c
      ),
    },
  }
  res.json(enriched)
})

app.get('/api/state', (_req, res) => {
  if (!cache.state) return res.status(503).json({ error: 'data not ready' })
  res.json(cache.state)
})

app.get('/api/graph', (_req, res) => {
  if (!cache.graph) return res.status(503).json({ error: 'data not ready' })
  res.json(cache.graph)
})

// Health + metadata
app.get('/api/health', (_req, res) => {
  res.json({
    status: cache.community ? 'ready' : 'loading',
    lastFetch,
    counts: {
      people: cache.people?.length ?? 0,
      events: cache.events?.length ?? 0,
    },
  })
})

// Start
async function start() {
  await refreshAll()
  setInterval(refreshAll, REFRESH_MS)

  app.listen(PORT, () => {
    console.log(`[server] cache API running on http://localhost:${PORT}`)
    console.log(`[server] refresh interval: ${REFRESH_MS / 1000 / 60} min`)
  })
}

start()
