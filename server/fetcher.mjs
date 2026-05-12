/**
 * GitHub Raw 数据抓取层 — 全量使用 Raw URL，不依赖 GitHub API（避免限流）
 */
const RAW_BASE = 'https://raw.githubusercontent.com/seedao-devops/seedao-wiki/main/_data'

// 已知文件清单（数据更新频率低，硬编码避免 API 限流）
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
  return fetchJson(`${RAW_BASE}/community.json`)
}

export async function fetchAllPeople() {
  const results = await Promise.all(
    PEOPLE_FILES.map(async (id) => {
      const data = await fetchJson(`${RAW_BASE}/people/${encodeURIComponent(id)}.json`)
      return { id, data }
    })
  )
  return results
}

export async function fetchAllEvents() {
  const results = await Promise.all(
    EVENT_FILES.map(async (id) => {
      const data = await fetchJson(`${RAW_BASE}/events/${id}.json`)
      return { id, data }
    })
  )
  return results
}

export async function fetchState() {
  return fetchJson(`${RAW_BASE}/state/state.json`)
}

export async function fetchGraph() {
  return fetchJson(`${RAW_BASE}/state/graph.json`)
}
