'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Gift, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Star,
  Percent,
  Crown,
  ShoppingBag,
  Check,
  X,
  Calendar,
  Users,
  TrendingUp,
  Award
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../../components/Sidebar'
import CustomSelect from '../../../components/CustomSelect'

interface Reward {
  id: string
  title: string
  description: string
  points_cost: number
  category: 'discount' | 'product' | 'service' | 'premium'
  value: string
  availability: 'available' | 'limited' | 'unavailable'
  stock?: number
  expires_at?: string
  terms: string[]
  created_at: string
  total_redeemed: number
  active: boolean
}

interface RewardRedemption {
  id: string
  client_name: string
  client_email: string
  reward_title: string
  points_used: number
  status: 'pending' | 'approved' | 'used' | 'expired' | 'cancelled'
  redeemed_at: string
  used_at?: string
  expires_at?: string
  notes?: string
}

interface CurrentUser {
  id: string
  name: string
  email: string
  role: string
}

interface RewardsStats {
  total_rewards: number
  active_rewards: number
  total_redemptions: number
  pending_redemptions: number
  points_distributed: number
  most_popular_reward: string
}

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([])
  const [stats, setStats] = useState<RewardsStats | null>(null)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'rewards' | 'redemptions' | 'stats'>('rewards')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<'all' | 'discount' | 'product' | 'service' | 'premium'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'used' | 'expired' | 'cancelled'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    points_cost: 0,
    category: 'discount' as 'discount' | 'product' | 'service' | 'premium',
    value: '',
    stock: '',
    expires_at: '',
    terms: [''],
    active: true
  })
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
      
      fetchRewardsData(token)
    } catch (error) {
      console.error('Token decode error:', error)
      router.push('/login')
    }
  }, [])



  const fetchRewardsData = async (token: string) => {
    try {
      setError('')
      // Buscando dados reais da API
      const [rewardsResponse, redemptionsResponse] = await Promise.all([
        fetch('http://localhost:3001/api/admin/rewards', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:3001/api/admin/rewards/redemptions', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ])

      if (!rewardsResponse.ok || !redemptionsResponse.ok) {
        throw new Error('Erro ao buscar dados das recompensas')
      }

      const rewardsData = await rewardsResponse.json()
      const redemptionsData = await redemptionsResponse.json()
      
      setRewards(rewardsData.rewards || [])
      setRedemptions(redemptionsData.redemptions || [])
      
      // Calcular estatísticas dos dados reais
      const realStats: RewardsStats = {
        total_rewards: rewardsData.rewards?.length || 0,
        active_rewards: rewardsData.rewards?.filter((r: any) => r.active).length || 0,
        total_redemptions: redemptionsData.redemptions?.length || 0,
        pending_redemptions: redemptionsData.redemptions?.filter((r: any) => r.status === 'pending').length || 0,
        points_distributed: redemptionsData.redemptions?.reduce((sum: number, r: any) => sum + r.points_used, 0) || 0,
        most_popular_reward: 'N/A'
      }
      setStats(realStats)
    } catch (error) {
      console.error('Fetch error:', error)
      setError('Erro ao carregar dados das recompensas')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  // Função para excluir recompensa
  const handleDeleteReward = async (rewardId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta recompensa?')) return
    
    setActionLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/rewards/${rewardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Atualizar a lista de recompensas
        setRewards(prev => prev.filter(reward => reward.id !== rewardId))
        setSuccess('Recompensa excluída com sucesso!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const error = await response.text()
        setError(`Erro ao excluir recompensa: ${error}`)
      }
    } catch (error) {
      console.error('Erro ao excluir recompensa:', error)
      setError('Erro ao excluir recompensa')
    } finally {
      setActionLoading(false)
    }
  }

  // Função para aprovar resgate
  const handleApproveRedemption = async (redemptionId: string) => {
    setActionLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/rewards/redemptions/${redemptionId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Atualizar o status do resgate
        setRedemptions(prev => prev.map(redemption => 
          redemption.id === redemptionId 
            ? { ...redemption, status: 'approved' as const }
            : redemption
        ))
        setSuccess('Resgate aprovado com sucesso!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const error = await response.text()
        setError(`Erro ao aprovar resgate: ${error}`)
      }
    } catch (error) {
      console.error('Erro ao aprovar resgate:', error)
      setError('Erro ao aprovar resgate')
    } finally {
      setActionLoading(false)
    }
  }

  // Função para rejeitar resgate
  const handleRejectRedemption = async (redemptionId: string) => {
    if (!confirm('Tem certeza que deseja rejeitar este resgate?')) return
    
    setActionLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/rewards/redemptions/${redemptionId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Atualizar o status do resgate
        setRedemptions(prev => prev.map(redemption => 
          redemption.id === redemptionId 
            ? { ...redemption, status: 'cancelled' as const }
            : redemption
        ))
        setSuccess('Resgate rejeitado com sucesso!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const error = await response.text()
        setError(`Erro ao rejeitar resgate: ${error}`)
      }
    } catch (error) {
      console.error('Erro ao rejeitar resgate:', error)
      setError('Erro ao rejeitar resgate')
    } finally {
      setActionLoading(false)
    }
  }

  // Função para visualizar detalhes do resgate
  const handleViewRedemption = (redemptionId: string) => {
    const redemption = redemptions.find(r => r.id === redemptionId)
    if (redemption) {
      const details = `
Detalhes do Resgate:

Cliente: ${redemption.client_name} (${redemption.client_email})
Recompensa: ${redemption.reward_title}
Pontos Utilizados: ${redemption.points_used}
Status: ${getStatusText(redemption.status)}
Data do Resgate: ${formatDate(redemption.redeemed_at)}
${redemption.used_at ? `Data de Uso: ${formatDate(redemption.used_at)}` : ''}
${redemption.expires_at ? `Expira em: ${formatDate(redemption.expires_at)}` : ''}
${redemption.notes ? `Observações: ${redemption.notes}` : ''}
      `
      alert(details)
    }
  }

  const createReward = async () => {
    try {
      setActionLoading(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch('http://localhost:3001/api/admin/rewards', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...createFormData,
          terms: createFormData.terms.filter(term => term.trim() !== '')
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao criar recompensa')
      }

      const data = await response.json()
      
      // Adicionar a nova recompensa à lista
      setRewards(prev => [...prev, data.reward])
      
      // Fechar modal e limpar formulário
      setShowCreateModal(false)
      setCreateFormData({
        title: '',
        description: '',
        points_cost: 0,
        category: 'discount',
        value: '',
        stock: '',
        expires_at: '',
        terms: [''],
        active: true
      })
      
      setSuccess('Recompensa criada com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Erro ao criar recompensa:', error)
      setError('Erro ao criar recompensa')
      setTimeout(() => setError(''), 3000)
    } finally {
      setActionLoading(false)
    }
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'discount': return <Percent className="w-4 h-4" />
      case 'product': return <ShoppingBag className="w-4 h-4" />
      case 'service': return <Star className="w-4 h-4" />
      case 'premium': return <Crown className="w-4 h-4" />
      default: return <Gift className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/20'
      case 'approved': return 'text-green-400 bg-green-400/20'
      case 'used': return 'text-blue-400 bg-blue-400/20'
      case 'expired': return 'text-red-400 bg-red-400/20'
      case 'cancelled': return 'text-gray-400 bg-gray-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente'
      case 'approved': return 'Aprovado'
      case 'used': return 'Usado'
      case 'expired': return 'Expirado'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
  }

  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reward.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || reward.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const filteredRedemptions = redemptions.filter(redemption => {
    const matchesSearch = redemption.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         redemption.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         redemption.reward_title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || redemption.status === filterStatus
    return matchesSearch && matchesStatus
  })

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
            <h1 className="text-3xl font-bold text-white mb-2">Gerenciar Recompensas</h1>
            <p className="text-white/60">Gerencie recompensas e resgates do sistema</p>
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
                { id: 'rewards', label: 'Recompensas', icon: Gift },
                { id: 'redemptions', label: 'Resgates', icon: Award },
                { id: 'stats', label: 'Estatísticas', icon: TrendingUp }
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Total de Recompensas</h3>
                  <Gift className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-white">{stats.total_rewards}</p>
                <p className="text-white/60 text-sm mt-2">{stats.active_rewards} ativas</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Total de Resgates</h3>
                  <Award className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-3xl font-bold text-white">{stats.total_redemptions}</p>
                <p className="text-white/60 text-sm mt-2">{stats.pending_redemptions} pendentes</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Pontos Distribuídos</h3>
                  <Star className="w-8 h-8 text-yellow-400" />
                </div>
                <p className="text-3xl font-bold text-white">{stats.points_distributed.toLocaleString()}</p>
                <p className="text-white/60 text-sm mt-2">Total acumulado</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 md:col-span-2 lg:col-span-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recompensa Mais Popular</h3>
                  <Crown className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-xl font-bold text-white">{stats.most_popular_reward}</p>
                <p className="text-white/60 text-sm mt-2">Baseado no número de resgates</p>
              </div>
            </motion.div>
          )}

          {/* Rewards Tab */}
          {activeTab === 'rewards' && (
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
                      placeholder="Buscar recompensas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 w-full sm:w-64"
                    />
                  </div>
                  
                  <CustomSelect
                    options={[
                      { value: 'all', label: 'Todas as categorias' },
                      { value: 'discount', label: 'Descontos' },
                      { value: 'product', label: 'Produtos' },
                      { value: 'service', label: 'Serviços' },
                      { value: 'premium', label: 'Premium' }
                    ]}
                    value={filterCategory}
                    onChange={(value) => setFilterCategory(value as any)}
                    placeholder="Selecione a categoria"
                    className="min-w-[180px]"
                  />
                </div>
                
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Recompensa</span>
                </button>
              </div>

              {/* Rewards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRewards.map((reward) => (
                  <div key={reward.id} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          {getCategoryIcon(reward.category)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{reward.title}</h3>
                          <p className="text-white/60 text-sm capitalize">{reward.category}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingReward(reward)}
                          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                          title="Editar recompensa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteReward(reward.id)}
                          disabled={actionLoading}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                          title="Excluir recompensa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-white/80 text-sm mb-4">{reward.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">Custo:</span>
                        <span className="text-yellow-400 font-semibold">{reward.points_cost} pontos</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">Valor:</span>
                        <span className="text-white font-semibold">{reward.value}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">Resgates:</span>
                        <span className="text-white">{reward.total_redeemed}</span>
                      </div>
                      
                      {reward.stock && (
                        <div className="flex items-center justify-between">
                          <span className="text-white/60 text-sm">Estoque:</span>
                          <span className="text-white">{reward.stock}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          reward.active ? 'text-green-400 bg-green-400/20' : 'text-red-400 bg-red-400/20'
                        }`}>
                          {reward.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Redemptions Tab */}
          {activeTab === 'redemptions' && (
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
                      placeholder="Buscar resgates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 w-full sm:w-64"
                    />
                  </div>
                  
                  <CustomSelect
                    options={[
                      { value: 'all', label: 'Todos os status' },
                      { value: 'pending', label: 'Pendente' },
                      { value: 'approved', label: 'Aprovado' },
                      { value: 'used', label: 'Usado' },
                      { value: 'expired', label: 'Expirado' },
                      { value: 'cancelled', label: 'Cancelado' }
                    ]}
                    value={filterStatus}
                    onChange={(value) => setFilterStatus(value as any)}
                    placeholder="Selecione o status"
                    className="min-w-[180px]"
                  />
                </div>
              </div>

              {/* Redemptions Table */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Recompensa</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Pontos</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredRedemptions.map((redemption) => (
                        <tr key={redemption.id} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-white">{redemption.client_name}</div>
                              <div className="text-sm text-white/60">{redemption.client_email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">{redemption.reward_title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-yellow-400 font-semibold">{redemption.points_used}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(redemption.status)}`}>
                              {getStatusText(redemption.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white/80">{formatDate(redemption.redeemed_at)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {redemption.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleApproveRedemption(redemption.id)}
                                    disabled={actionLoading}
                                    className="p-1 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded transition-colors disabled:opacity-50"
                                    title="Aprovar resgate"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleRejectRedemption(redemption.id)}
                                    disabled={actionLoading}
                                    className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                                    title="Rejeitar resgate"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button 
                                onClick={() => handleViewRedemption(redemption.id)}
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

      {/* Modal de Criação de Recompensa */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Criar Nova Recompensa</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Título</label>
                  <input
                    type="text"
                    value={createFormData.title}
                    onChange={(e) => setCreateFormData({...createFormData, title: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="Digite o título da recompensa"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Categoria</label>
                  <CustomSelect
                    options={[
                      { value: 'discount', label: 'Desconto' },
                      { value: 'product', label: 'Produto' },
                      { value: 'service', label: 'Serviço' },
                      { value: 'premium', label: 'Premium' }
                    ]}
                    value={createFormData.category}
                    onChange={(value) => setCreateFormData({...createFormData, category: value as any})}
                    placeholder="Selecione a categoria"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Descrição</label>
                <textarea
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 h-24 resize-none"
                  placeholder="Descreva a recompensa"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Custo em Pontos</label>
                  <input
                    type="number"
                    value={createFormData.points_cost}
                    onChange={(e) => setCreateFormData({...createFormData, points_cost: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Valor</label>
                  <input
                    type="text"
                    value={createFormData.value}
                    onChange={(e) => setCreateFormData({...createFormData, value: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="R$ 50,00"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Estoque (opcional)</label>
                  <input
                    type="number"
                    value={createFormData.stock}
                    onChange={(e) => setCreateFormData({...createFormData, stock: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="Ilimitado"
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Data de Expiração (opcional)</label>
                <input
                  type="date"
                  value={createFormData.expires_at}
                  onChange={(e) => setCreateFormData({...createFormData, expires_at: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Termos e Condições</label>
                {createFormData.terms.map((term, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={term}
                      onChange={(e) => {
                        const newTerms = [...createFormData.terms]
                        newTerms[index] = e.target.value
                        setCreateFormData({...createFormData, terms: newTerms})
                      }}
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                      placeholder={`Termo ${index + 1}`}
                    />
                    {createFormData.terms.length > 1 && (
                      <button
                        onClick={() => {
                          const newTerms = createFormData.terms.filter((_, i) => i !== index)
                          setCreateFormData({...createFormData, terms: newTerms})
                        }}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setCreateFormData({...createFormData, terms: [...createFormData.terms, '']})}
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar termo</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={createFormData.active}
                  onChange={(e) => setCreateFormData({...createFormData, active: e.target.checked})}
                  className="rounded border-white/20 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="active" className="text-white/80 text-sm">Recompensa ativa</label>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                disabled={actionLoading}
              >
                Cancelar
              </button>
              <button
                onClick={createReward}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                disabled={actionLoading || !createFormData.title || !createFormData.description || createFormData.points_cost <= 0}
              >
                {actionLoading ? 'Criando...' : 'Criar Recompensa'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}