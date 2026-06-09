'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  UserPlus, 
  Users,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Calendar,
  TrendingUp,
  Award,
  Star,
  DollarSign,
  Gift,
  Clock,
  Target,
  Crown
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../../components/Sidebar'
import CustomSelect from '../../../components/CustomSelect'

interface Referral {
  id: string
  referrer_name: string
  referrer_email: string
  referred_name: string
  referred_email: string
  status: 'pending' | 'completed' | 'cancelled'
  reward_points: number
  reward_given: boolean
  created_at: string
  completed_at?: string
  subscription_plan?: string
}

interface ReferralStats {
  total_referrals: number
  completed_referrals: number
  pending_referrals: number
  cancelled_referrals: number
  total_points_awarded: number
  conversion_rate: number
  top_referrer: {
    name: string
    referrals: number
    points: number
  }
  monthly_growth: number
}

interface CurrentUser {
  id: string
  name: string
  email: string
  role: string
}

interface TopReferrer {
  id: string
  name: string
  email: string
  total_referrals: number
  completed_referrals: number
  total_points: number
  conversion_rate: number
  last_referral: string
}

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([])
  const [actionLoading, setActionLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'referrals' | 'stats' | 'top-referrers'>('referrals')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
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
      if (payload.role !== 'admin') {
        router.push('/dashboard/client')
        return
      }
      
      setCurrentUser({
        id: payload.userId,
        name: payload.name,
        email: payload.email,
        role: payload.role
      })
      
      fetchReferralsData(token)
    } catch (error) {
      console.error('Token decode error:', error)
      router.push('/login')
    }
  }, [])



  const fetchReferralsData = async (token: string) => {
    try {
      setError('')
      // Dados reais da API
       const [referralsRes, statsRes, topReferrersRes] = await Promise.all([
         fetch('http://localhost:3001/api/admin/referrals', {
           headers: { Authorization: `Bearer ${token}` }
         }),
         fetch('http://localhost:3001/api/admin/referrals/stats', {
           headers: { Authorization: `Bearer ${token}` }
         }),
         fetch('http://localhost:3001/api/admin/referrals/top-referrers', {
           headers: { Authorization: `Bearer ${token}` }
         })
      ])

      if (!referralsRes.ok || !statsRes.ok || !topReferrersRes.ok) {
        throw new Error('Erro ao buscar dados')
      }

      const [referralsData, statsData, topReferrersData] = await Promise.all([
        referralsRes.json(),
        statsRes.json(),
        topReferrersRes.json()
      ])

      setReferrals(referralsData.referrals || [])
      setStats(statsData)
      setTopReferrers(topReferrersData)
      setLoading(false)
    } catch (error) {
      console.error('Fetch error:', error)
      setError('Erro ao carregar dados das indicações')
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Função para aprovar indicação
  const handleApproveReferral = async (referralId: string) => {
    if (!confirm('Tem certeza que deseja aprovar esta indicação?')) return
    
    setActionLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/admin/referrals/${referralId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Atualizar a lista de indicações
        const token = localStorage.getItem('token')
        if (token) await fetchReferralsData(token)
        setSuccess('Indicação aprovada com sucesso!')
      } else {
        const error = await response.text()
        alert(`Erro ao aprovar indicação: ${error}`)
      }
    } catch (error) {
      console.error('Erro ao aprovar indicação:', error)
      alert('Erro ao aprovar indicação')
    } finally {
      setActionLoading(false)
    }
  }

  // Função para cancelar indicação
  const handleCancelReferral = async (referralId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta indicação?')) return
    
    setActionLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/admin/referrals/${referralId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Atualizar a lista de indicações
        const token = localStorage.getItem('token')
        if (token) await fetchReferralsData(token)
        setSuccess('Indicação cancelada com sucesso!')
      } else {
        const error = await response.text()
        alert(`Erro ao cancelar indicação: ${error}`)
      }
    } catch (error) {
      console.error('Erro ao cancelar indicação:', error)
      alert('Erro ao cancelar indicação')
    } finally {
      setActionLoading(false)
    }
  }

  // Função para visualizar detalhes da indicação
  const handleViewReferral = (referralId: string) => {
    // Encontrar a indicação específica
    const referral = Array.isArray(referrals) ? referrals.find(r => r.id === referralId) : null
    if (referral) {
      const details = `
Detalhes da Indicação:

Indicador: ${referral.referrer_name} (${referral.referrer_email})
Indicado: ${referral.referred_name} (${referral.referred_email})
Status: ${getStatusText(referral.status)}
Pontos: ${referral.reward_points}
Data de Criação: ${formatDate(referral.created_at)}
${referral.completed_at ? `Data de Conclusão: ${formatDate(referral.completed_at)}` : ''}
Plano: ${referral.subscription_plan || 'Não definido'}
Recompensa Concedida: ${referral.reward_given ? 'Sim' : 'Não'}
      `
      alert(details)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/20'
      case 'completed': return 'text-green-400 bg-green-400/20'
      case 'cancelled': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente'
      case 'completed': return 'Concluída'
      case 'cancelled': return 'Cancelada'
      default: return status
    }
  }

  const filteredReferrals = Array.isArray(referrals) ? referrals.filter(referral => {
    const matchesSearch = referral.referrer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         referral.referrer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         referral.referred_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         referral.referred_email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || referral.status === filterStatus
    return matchesSearch && matchesStatus
  }) : []

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex">
      <Sidebar 
        userRole="admin" 
        userName={currentUser?.name || ''} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Gerenciar Indicações</h1>
                <p className="text-white/60">Acompanhe e gerencie o programa de indicações</p>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
              {success}
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
              {[
                { id: 'referrals', label: 'Indicações', icon: UserPlus },
                { id: 'stats', label: 'Estatísticas', icon: TrendingUp },
                { id: 'top-referrers', label: 'Top Indicadores', icon: Crown }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-md transition-all
                      ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Stats Tab */}
          {activeTab === 'stats' && stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Total de Indicações</h3>
                    <UserPlus className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.total_referrals}</p>
                  <p className="text-white/60 text-sm mt-2">Todas as indicações</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Concluídas</h3>
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.completed_referrals}</p>
                  <p className="text-white/60 text-sm mt-2">{stats.pending_referrals} pendentes</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Taxa de Conversão</h3>
                    <Target className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.conversion_rate}%</p>
                  <p className="text-white/60 text-sm mt-2">Indicações convertidas</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Pontos Distribuídos</h3>
                    <Star className="w-8 h-8 text-yellow-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.total_points_awarded.toLocaleString()}</p>
                  <p className="text-white/60 text-sm mt-2">Total de recompensas</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Top Indicador</h3>
                    <Crown className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-white">{stats.top_referrer.name}</p>
                    <p className="text-white/60">{stats.top_referrer.referrals} indicações</p>
                    <p className="text-yellow-400 font-semibold">{stats.top_referrer.points} pontos ganhos</p>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Crescimento Mensal</h3>
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-white">+{stats.monthly_growth}%</p>
                    <p className="text-white/60">Comparado ao mês anterior</p>
                    <p className="text-green-400 text-sm">Tendência positiva</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Top Referrers Tab */}
          {activeTab === 'top-referrers' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-xl font-semibold text-white">Melhores Indicadores</h3>
                  <p className="text-white/60 mt-1">Usuários com mais indicações bem-sucedidas</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Posição</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Indicador</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Concluídas</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Taxa</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Pontos</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Última</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {topReferrers.map((referrer, index) => (
                        <tr key={referrer.id} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {index === 0 && <Crown className="w-5 h-5 text-yellow-400 mr-2" />}
                              {index === 1 && <Award className="w-5 h-5 text-gray-400 mr-2" />}
                              {index === 2 && <Award className="w-5 h-5 text-orange-400 mr-2" />}
                              <span className="text-white font-semibold">#{index + 1}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-white">{referrer.name}</div>
                              <div className="text-sm text-white/60">{referrer.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">{referrer.total_referrals}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-green-400">{referrer.completed_referrals}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">{referrer.conversion_rate}%</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-yellow-400 font-semibold">{referrer.total_points}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white/80">{formatDate(referrer.last_referral)}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Referrals Tab */}
          {activeTab === 'referrals' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar indicações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 w-full sm:w-64"
                    />
                  </div>
                  
                  <CustomSelect
                    options={[
                      { value: 'all', label: 'Todos os status' },
                      { value: 'pending', label: 'Pendente' },
                      { value: 'completed', label: 'Concluída' },
                      { value: 'cancelled', label: 'Cancelada' }
                    ]}
                    value={filterStatus}
                    onChange={(value) => setFilterStatus(value as any)}
                    placeholder="Selecione o status"
                    className="min-w-[180px]"
                  />
                  
                  <CustomSelect
                    options={[
                      { value: 'all', label: 'Todos os períodos' },
                      { value: 'today', label: 'Hoje' },
                      { value: 'week', label: 'Esta semana' },
                      { value: 'month', label: 'Este mês' }
                    ]}
                    value={dateFilter}
                    onChange={(value) => setDateFilter(value as any)}
                    placeholder="Selecione o período"
                    className="min-w-[180px]"
                  />
                </div>
              </div>

              {/* Referrals Table */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Indicador</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Indicado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Pontos</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Plano</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredReferrals.map((referral) => (
                        <tr key={referral.id} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-white">{referral.referrer_name}</div>
                              <div className="text-sm text-white/60">{referral.referrer_email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-white">{referral.referred_name}</div>
                              <div className="text-sm text-white/60">{referral.referred_email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(referral.status)}`}>
                              {getStatusText(referral.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-yellow-400 font-semibold">{referral.reward_points}</span>
                              {referral.reward_given && <Check className="w-4 h-4 text-green-400" />}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white/80">{formatDate(referral.created_at)}</div>
                            {referral.completed_at && (
                              <div className="text-xs text-green-400">Concluída: {formatDate(referral.completed_at)}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">{referral.subscription_plan || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {referral.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleApproveReferral(referral.id)}
                                    disabled={actionLoading}
                                    className="p-1 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded transition-colors disabled:opacity-50"
                                    title="Aprovar indicação"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleCancelReferral(referral.id)}
                                    disabled={actionLoading}
                                    className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                                    title="Cancelar indicação"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button 
                                onClick={() => handleViewReferral(referral.id)}
                                className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                                title="Visualizar detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}