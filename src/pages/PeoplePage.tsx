import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Loader2, AlertTriangle, Search, User, ArrowRight, Users } from 'lucide-react'
import { fetchAllPeople } from '../api/data'
import type { Person } from '../types'

function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      <span className="ml-2 text-gray-500">加载人物数据...</span>
    </div>
  )
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const highlight = searchParams.get('highlight')

  useEffect(() => {
    fetchAllPeople()
      .then(results => setPeople(results.map(r => r.data as Person)))
      .catch(e => setError(e.message))
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return people
    const q = search.toLowerCase()
    return people.filter(p =>
      p.id.toLowerCase().includes(q)
    )
  }, [people, search])

  if (error) return (
    <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-4">
      <AlertTriangle className="w-5 h-5" />
      <span>{error}</span>
    </div>
  )
  if (!people.length) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-500" />
          人物
          <span className="text-sm font-normal text-gray-400">({people.length})</span>
        </h2>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="搜索人物 ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(person => (
          <Link
            key={person.id}
            to={`/people/${encodeURIComponent(person.id)}`}
            className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow block ${
              highlight === person.id ? 'ring-2 ring-purple-400 border-purple-400' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{person.id}</div>
                <div className="text-xs text-gray-500">SeeDAO 成员</div>
              </div>
            </div>

            {/* Event refs */}
            {person.event_refs.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs text-gray-400 font-medium">参与事件</div>
                {person.event_refs.map(ref => (
                  <div key={ref.event_id} className="text-xs text-gray-600 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 text-purple-400" />
                    <span className="text-purple-600 font-medium">
                      {ref.role === 'initiator' ? '发起者' : '共创者'}
                    </span>
                    <span>·</span>
                    <Link
                      to={`/events?highlight=${encodeURIComponent(ref.event_id)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-500 hover:text-purple-600 truncate max-w-[120px] sm:max-w-[180px]"
                    >
                      {ref.event_id}
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {person.event_refs.length === 0 && (
              <div className="text-xs text-gray-400 italic">暂无参与事件</div>
            )}

            {/* Skills / Interests if present */}
            {person.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {person.skills.map(s => (
                  <span key={s} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">{s}</span>
                ))}
              </div>
            )}
            {person.interests.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {person.interests.map(i => (
                  <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs">{i}</span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-10">未找到匹配结果</p>
      )}
    </div>
  )
}
