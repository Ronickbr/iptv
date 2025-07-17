'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Tv, 
  Calendar, 
  Star, 
  Users,
  Settings,
  CreditCard,
  Gift,
  Smartphone,
  Clock
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../components/Sidebar'

interface Subscription {
  id: string
  plan_name: string
  status: string
  start_date: string
  end_date: string
  max_devices: number
}

interface ClientStats {
  subscription: Subscription | null
  totalPoints: number
  totalReferrals: number
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function ClientDashboard() {
  const [stats, setStats] = useState<ClientStats | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Decode token to get user info
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.role !== 'client') {
        router.push('/dashboard/admin')
        return
      }
      setUser({
        id: payload.userId,
        name: payload.name || 'Cliente',
        email: payload.email,
        role: payload.role
      })
    } catch (err) {
      router.push('/login')
      return
    }

    fetchStats(token)
  }, [])

  const fetchStats = async (token: string) => {
    try {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas')
      }

      const data = await response.json()
      setStats(data.stats)
    } catch (err) {
      setError('Erro ao carregar dados do dashboard')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Erro</h2>
          <p>{error}</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex">
      {/* Sidebar */}
      <Sidebar 
        userRole="client" 
        userName={user?.name || 'Cliente'} 
        onLogout={handleLogout} 
      />

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Meu Dashboard</h1>
          <p className="text-white/60">Gerencie sua assinatura e acompanhe suas atividades</p>
        </div>
        {/* Subscription Status */}
        {stats?.subscription ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Minha Assinatura</h2>
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 text-sm font-medium">Ativa</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-white/60 text-sm">Plano</p>
                <p className="text-white font-semibold text-lg">{stats.subscription.plan_name}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Dispositivos</p>
                <p className="text-white font-semibold text-lg">{stats.subscription.max_devices} dispositivos</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Vencimento</p>
                <p className="text-white font-semibold text-lg">{formatDate(stats.subscription.end_date)}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Dias Restantes</p>
                <p className="text-white font-semibold text-lg">{getDaysRemaining(stats.subscription.end_date)} dias</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8"
          >
            <div className="text-center">
              <Tv className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Nenhuma Assinatura Ativa</h2>
              <p className="text-white/60 mb-4">Você não possui uma assinatura ativa no momento.</p>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Ver Planos Disponíveis
              </button>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Pontos Acumulados</p>
                <p className="text-3xl font-bold text-white">{stats?.totalPoints || 0}</p>
                <p className="text-white/60 text-sm mt-1">Use para resgatar recompensas</p>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Indicações Feitas</p>
                <p className="text-3xl font-bold text-white">{stats?.totalReferrals || 0}</p>
                <p className="text-white/60 text-sm mt-1">Ganhe pontos indicando amigos</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center space-x-3 p-4 bg-blue-600/20 rounded-lg hover:bg-blue-600/30 transition-colors text-white">
              <Tv className="w-6 h-6" />
              <span>Assistir Agora</span>
            </button>
            <button className="flex items-center space-x-3 p-4 bg-green-600/20 rounded-lg hover:bg-green-600/30 transition-colors text-white">
              <Smartphone className="w-6 h-6" />
              <span>Gerenciar Dispositivos</span>
            </button>
            <button className="flex items-center space-x-3 p-4 bg-purple-600/20 rounded-lg hover:bg-purple-600/30 transition-colors text-white">
              <Gift className="w-6 h-6" />
              <span>Resgatar Pontos</span>
            </button>
            <button className="flex items-center space-x-3 p-4 bg-gray-600/20 rounded-lg hover:bg-gray-600/30 transition-colors text-white">
              <Settings className="w-6 h-6" />
              <span>Configurações</span>
            </button>
          </div>
        </motion.div>

        {/* Payment History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
        >
          <h2 className="text-xl font-bold text-white mb-6">Histórico de Pagamentos</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CreditCard className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Pagamento aprovado</p>
                  <p className="text-white/60 text-sm">Plano Premium - R$ 49,90</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">15/12/2024</p>
                <p className="text-green-400 text-sm">Aprovado</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Renovação automática</p>
                  <p className="text-white/60 text-sm">Próximo pagamento em 15/01/2025</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">15/01/2025</p>
                <p className="text-blue-400 text-sm">Agendado</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}