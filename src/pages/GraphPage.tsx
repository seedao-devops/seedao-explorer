import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Loader2, AlertTriangle, GitGraph, ArrowLeftRight,
  User, Users, Calendar, ChevronRight,
} from 'lucide-react'
import { fetchGraph, fetchAllPeople, fetchAllEvents } from '../api/data'
import type { GraphData, Person, Event } from '../types'

function tsToDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      <span className="ml-2 text-gray-500">加载关系数据...</span>
    </div>
  )
}

export default function GraphPage() {
  const [graph, setGraph] = useState<GraphData | null>(null)
  const [people, setPeople] = useState<Person[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([fetchGraph(), fetchAllPeople(), fetchAllEvents()])
      .then(([g, p, e]) => {
        setGraph(g)
        setPeople(p.map(r => r.data as Person))
        setEvents(e.map(r => r.data as Event))
      })
      .catch(e => setError(e.message))
  }, [])

  if (error) return (
    <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-4">
      <AlertTriangle className="w-5 h-5" />
      <span>{error}</span>
    </div>
  )
  if (!graph || !people.length) return <Loading />

  // Build lookup maps
  const eventMap = new Map(events.map(e => [e.id, e]))
  const personEvents = new Map<string, { event: Event; role: 'initiator' | 'co_creator' }[]>()
  for (const p of people) {
    const items: { event: Event; role: 'initiator' | 'co_creator' }[] = []
    for (const ref of p.event_refs) {
      const evt = eventMap.get(ref.event_id)
      if (evt) items.push({ event: evt, role: ref.role })
    }
    personEvents.set(p.id, items)
  }

  // Co-creator connections per person
  const personConnections = new Map<string, Set<string>>()
  for (const p of people) {
    const conns = new Set<string>()
    for (const ref of p.event_refs) {
      const evt = eventMap.get(ref.event_id)
      if (!evt) continue
      if (evt.initiator !== p.id) conns.add(evt.initiator)
      for (const cc of evt.co_creators) {
        if (cc !== p.id) conns.add(cc)
      }
    }
    personConnections.set(p.id, conns)
  }

  const totalEdges = events.reduce((sum, e) => sum + 1 + e.co_creators.length, 0)

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <GitGraph className="w-5 h-5 text-purple-500" />
        关系图
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatBadge icon={Users} label="人物节点" value={people.length} color="purple" to="/people" />
        <StatBadge icon={Calendar} label="事件节点" value={events.length} color="amber" to="/events" />
        <StatBadge icon={ArrowLeftRight} label="关系连线" value={totalEdges || graph.stats.edge_count} color="emerald" />
      </div>

      {/* People connection network */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-500" />
          人物关系网络
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map(p => {
            const pevs = personEvents.get(p.id) ?? []
            const conns = personConnections.get(p.id) ?? new Set()
            return (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                {/* Person header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <Link
                      to={`/people/${encodeURIComponent(p.id)}`}
                      className="font-semibold text-sm text-gray-900 hover:text-purple-600 truncate block"
                    >
                      {p.id}
                    </Link>
                    <div className="text-xs text-gray-400">{pevs.length} 个事件</div>
                  </div>
                </div>

                {/* Events */}
                {pevs.length > 0 && (
                  <div className="space-y-1.5">
                    {pevs.map(({ event, role }) => (
                      <Link
                        key={event.id}
                        to={`/events/${encodeURIComponent(event.id)}`}
                        className="flex items-start gap-2 text-xs group"
                      >
                        <span className={`mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full ${
                          role === 'initiator' ? 'bg-purple-400' : 'bg-emerald-400'
                        }`} />
                        <span className="text-gray-600 group-hover:text-purple-600 line-clamp-2 leading-snug">
                          {event.metadata.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Connections */}
                {conns.size > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-400 mb-1.5">关联成员</div>
                    <div className="flex flex-wrap gap-1">
                      {[...conns].map(cid => (
                        <Link
                          key={cid}
                          to={`/people/${encodeURIComponent(cid)}`}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs hover:bg-purple-50 hover:text-purple-600 transition-colors"
                        >
                          {cid}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {pevs.length === 0 && (
                  <p className="text-xs text-gray-400 italic">暂无参与事件</p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Event participation view */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-500" />
          事件参与图谱
        </h3>
        <div className="space-y-3">
          {events.map(evt => (
            <div key={evt.id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
              <Link
                to={`/events/${encodeURIComponent(evt.id)}`}
                className="text-sm font-semibold text-gray-900 hover:text-purple-600 mb-3 block"
              >
                {evt.metadata.title}
              </Link>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {/* Initiator */}
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="text-xs text-gray-500">发起</span>
                  <Link
                    to={`/people/${encodeURIComponent(evt.initiator)}`}
                    className="text-xs font-medium text-purple-700 hover:underline"
                  >
                    {evt.initiator}
                  </Link>
                </div>

                {/* Arrow separator */}
                {evt.co_creators.length > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 hidden sm:block" />
                )}

                {/* Co-creators */}
                {evt.co_creators.map(cc => (
                  <div key={cc} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-gray-500">共创</span>
                    <Link
                      to={`/people/${encodeURIComponent(cc)}`}
                      className="text-xs font-medium text-emerald-700 hover:underline"
                    >
                      {cc}
                    </Link>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                <span>{tsToDate(evt.timestamp)}</span>
                <span>·</span>
                <span>{evt.metadata.published_by}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Raw matrix (collapsible) */}
      <details className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 group">
        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none list-none flex items-center gap-1.5">
          <span className="group-open:hidden">▸</span>
          <span className="hidden group-open:inline">▾</span>
          节点关系矩阵（原始数据）
        </summary>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-2 pr-4">来源</th>
                <th className="pb-2 pr-4">关系</th>
                <th className="pb-2">目标</th>
              </tr>
            </thead>
            <tbody>
              {events.flatMap(evt => [
                <tr key={`${evt.id}-init`} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2 pr-4">
                    <Link
                      to={`/people/${encodeURIComponent(evt.initiator)}`}
                      className="inline-flex items-center gap-1.5 hover:text-purple-600 transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <span className="font-medium text-gray-900">{evt.initiator}</span>
                    </Link>
                  </td>
                  <td className="py-2 pr-4">
                    <Link
                      to={`/events/${encodeURIComponent(evt.id)}`}
                      className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors inline-block"
                    >
                      发起
                    </Link>
                  </td>
                  <td className="py-2">
                    <Link
                      to={`/events/${encodeURIComponent(evt.id)}`}
                      className="text-gray-600 hover:text-purple-600 truncate max-w-[200px] sm:max-w-xs block transition-colors"
                    >
                      {evt.metadata.title}
                    </Link>
                  </td>
                </tr>,
                ...evt.co_creators.map(cc => (
                  <tr key={`${evt.id}-${cc}`} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2 pr-4">
                      <Link
                        to={`/people/${encodeURIComponent(cc)}`}
                        className="inline-flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-medium text-gray-900">{cc}</span>
                      </Link>
                    </td>
                    <td className="py-2 pr-4">
                      <Link
                        to={`/events/${encodeURIComponent(evt.id)}`}
                        className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors inline-block"
                      >
                        共创
                      </Link>
                    </td>
                    <td className="py-2">
                      <Link
                        to={`/events/${encodeURIComponent(evt.id)}`}
                        className="text-gray-600 hover:text-purple-600 truncate max-w-[200px] sm:max-w-xs block transition-colors"
                      >
                        {evt.metadata.title}
                      </Link>
                    </td>
                  </tr>
                )),
              ])}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}

function StatBadge({ icon: Icon, label, value, color, to }: {
  icon: any; label: string; value: number; color: string; to?: string
}) {
  const colors: Record<string, string> = {
    purple: 'bg-purple-50 text-purple-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
  }
  const content = (
    <div className={`rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 ${colors[color]} ${to ? 'cursor-pointer hover:opacity-80' : ''}`}>
      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      <div>
        <div className="text-lg sm:text-2xl font-bold">{value}</div>
        <div className="text-xs">{label}</div>
      </div>
    </div>
  )
  return to ? <Link to={to}>{content}</Link> : content
}
