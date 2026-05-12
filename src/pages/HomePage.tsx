import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Globe, Tag, Users, Calendar, Gem, Landmark, ChevronRight,
  Loader2, AlertTriangle, Clock,
} from 'lucide-react'
import { fetchCommunity, fetchState, fetchHealth } from '../api/data'
import type { Community, CommunityState } from '../types'

function tsToDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      <span className="ml-2 text-gray-500">加载中...</span>
    </div>
  )
}

function ErrorBlock({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-4">
      <AlertTriangle className="w-5 h-5" />
      <span>{msg}</span>
    </div>
  )
}

export default function HomePage() {
  const [community, setCommunity] = useState<Community | null>(null)
  const [state, setState] = useState<CommunityState | null>(null)
  const [lastFetch, setLastFetch] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([fetchCommunity(), fetchState(), fetchHealth()])
      .then(([c, s, h]) => { setCommunity(c); setState(s); setLastFetch(h?.lastFetch ?? null) })
      .catch(e => setError(e.message))
  }, [])

  if (error) return <ErrorBlock msg={error} />
  if (!community) return <Loading />

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-purple-900 mb-3">{community.name}</h1>
        <p className="text-gray-700 leading-relaxed max-w-2xl">{community.manifesto}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {community.values.map(v => (
            <span key={v} className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm font-medium">
              {v}
            </span>
          ))}
        </div>
      </section>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Users} label="人物" value={community.people_count} to="/people" />
        <StatCard icon={Calendar} label="事件" value={community.event_count} to="/events" />
        <StatCard icon={Gem} label="核心项目" value={community.key_projects.length} />
        <StatCard icon={Landmark} label="治理模式" value={community.governance.model} />
      </div>

      {/* Key Projects + Tags */}
      <div className="grid md:grid-cols-2 gap-6">
        <SectionCard icon={Gem} title="核心项目">
          <ul className="space-y-2">
            {community.key_projects.map(p => (
              <li key={p} className="flex items-center gap-2 text-sm text-gray-700">
                <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                {p}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard icon={Tag} title="标签">
          <div className="flex flex-wrap gap-2">
            {community.tags.map(t => (
              <span key={t} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                {t}
              </span>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Governance */}
      <SectionCard icon={Landmark} title={`治理 — ${community.governance.model}`}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">核心组件</h4>
            <ul className="space-y-1">
              {community.governance.key_components.map(c => (
                <li key={c} className="text-sm text-gray-700">{c}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">治理原则</h4>
            <ul className="space-y-1">
              {community.governance.principles.map(p => (
                <li key={p} className="text-sm text-gray-700">{p}</li>
              ))}
            </ul>
          </div>
        </div>
      </SectionCard>

      {/* Treasury */}
      <SectionCard icon={Landmark} title="金库">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold text-gray-900">
            {community.treasury.balance.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500">{community.treasury.currency}</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">{community.treasury.policy}</p>
      </SectionCard>

      {/* Founders */}
      <SectionCard icon={Users} title="发起人">
        <div className="flex flex-wrap gap-3">
          {community.founders.map(f => (
            <Link
              key={f}
              to={`/people?highlight=${encodeURIComponent(f)}`}
              className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
            >
              {f}
            </Link>
          ))}
        </div>
      </SectionCard>

      {/* State metrics */}
      {state && (
        <SectionCard icon={Globe} title="社区状态指标">
          <div className="grid grid-cols-3 gap-4 text-center">
            <MetricBadge label="共在" value={state.co_presence} color="purple" />
            <MetricBadge label="涌现" value={state.emergence} color="emerald" />
            <MetricBadge label="逍遥" value={state.xiaoyao} color="amber" />
          </div>
        </SectionCard>
      )}

      {/* Meta */}
      <div className="text-xs text-gray-400 flex flex-col sm:flex-row sm:justify-between gap-1">
        <span>社区创建于 {tsToDate(community.created_at)}</span>
        <span>社区更新于 {tsToDate(community.updated_at)}</span>
        {lastFetch && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            数据刷新于 {new Date(lastFetch).toLocaleDateString('zh-CN', { month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}
          </span>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, to }: {
  icon: any; label: string; value: string | number; to?: string
}) {
  const content = (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
        <Icon className="w-5 h-5 text-purple-600" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  )
  return to ? <Link to={to}>{content}</Link> : content
}

function SectionCard({ icon: Icon, title, children }: {
  icon: any; title: string; children: React.ReactNode
}) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
        <Icon className="w-4 h-4 text-purple-500" />
        {title}
      </h3>
      {children}
    </section>
  )
}

function MetricBadge({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    purple: 'bg-purple-50 text-purple-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
  }
  return (
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <div className="text-2xl font-bold">{value.toFixed(2)}</div>
      <div className="text-sm mt-1">{label}</div>
    </div>
  )
}
