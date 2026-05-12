import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Loader2, AlertTriangle, ArrowLeft, User, ExternalLink,
  Calendar, Sparkles, Heart, Link2, FileText, Clock,
} from 'lucide-react'
import { fetchPerson, fetchAllEvents, fetchHealth } from '../api/data'
import type { Person, Event } from '../types'

function tsToDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

function tsToDateTime(ts: number | string) {
  const d = typeof ts === 'string' ? new Date(ts) : new Date(ts * 1000)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function PersonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [person, setPerson] = useState<Person | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [lastFetch, setLastFetch] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetchPerson(id),
      fetchAllEvents(),
      fetchHealth(),
    ])
      .then(([p, eList, health]) => {
        setPerson(p)
        setEvents(eList.map(r => r.data as Event))
        setLastFetch(health?.lastFetch ?? null)
      })
      .catch(e => setError(e.message))
  }, [id])

  if (error) return (
    <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-4">
      <AlertTriangle className="w-5 h-5" />
      <span>{error}</span>
    </div>
  )
  if (!person) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      <span className="ml-2 text-gray-500">加载成员数据...</span>
    </div>
  )

  // event_refs come pre-enriched with event_title from the server
  const refs = person.event_refs ?? []

  const hasProfile = person.profile && Object.keys(person.profile).length > 0
  const hasLinks = person.links && Object.keys(person.links).length > 0
  const hasSkills = person.skills && person.skills.length > 0
  const hasInterests = person.interests && person.interests.length > 0

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/people"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回人物列表
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-5">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shrink-0">
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{person.id}</h1>
            <p className="text-sm text-gray-500 mt-1">SeeDAO 成员</p>

            {/* Profile fields */}
            {hasProfile && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                {Object.entries(person.profile).map(([key, val]) => (
                  <div key={key} className="text-sm">
                    <span className="text-gray-400 capitalize">{key}：</span>
                    <span className="text-gray-700">{String(val)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Skills & Interests */}
        <div className="space-y-6">
          {hasSkills && (
            <Section icon={Sparkles} title="技能">
              <div className="flex flex-wrap gap-2">
                {person.skills.map(s => (
                  <span key={s} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm">
                    {s}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {hasInterests && (
            <Section icon={Heart} title="兴趣">
              <div className="flex flex-wrap gap-2">
                {person.interests.map(i => (
                  <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
                    {i}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Empty state for profile */}
          {!hasSkills && !hasInterests && !hasProfile && (
            <Section icon={User} title="个人资料">
              <p className="text-sm text-gray-400 italic">暂无详细资料</p>
            </Section>
          )}
        </div>

        {/* Links */}
        <div className="space-y-6">
          {hasLinks && (
            <Section icon={Link2} title="链接">
              <div className="space-y-2">
                {Object.entries(person.links).map(([key, url]) => (
                  <a
                    key={key}
                    href={String(url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="text-gray-500 capitalize">{key}</span>
                    <span className="text-gray-400 truncate">{String(url)}</span>
                  </a>
                ))}
              </div>
            </Section>
          )}

          {/* Info tip */}
          {!hasLinks && !hasSkills && !hasInterests && (
            <Section icon={User} title="提示">
              <p className="text-sm text-gray-400 italic">
                该成员尚未填写个人资料、技能、兴趣或链接信息。数据源来自 GitHub，信息将随社区贡献逐步完善。
              </p>
            </Section>
          )}
        </div>
      </div>

      {/* Event History */}
      <Section icon={Calendar} title={`参与事件 (${refs.length})`}>
        {refs.length > 0 ? (
          <div className="space-y-2">
            {refs.map(ref => {
              const evt = events.find(e => e.id === ref.event_id)
              return (
                <div
                  key={ref.event_id}
                  className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        ref.role === 'initiator'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {ref.role === 'initiator' ? '发起者' : '共创者'}
                      </span>
                      <Link
                        to={`/events?highlight=${encodeURIComponent(ref.event_id)}`}
                        className="text-sm font-medium text-gray-900 hover:text-purple-600 truncate"
                      >
                        {evt?.metadata?.title ?? ref.event_id}
                      </Link>
                    </div>
                    {evt && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{evt.metadata.description}</p>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {tsToDate(ref.timestamp)}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">暂无参与事件记录</p>
        )}
      </Section>

      {/* Data freshness */}
      {lastFetch && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          数据更新于 {tsToDateTime(lastFetch)}
        </div>
      )}

      {/* Raw data reference */}
      <details className="bg-white rounded-xl border border-gray-200 p-4">
        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
          <FileText className="w-3.5 h-3.5 inline mr-1" />
          原始数据
        </summary>
        <pre className="mt-3 text-xs text-gray-500 overflow-x-auto max-h-64">
          {JSON.stringify(person, null, 2)}
        </pre>
      </details>
    </div>
  )
}

function Section({ icon: Icon, title, children }: {
  icon: any; title: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
        <Icon className="w-4 h-4 text-purple-500" />
        {title}
      </h3>
      {children}
    </div>
  )
}
