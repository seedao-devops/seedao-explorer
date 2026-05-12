import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Loader2, AlertTriangle, Search, Calendar, ExternalLink,
  Tag, User, Users, FileText
} from 'lucide-react'
import { fetchAllEvents } from '../api/data'
import type { Event } from '../types'

function tsToDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      <span className="ml-2 text-gray-500">加载事件数据...</span>
    </div>
  )
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const highlight = searchParams.get('highlight')

  useEffect(() => {
    fetchAllEvents()
      .then(results => setEvents(results.map(r => r.data as Event)))
      .catch(e => setError(e.message))
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return events
    const q = search.toLowerCase()
    return events.filter(e =>
      e.metadata.title.toLowerCase().includes(q) ||
      e.metadata.tags.some(t => t.toLowerCase().includes(q)) ||
      e.id.toLowerCase().includes(q)
    )
  }, [events, search])

  if (error) return (
    <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-4">
      <AlertTriangle className="w-5 h-5" />
      <span>{error}</span>
    </div>
  )
  if (!events.length) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-500" />
          事件
          <span className="text-sm font-normal text-gray-400">({events.length})</span>
        </h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="搜索事件标题、标签..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
      </div>

      <div className="space-y-4">
        {filtered.map(event => (
          <Link
            key={event.id}
            to={`/events/${encodeURIComponent(event.id)}`}
            className={`bg-white rounded-xl border p-5 hover:shadow-md transition-shadow block ${
              highlight === event.id ? 'ring-2 ring-purple-400 border-purple-400' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 leading-snug mb-1">
                  {event.metadata.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {event.metadata.description}
                </p>
              </div>
              <span className="shrink-0 text-xs text-gray-400 mt-1">
                {tsToDate(event.timestamp)}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {event.metadata.tags.map(t => (
                <span key={t} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">
                  {t}
                </span>
              ))}
            </div>

            {/* People */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>发起者：</span>
                <Link
                  to={`/people?highlight=${encodeURIComponent(event.initiator)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-purple-600 font-medium hover:underline"
                >
                  {event.initiator}
                </Link>
              </div>
              {event.co_creators.length > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>共创者：</span>
                  {event.co_creators.map((c, i) => (
                    <span key={c}>
                      <Link
                        to={`/people?highlight=${encodeURIComponent(c)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-purple-600 font-medium hover:underline"
                      >
                        {c}
                      </Link>
                      {i < event.co_creators.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Artifacts */}
            {event.artifacts.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {event.artifacts.map((a, i) => (
                  <a
                    key={i}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {a.title}
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                ))}
              </div>
            )}

            {/* Source */}
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <Tag className="w-3 h-3" />
              <span>{event.metadata.published_by}</span>
              <span>·</span>
              <span>{event.external.platform}</span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-10">未找到匹配事件</p>
      )}
    </div>
  )
}
