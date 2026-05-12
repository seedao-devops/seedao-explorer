/**
 * GitHub Raw 数据抓取 — Vercel Serverless 版
 * 每个请求独立从 GitHub 拉取（利用 Vercel Edge Cache 优化）
 */
const RAW = 'https://raw.githubusercontent.com/seedao-devops/seedao-wiki/main/_data'

const PEOPLE_FILES = [
  'ddd', 'jack_0x137', 'rebecca', 'shawn', 'slothrun',
  'vera', '唐晗', '王汉洋', '白鱼',
]
const EVENT_FILES = ['evt_1778403649208', 'evt_1778404160162']

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`)
  return res.json()
}

export async function fetchCommunity() {
  return fetchJson(`${RAW}/community.json`)
}

export async function fetchAllPeople() {
  const results = await Promise.all(
    PEOPLE_FILES.map(async (id) => {
      const data = await fetchJson(`${RAW}/people/${encodeURIComponent(id)}.json`)
      return { id, data }
    })
  )
  return results
}

export async function fetchAllEvents() {
  const results = await Promise.all(
    EVENT_FILES.map(async (id) => {
      const data = await fetchJson(`${RAW}/events/${id}.json`)
      return { id, data }
    })
  )
  return results
}

export async function fetchState() {
  return fetchJson(`${RAW}/state/state.json`)
}

export async function fetchGraph() {
  return fetchJson(`${RAW}/state/graph.json`)
}
