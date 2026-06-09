'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Gift, 
  Star, 
  Percent,
  Calendar,
  Clock,
  Check,
  X,
  Coins,
  Crown,
  Zap,
  Heart,
  Trophy,
  Target,
  ShoppingBag,
  CreditCard,
  Smartphone,
  Tv,
  Headphones,
  AlertTriangle,
  ExternalLink
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../../components/Sidebar'

interface Reward {
  id: string
  title: string
  description: string
  points_cost: number
  category: 'discount' | 'product' | 'service' | 'premium'
  icon: any
  color: string
  value: string
  availability: 'available' | 'limited' | 'unavailable'
  stock?: number
  expires_at?: string
  terms: string[]
}

interface RedeemedReward {
  id: string
  reward_title: string
  points_spent: number
  redeemed_at: string
  status: 'active' | 'used' | 'expired'
  code?: string
  expires_at?: string
}

interface CurrentUser {
  id: string
  name: string
  email: string
  role: string
}

interface UserPoints {
  current_points: number
  level: string
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [redeemedRewards, setRedeemedRewards] = useState<RedeemedReward[]>([])
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'discount' | 'product' | 'service' | 'premium'>('all')
  const [activeTab, setActiveTab] = useState<'available' | 'redeemed'>('available')
  const [showRedeemModal, setShowRedeemModal] = useState<Reward | null>(null)
  const router = useRouter()

  const categories = [
    { id: 'all', label: 'Todas', icon: Gift },
    { id: 'discount', label: 'Descontos', icon: Percent },
    { id: 'product', label: 'Produtos', icon: ShoppingBag },
    { id: 'service', label: 'Serviços', icon: Star },
    { id: 'premium', label: 'Premium', icon: Crown }
  ]

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (!token || !user) {
      router.push('/login')
      return
    }
    
    try {
      setCurrentUser(JSON.parse(user))
      fetchRewardsData(token)
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/login')
    }
  }, [])

  const fetchRewardsData = async (token: string) => {
    try {
      const [rewardsResponse, redeemedResponse, pointsResponse] = await Promise.all([
        fetch('http://localhost:3001/api/client/rewards', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/client/rewards/redeemed', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/client/points', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      // Check for authentication errors
      if (rewardsResponse.status === 401 || rewardsResponse.status === 403) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
        return
      }

      // Check individual responses and handle gracefully
      let rewardsData = { rewards: [] }
      let redeemedData = { redeemed_rewards: [] }
      let pointsData = { user_points: { current_points: 0, level: { name: 'Inicial' } } }

      if (rewardsResponse.ok) {
        rewardsData = await rewardsResponse.json()
      } else {
        console.warn('Failed to fetch rewards:', rewardsResponse.status)
      }
      
      if (redeemedResponse.ok) {
        redeemedData = await redeemedResponse.json()
      } else {
        console.warn('Failed to fetch redeemed rewards:', redeemedResponse.status)
      }
      
      if (pointsResponse.ok) {
        pointsData = await pointsResponse.json()
      } else {
        console.warn('Failed to fetch points:', pointsResponse.status)
      }

      const processedRewards = (rewardsData.rewards || []).map((reward: any) => ({
        ...reward,
        title: reward.name || reward.title,
        points_cost: reward.points_required || reward.points_cost,
        category: reward.category || 'product',
        availability: 'available',
        terms: reward.terms ? reward.terms.split(',') : [],
        icon: getRewardIcon(reward.category || 'product'),
        color: getRewardColor(reward.category || 'product')
      }))

      setRewards(processedRewards)
      setRedeemedRewards(redeemedData.redeemed_rewards || [])
      setUserPoints({
        current_points: pointsData.user_points?.current_points || 0,
        level: pointsData.user_points?.level?.name || 'Inicial'
      })
    } catch (err: any) {
      console.error('Error fetching rewards data:', err)
      // Don't redirect on network errors, just show error message
      setError('Erro ao carregar dados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const getRewardIcon = (category: string) => {
    switch (category) {
      case 'discount': return Percent
      case 'product': return ShoppingBag
      case 'service': return Star
      case 'premium': return Crown
      default: return Gift
    }
  }

  const getRewardColor = (category: string) => {
    switch (category) {
      case 'discount': return 'from-green-500 to-emerald-600'
      case 'product': return 'from-blue-500 to-indigo-600'
      case 'service': return 'from-purple-500 to-violet-600'
      case 'premium': return 'from-yellow-500 to-orange-600'
      default: return 'from-gray-500 to-slate-600'
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const filteredRewards = rewards.filter(reward => 
    selectedCategory === 'all' || reward.category === selectedCategory
  )

  const redeemReward = async (reward: Reward) => {
    if (!userPoints || userPoints.current_points < reward.points_cost) {
      setError('Pontos insuficientes para resgatar esta recompensa')
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/client/rewards/${reward.id}/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reward_id: reward.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao resgatar recompensa')
      }

      const data = await response.json()
      
      // Refresh data
      if (token) {
        await fetchRewardsData(token)
      }
      
      setShowRedeemModal(null)
      setSuccess(`Recompensa "${reward.title}" resgatada com sucesso!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao resgatar recompensa')
      setTimeout(() => setError(''), 3000)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20'
      case 'used': return 'text-gray-400 bg-gray-500/20'
      case 'expired': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo'
      case 'used': return 'Usado'
      case 'expired': return 'Expirado'
      default: return status
    }
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-400'
      case 'limited': return 'text-yellow-400'
      case 'unavailable': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getAvailabilityText = (reward: Reward) => {
    switch (reward.availability) {
      case 'available': return 'Disponível'
      case 'limited': return `${reward.stock} restantes`
      case 'unavailable': return 'Indisponível'
      default: return 'Desconhecido'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  // Remove the error condition that blocks the page rendering

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex">
      <Sidebar 
        userRole="client" 
        userName={currentUser?.name || 'Cliente'} 
        onLogout={handleLogout} 
      />

      <main className="flex-1 lg:ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Loja de Recompensas</h1>
              <p className="text-white/60">Troque seus pontos por recompensas incríveis</p>
            </div>
            {userPoints && (
              <div className="mt-4 lg:mt-0 flex items-center space-x-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-semibold">{userPoints.current_points.toLocaleString()} pontos</span>
                  </div>
                  <p className="text-white/60 text-sm">Nível {userPoints.level}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center space-x-2"
          >
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-green-400">{success}</span>
          </motion.div>
        )}
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center space-x-2"
          >
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
            {[
              { id: 'available', label: 'Disponíveis', icon: Gift },
              { id: 'redeemed', label: 'Resgatadas', icon: Trophy }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Available Rewards Tab */}
        {activeTab === 'available' && (
          <div>
            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id as any)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{category.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Rewards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {rewards.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Gift className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Nenhuma recompensa disponível</h3>
                  <p className="text-white/60">Novas recompensas serão adicionadas em breve.</p>
                </div>
              ) : (
                filteredRewards.map((reward, index) => {
                  const Icon = reward.icon
                  const canAfford = userPoints ? userPoints.current_points >= reward.points_cost : false
                  const isAvailable = reward.availability !== 'unavailable'
                  
                  return (
                    <motion.div
                      key={reward.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden hover:bg-white/20 transition-all duration-300 group ${
                        !isAvailable || !canAfford ? 'opacity-60' : ''
                      }`}
                    >
                      {/* Reward Header */}
                      <div className={`h-32 bg-gradient-to-br ${reward.color} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="relative h-full flex items-center justify-center">
                          <Icon className="w-12 h-12 text-white" />
                        </div>
                        
                        {/* Availability Badge */}
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(reward.availability)} bg-black/30`}>
                            {getAvailabilityText(reward)}
                          </span>
                        </div>
                        
                        {/* Value Badge */}
                        <div className="absolute bottom-2 left-2">
                          <span className="px-2 py-1 bg-white/20 text-white text-sm font-medium rounded-full">
                            {reward.value}
                          </span>
                        </div>
                      </div>
                      
                      {/* Reward Content */}
                      <div className="p-4">
                        <h3 className="text-white font-semibold mb-2">{reward.title}</h3>
                        <p className="text-white/60 text-sm mb-4 line-clamp-2">{reward.description}</p>
                        
                        {/* Points Cost */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-1">
                            <Coins className="w-4 h-4 text-yellow-400" />
                            <span className="text-white font-bold">{reward.points_cost.toLocaleString()}</span>
                            <span className="text-white/60 text-sm">pontos</span>
                          </div>
                          
                          {reward.expires_at && (
                            <div className="flex items-center space-x-1 text-orange-400">
                              <Clock className="w-3 h-3" />
                              <span className="text-xs">Até {formatDate(reward.expires_at)}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Redeem Button */}
                        <button
                          onClick={() => setShowRedeemModal(reward)}
                          disabled={!isAvailable || !canAfford}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                        >
                          {!isAvailable ? 'Indisponível' : !canAfford ? 'Pontos Insuficientes' : 'Resgatar'}
                        </button>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
            
            {filteredRewards.length === 0 && rewards.length > 0 && (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">Nenhuma recompensa encontrada nesta categoria</p>
              </div>
            )}
          </div>
        )}

        {/* Redeemed Rewards Tab */}
        {activeTab === 'redeemed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden"
          >
            <div className="p-6 border-b border-white/20">
              <h3 className="text-xl font-semibold text-white">Recompensas Resgatadas</h3>
            </div>
            
            <div className="divide-y divide-white/10">
              {redeemedRewards.map((reward, index) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Gift className="w-6 h-6 text-white" />
                      </div>
                      
                      <div>
                        <h4 className="text-white font-semibold">{reward.reward_title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-white/60 mt-1">
                          <span>Resgatado em {formatDate(reward.redeemed_at)}</span>
                          {reward.expires_at && (
                            <span>Expira em {formatDate(reward.expires_at)}</span>
                          )}
                        </div>
                        {reward.code && (
                          <div className="mt-2 p-2 bg-white/5 rounded border border-white/20">
                            <span className="text-white/80 text-sm">Código: </span>
                            <span className="text-white font-mono font-bold">{reward.code}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reward.status)}`}>
                        {getStatusText(reward.status)}
                      </span>
                      <div className="flex items-center space-x-1 text-white/60 text-sm mt-2">
                        <Coins className="w-3 h-3" />
                        <span>{reward.points_spent} pontos</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {redeemedRewards.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">Você ainda não resgatou nenhuma recompensa</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Redeem Confirmation Modal */}
        {showRedeemModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="text-center mb-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${showRedeemModal.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <showRedeemModal.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">{showRedeemModal.title}</h3>
                <p className="text-white/60 mb-4">{showRedeemModal.description}</p>
                
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-bold text-lg">{showRedeemModal.points_cost.toLocaleString()}</span>
                  <span className="text-white/60">pontos</span>
                </div>
              </div>
              
              {/* Terms */}
              <div className="mb-6">
                <h4 className="text-white font-medium mb-2">Termos e Condições:</h4>
                <ul className="space-y-1">
                  {showRedeemModal.terms.map((term, index) => (
                    <li key={index} className="flex items-start space-x-2 text-white/60 text-sm">
                      <Check className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Points Check */}
              {userPoints && userPoints.current_points < showRedeemModal.points_cost && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm">Pontos insuficientes para resgatar esta recompensa</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowRedeemModal(null)}
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => redeemReward(showRedeemModal)}
                  disabled={userPoints ? userPoints.current_points < showRedeemModal.points_cost : true}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar Resgate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}