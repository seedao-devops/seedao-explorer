/**
 * 前端数据层 — 调用本地缓存 API（通过 Vite proxy 转发）
 */
const BASE = '/api'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.json()
}

export function fetchCommunity() {
  return fetchJson<any>(`${BASE}/community`)
}

export async function fetchAllPeople(): Promise<{ id: string; data: any }[]> {
  return fetchJson<any[]>(`${BASE}/people`)
}

export async function fetchPerson(id: string): Promise<any> {
  // 优先调单人物端点；若路由不存在（旧服务）则降级为全量过滤
  const directUrl = `${BASE}/people/${encodeURIComponent(id)}`
  const res = await fetch(directUrl)
  if (res.ok) return res.json()
  if (res.status === 404 || res.status === 503) {
    const all = await fetchAllPeople()
    const found = all.find(p => p.id === id)
    if (!found) throw new Error(`Person not found: ${id}`)
    return found.data
  }
  throw new Error(`Failed to fetch ${directUrl}: ${res.status}`)
}

export async function fetchAllEvents(): Promise<{ id: string; data: any }[]> {
  return fetchJson<any[]>(`${BASE}/events`)
}

export async function fetchEvent(id: string): Promise<any> {
  const directUrl = `${BASE}/events/${encodeURIComponent(id)}`
  const res = await fetch(directUrl)
  if (res.ok) return res.json()
  if (res.status === 404 || res.status === 503) {
    const all = await fetchAllEvents()
    const found = all.find(e => e.id === id)
    if (!found) throw new Error(`Event not found: ${id}`)
    return found.data
  }
  throw new Error(`Failed to fetch ${directUrl}: ${res.status}`)
}

export function fetchState() {
  return fetchJson<any>(`${BASE}/state`)
}

export function fetchGraph() {
  return fetchJson<any>(`${BASE}/graph`)
}

/** 健康检查 */
export function fetchHealth() {
  return fetchJson<any>(`${BASE}/health`)
}
