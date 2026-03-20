'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, PenTool, Briefcase, BarChart, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const supabase = createClient()

  const navItems = [
    { name: 'Career Pages', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
    { name: 'Global Settings', href: '/dashboard/settings', icon: Settings },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#5138EE] rounded flex items-center justify-center text-white font-bold text-xs">
              C
            </div>
            <span className="font-bold tracking-tight text-gray-900">Whitecarrot</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#5138EE]/10 text-[#5138EE]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#5138EE]' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
