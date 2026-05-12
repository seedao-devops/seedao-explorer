import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Loader2, AlertTriangle, ArrowLeft, Calendar, Tag,
  User, Users, FileText, ExternalLink, Globe, Clock,
} from 'lucide-react'
import { fetchEvent, fetchHealth } from '../api/data'
import type { Event } from '../types'

function tsToDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [lastFetch, setLastFetch] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([fetchEvent(id), fetchHealth()])
      .then(([e, health]) => {
        setEvent(e)
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
  if (!event) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      <span className="ml-2 text-gray-500">加载事件数据...</span>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/events"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回事件列表
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
              {event.metadata.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-400" />
                {tsToDate(event.timestamp)}
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-purple-400" />
                {event.external.platform}
              </span>
              <span>{event.metadata.published_by}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 leading-relaxed">
            {event.metadata.description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {event.metadata.tags.map(t => (
            <span key={t} className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-md text-xs font-medium">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Participants */}
      <Section icon={Users} title="参与者">
        <div className="space-y-3">
          {/* Initiator */}
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <div className="w-9 h-9 rounded-full bg-purple-200 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-purple-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/people/${encodeURIComponent(event.initiator)}`}
                  className="text-sm font-semibold text-purple-700 hover:underline"
                >
                  {event.initiator}
                </Link>
                <span className="px-1.5 py-0.5 bg-purple-200 text-purple-700 rounded text-xs font-medium">
                  发起者
                </span>
              </div>
            </div>
          </div>

          {/* Co-creators */}
          {event.co_creators.map(cc => (
            <div key={cc} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
              <div className="w-9 h-9 rounded-full bg-emerald-200 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/people/${encodeURIComponent(cc)}`}
                    className="text-sm font-semibold text-emerald-700 hover:underline"
                  >
                    {cc}
                  </Link>
                  <span className="px-1.5 py-0.5 bg-emerald-200 text-emerald-700 rounded text-xs font-medium">
                    共创者
                  </span>
                </div>
              </div>
            </div>
          ))}

          {event.participants.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 font-medium mb-2">参与者</div>
              <div className="flex flex-wrap gap-1.5">
                {event.participants.map(p => (
                  <Link
                    key={p}
                    to={`/people/${encodeURIComponent(p)}`}
                    className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded-md text-xs hover:bg-gray-300 transition-colors"
                  >
                    {p}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {event.co_creators.length === 0 && event.participants.length === 0 && (
            <p className="text-sm text-gray-400 italic">仅发起者参与</p>
          )}
        </div>
      </Section>

      {/* Artifacts */}
      {event.artifacts.length > 0 && (
        <Section icon={FileText} title={`产出物 (${event.artifacts.length})`}>
          <div className="space-y-3">
            {event.artifacts.map((a, i) => (
              <a
                key={i}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 group-hover:text-purple-600">
                    {a.title}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {a.type} · {a.format}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-purple-500 shrink-0" />
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* Source */}
      <Section icon={Globe} title="来源">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">平台：</span>
            <span className="text-gray-700 capitalize">{event.external.platform}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">发布方：</span>
            <span className="text-gray-700">{event.metadata.published_by}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">原文：</span>
            <a
              href={event.metadata.source_url || event.external.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline truncate max-w-[200px] sm:max-w-md inline-block"
            >
              {event.metadata.source_url || event.external.original_url}
              <ExternalLink className="w-3 h-3 inline ml-1" />
            </a>
          </div>
        </div>
      </Section>

      {/* Metadata */}
      <Section icon={Tag} title="详情">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <MetaItem label="事件 ID" value={event.id} />
          <MetaItem label="类型" value={event.type} />
          <MetaItem label="时间" value={tsToDate(event.timestamp)} />
        </div>
      </Section>

      {/* Data freshness */}
      {lastFetch && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          数据更新于 {new Date(lastFetch).toLocaleDateString('zh-CN', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}
        </div>
      )}

      {/* Raw */}
      <details className="bg-white rounded-xl border border-gray-200 p-4">
        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
          <FileText className="w-3.5 h-3.5 inline mr-1" />
          原始数据
        </summary>
        <pre className="mt-3 text-xs text-gray-500 overflow-x-auto max-h-64">
          {JSON.stringify(event, null, 2)}
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
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
        <Icon className="w-4 h-4 text-purple-500" />
        {title}
      </h3>
      {children}
    </div>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-gray-700 font-medium truncate">{value}</div>
    </div>
  )
}
