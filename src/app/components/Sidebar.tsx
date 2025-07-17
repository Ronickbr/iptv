'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home,
  Users, 
  CreditCard, 
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Tv,
  Gift,
  Smartphone,
  Star,
  User,
  UserPlus,
  Layout
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'

interface SidebarProps {
  userRole: 'admin' | 'client'
  userName: string
  onLogout: () => void
}

interface MenuItem {
  icon: React.ReactNode
  label: string
  href: string
  active?: boolean
}

export default function Sidebar({ userRole, userName, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const adminMenuItems: MenuItem[] = [
    {
      icon: <Home className="w-5 h-5" />,
      label: 'Dashboard',
      href: '/dashboard/admin',
      active: pathname === '/dashboard/admin'
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Usuários',
      href: '/dashboard/admin/users',
      active: pathname === '/dashboard/admin/users'
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      label: 'Assinaturas',
      href: '/dashboard/admin/subscriptions',
      active: pathname === '/dashboard/admin/subscriptions'
    },
    {
      icon: <Gift className="w-5 h-5" />,
      label: 'Recompensas',
      href: '/dashboard/admin/rewards',
      active: pathname === '/dashboard/admin/rewards'
    },
    {
      icon: <UserPlus className="w-5 h-5" />,
      label: 'Indicações',
      href: '/dashboard/admin/referrals',
      active: pathname === '/dashboard/admin/referrals'
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Relatórios',
      href: '/dashboard/admin/reports',
      active: pathname === '/dashboard/admin/reports'
    },
    {
      icon: <Layout className="w-5 h-5" />,
      label: 'Landing Page',
      href: '/dashboard/admin/landing-page',
      active: pathname === '/dashboard/admin/landing-page'
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Configurações',
      href: '/dashboard/admin/settings',
      active: pathname === '/dashboard/admin/settings'
    }
  ]

  const clientMenuItems: MenuItem[] = [
    {
      icon: <Home className="w-5 h-5" />,
      label: 'Dashboard',
      href: '/dashboard/client',
      active: pathname === '/dashboard/client'
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: 'Pontos',
      href: '/dashboard/client/points',
      active: pathname === '/dashboard/client/points'
    },
    {
      icon: <Gift className="w-5 h-5" />,
      label: 'Recompensas',
      href: '/dashboard/client/rewards',
      active: pathname === '/dashboard/client/rewards'
    },
    {
      icon: <UserPlus className="w-5 h-5" />,
      label: 'Indicações',
      href: '/dashboard/client/referrals',
      active: pathname === '/dashboard/client/referrals'
    },
    {
      icon: <User className="w-5 h-5" />,
      label: 'Perfil',
      href: '/dashboard/client/profile',
      active: pathname === '/dashboard/client/profile'
    }
  ]

  const menuItems = userRole === 'admin' ? adminMenuItems : clientMenuItems

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-white/20 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isDesktop ? 0 : (isOpen ? 0 : '-100%')
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`
          fixed top-0 left-0 h-full w-64 bg-black/20 backdrop-blur-sm border-r border-white/10 z-40
          lg:relative lg:translate-x-0 lg:z-auto
          flex flex-col
        `}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col items-center space-y-3">
            <Image
              src="https://i.imgur.com/E08eWYX.png"
              alt="Logo"
              width={120}
              height={40}
              style={{ borderRadius: '6px' }}
            />
            <p className="text-white/60 text-sm capitalize">{userRole}</p>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{userName || 'Usuário'}</p>
              <p className="text-white/60 text-xs">Online</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={closeSidebar}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                ${
                  item.active
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => {
              onLogout()
              closeSidebar()
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </motion.aside>
    </>
  )
}