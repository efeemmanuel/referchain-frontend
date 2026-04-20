import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserPlus, FileText,
  LogOut, Menu, Activity, ChevronRight, UserCircle, Building2,
} from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import { cn } from '../../lib/utils'
import api from '../../lib/api'
import toast from 'react-hot-toast'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles: ('hospital_admin' | 'doctor')[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, roles: ['hospital_admin', 'doctor'] },
  { label: 'Doctors', href: '/doctors', icon: <UserPlus className="w-4 h-4" />, roles: ['hospital_admin'] },
  { label: 'Patients', href: '/patients', icon: <Users className="w-4 h-4" />, roles: ['hospital_admin', 'doctor'] },
  { label: 'Referrals', href: '/referrals', icon: <FileText className="w-4 h-4" />, roles: ['hospital_admin', 'doctor'] },
  { label: 'Profile', href: '/profile', icon: <UserCircle className="w-4 h-4" />, roles: ['hospital_admin', 'doctor'] },
]

interface DashboardLayoutProps { children: React.ReactNode }

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, hospital, setHospital, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  // fetch hospital name if admin and not already loaded
  useEffect(() => {
    if (user?.role === 'hospital_admin' && !hospital) {
      api.get('/hospitals/me/').then((res) => setHospital(res.data)).catch(() => {})
    }
  }, [user])

  const filteredNav = navItems.filter((item) => user && item.roles.includes(user.role))

  function handleLogout() {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn('flex flex-col h-full bg-white border-r border-slate-100', mobile ? 'w-full' : 'w-64')}>
      {/* Logo + hospital name */}
      <div className="p-6 border-b border-slate-50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-display text-lg text-slate-900 leading-none">ReferChain</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {user?.role === 'hospital_admin' ? 'Admin Portal' : 'Doctor Portal'}
            </p>
          </div>
        </div>
        {/* Hospital name pill */}
        {hospital && (
          <div className="flex items-center gap-2 bg-brand-50 rounded-xl px-3 py-2">
            <Building2 className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
            <p className="text-xs font-medium text-brand-700 truncate">{hospital.name}</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredNav.map((item) => {
          const active = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
          return (
            <Link key={item.href} to={item.href}
              onClick={() => mobile && setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                active ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}>
              {item.icon}
              {item.label}
              {active && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div className="p-4 border-t border-slate-50">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-brand-700 text-xs font-medium">{user?.email?.[0]?.toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-700 truncate">{user?.email}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200">
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="hidden lg:flex lg:flex-shrink-0"><Sidebar /></aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 animate-slide-in-right"><Sidebar mobile /></div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-display text-lg text-slate-900">ReferChain</span>
              {hospital && <p className="text-xs text-slate-400 leading-none">{hospital.name}</p>}
            </div>
          </div>
          <button onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600">
            <Menu className="w-4 h-4" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
