import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  PenTool,
  FileText,
  User,
  Image,
  Sparkles,
  Zap,
  ChevronRight,
} from 'lucide-react'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'from-cyan-500 to-blue-500' },
  { name: 'Generate Post', href: '/generate', icon: PenTool, color: 'from-purple-500 to-pink-500' },
  { name: 'Posts', href: '/posts', icon: FileText, color: 'from-emerald-500 to-cyan-500' },
  { name: 'Context Profiles', href: '/context', icon: User, color: 'from-orange-500 to-amber-500' },
  { name: 'Image Generator', href: '/images', icon: Image, color: 'from-pink-500 to-rose-500' },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen text-white">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-72 z-20">
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-xl border-r border-white/5" />

        {/* Sidebar content */}
        <div className="relative h-full flex flex-col">
          {/* Logo */}
          <div className="h-20 flex items-center px-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center shadow-glow">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-dark-900 animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-display font-bold gradient-text">Brand OS</h1>
                <p className="text-xs text-slate-500">AI Content Engine</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <p className="px-4 mb-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Main Menu
            </p>
            <ul className="space-y-2">
              {navigation.map((item, index) => {
                const isActive = location.pathname === item.href
                return (
                  <li key={item.name} style={{ animationDelay: `${index * 0.1}s` }} className="animate-slide-in-right">
                    <NavLink
                      to={item.href}
                      className={clsx(
                        'group relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300',
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 hover:text-white'
                      )}
                    >
                      {/* Active background */}
                      {isActive && (
                        <div className="absolute inset-0 rounded-xl overflow-hidden">
                          <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-15`} />
                          <div className="absolute inset-0 bg-white/5" />
                          <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${item.color}`} />
                        </div>
                      )}

                      {/* Hover background */}
                      <div className={clsx(
                        'absolute inset-0 rounded-xl bg-white/5 opacity-0 transition-opacity duration-300',
                        !isActive && 'group-hover:opacity-100'
                      )} />

                      {/* Icon */}
                      <div className={clsx(
                        'relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300',
                        isActive
                          ? `bg-gradient-to-br ${item.color} shadow-lg`
                          : 'bg-white/5 group-hover:bg-white/10'
                      )}>
                        <item.icon className={clsx(
                          'w-5 h-5 transition-transform duration-300',
                          'group-hover:scale-110'
                        )} />
                      </div>

                      {/* Label */}
                      <span className="relative flex-1">{item.name}</span>

                      {/* Arrow indicator */}
                      <ChevronRight className={clsx(
                        'relative w-4 h-4 transition-all duration-300',
                        isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'
                      )} />
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Pro Card */}
          <div className="p-4">
            <div className="relative overflow-hidden rounded-2xl p-5">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 via-purple-500/20 to-pink-500/20" />
              <div className="absolute inset-0 bg-dark-900/50 backdrop-blur-sm" />

              {/* Animated border */}
              <div className="absolute inset-0 rounded-2xl border border-white/10" />

              {/* Content */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-semibold text-white">AI Ready</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Generate stunning LinkedIn posts with AI-powered content creation.
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-brand-500 to-purple-500 animate-pulse" />
                  </div>
                  <span className="text-xs text-slate-500">75%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-10 h-20">
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-xl border-b border-white/5" />
          <div className="relative h-full px-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-semibold text-white">
                {navigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
              </h2>
              <p className="text-sm text-slate-500">
                AI-Powered Personal Branding System
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Status indicator */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-emerald-400">System Online</span>
              </div>

              {/* Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center font-bold text-sm">
                  G
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-dark-950" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-8">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
