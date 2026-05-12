import { NavLink, Outlet } from 'react-router-dom'
import { Home, Users, Calendar, GitGraph } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: '总览' },
  { to: '/people', icon: Users, label: '人物' },
  { to: '/events', icon: Calendar, label: '事件' },
  { to: '/graph', icon: GitGraph, label: '关系图' },
]

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-base sm:text-lg text-purple-700 tracking-tight truncate">
            SeeDAO Wiki
          </span>
          <nav className="flex gap-0.5 sm:gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                <Icon className="w-4 h-4 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        Data from seedao-devops/seedao-wiki · GitHub
      </footer>
    </div>
  )
}
