'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Share2, 
  Copy, 
  Check,
  Gift,
  Star,
  Calendar,
  TrendingUp,
  Award,
  ExternalLink,
  UserPlus,
  Coins,
  Crown,
  Target
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../../components/Sidebar'

interface ReferralData {
  referral_code: string
  total_referrals: number
  pending_referrals: number
  completed_referrals: number
  total_points_earned: number
  points_this_month: number
  referral_link: string
}

interface Referral {
  id: string
  referred_name: string
  referred_email: string
  status: 'pending' | 'completed' | 'cancelled'
  points_earned: number
  referred_at: string
  completed_at?: string
}

interface ReferralReward {
  id: string
  title: string
  description: string
  points_required: number
  referrals_required: number
  reward_type: 'points' | 'discount' | 'premium'
  reward_value: string
  claimed: boolean
}

interface CurrentUser {
  id: string
  name: string
  email: string
  role: string
}

export default function ClientReferralsPage() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [rewards, setRewards] = useState<ReferralReward[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'rewards'>('overview')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.role !== 'client') {
        router.push('/dashboard/admin')
        return
      }
      setCurrentUser({
        id: payload.userId,
        name: payload.name || 'Cliente',
        email: payload.email,
        role: payload.role
      })
    } catch (err) {
      router.push('/login')
      return
    }

    fetchReferralData(token)
  }, [])

  const fetchReferralData = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/client/referrals', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar dados de indicações')
      }

      const data = await response.json()
      setReferralData(data.referralData || {})
      setReferrals(data.referrals || [])
      setRewards(data.rewards || [])
    } catch (err) {
      setError('Erro ao carregar dados de indicações')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'code') {
        setCopiedCode(true)
        setTimeout(() => setCopiedCode(false), 2000)
      } else {
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
      }
      setSuccess('Copiado para a área de transferência!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erro ao copiar')
      setTimeout(() => setError(''), 3000)
    }
  }

  const shareOnSocial = (platform: string) => {
    const text = `Venha conhecer o melhor serviço de IPTV! Use meu código ${referralData?.referral_code} e ganhe benefícios exclusivos.`
    const url = referralData?.referral_link || ''
    
    let shareUrl = ''
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
        break
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        break
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank')
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20'
      case 'pending': return 'text-yellow-400 bg-yellow-500/20'
      case 'cancelled': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída'
      case 'pending': return 'Pendente'
      case 'cancelled': return 'Cancelada'
      default: return status
    }
  }

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'points': return <Coins className="w-5 h-5" />
      case 'discount': return <Gift className="w-5 h-5" />
      case 'premium': return <Crown className="w-5 h-5" />
      default: return <Award className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error && !referralData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Erro</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard/client')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

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
          <h1 className="text-3xl font-bold text-white mb-2">Programa de Indicações</h1>
          <p className="text-white/60">Indique amigos e ganhe pontos e recompensas exclusivas</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400"
          >
            {error}
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400"
          >
            {success}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
              { id: 'referrals', label: 'Minhas Indicações', icon: Users },
              { id: 'rewards', label: 'Recompensas', icon: Award }
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

        {/* Overview Tab */}
        {activeTab === 'overview' && referralData && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Total de Indicações</p>
                    <p className="text-2xl font-bold text-white">{referralData.total_referrals}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Concluídas</p>
                    <p className="text-2xl font-bold text-white">{referralData.completed_referrals}</p>
                  </div>
                  <Check className="w-8 h-8 text-green-400" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Pontos Ganhos</p>
                    <p className="text-2xl font-bold text-white">{referralData.total_points_earned.toLocaleString()}</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-400" />
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
                    <p className="text-white/80 text-sm font-medium">Este Mês</p>
                    <p className="text-2xl font-bold text-white">{referralData.points_this_month}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-400" />
                </div>
              </motion.div>
            </div>

            {/* Referral Code Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-4">Seu Código de Indicação</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 bg-white/5 border border-white/20 rounded-lg p-4">
                    <p className="text-white/60 text-sm mb-1">Código de Indicação</p>
                    <p className="text-2xl font-bold text-white font-mono">{referralData.referral_code}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(referralData.referral_code, 'code')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex-1 bg-white/5 border border-white/20 rounded-lg p-4">
                    <p className="text-white/60 text-sm mb-1">Link de Indicação</p>
                    <p className="text-white font-mono text-sm break-all">{referralData.referral_link}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(referralData.referral_link, 'link')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Share Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-4">Compartilhar nas Redes Sociais</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => shareOnSocial('whatsapp')}
                  className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex flex-col items-center space-y-2"
                >
                  <Share2 className="w-6 h-6" />
                  <span className="text-sm font-medium">WhatsApp</span>
                </button>
                
                <button
                  onClick={() => shareOnSocial('telegram')}
                  className="p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex flex-col items-center space-y-2"
                >
                  <Share2 className="w-6 h-6" />
                  <span className="text-sm font-medium">Telegram</span>
                </button>
                
                <button
                  onClick={() => shareOnSocial('facebook')}
                  className="p-4 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors flex flex-col items-center space-y-2"
                >
                  <Share2 className="w-6 h-6" />
                  <span className="text-sm font-medium">Facebook</span>
                </button>
                
                <button
                  onClick={() => shareOnSocial('twitter')}
                  className="p-4 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors flex flex-col items-center space-y-2"
                >
                  <Share2 className="w-6 h-6" />
                  <span className="text-sm font-medium">Twitter</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden"
          >
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Histórico de Indicações</h3>
              <p className="text-white/60 text-sm mt-1">Acompanhe o status de todas as suas indicações</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 text-white/80 font-medium">Nome</th>
                    <th className="text-left p-4 text-white/80 font-medium">Email</th>
                    <th className="text-left p-4 text-white/80 font-medium">Status</th>
                    <th className="text-left p-4 text-white/80 font-medium">Pontos</th>
                    <th className="text-left p-4 text-white/80 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12">
                        <Users className="w-16 h-16 text-white/40 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Nenhuma indicação encontrada</h3>
                        <p className="text-white/60">Suas indicações aparecerão aqui quando alguém se cadastrar com seu código.</p>
                      </td>
                    </tr>
                  ) : (
                    referrals.map((referral, index) => (
                      <motion.tr
                        key={referral.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-t border-white/10 hover:bg-white/5 transition-colors"
                      >
                      <td className="p-4">
                        <p className="text-white font-medium">{referral.referred_name}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-white/80">{referral.referred_email}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                          {getStatusText(referral.status)}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-yellow-400 font-semibold">
                          {referral.points_earned > 0 ? `+${referral.points_earned}` : '-'}
                        </p>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white/80 text-sm">{formatDate(referral.referred_at)}</p>
                          {referral.completed_at && (
                            <p className="text-white/60 text-xs">Concluída: {formatDate(referral.completed_at)}</p>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                  )}
                </tbody>
              </table>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Gift className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Nenhuma recompensa de indicação disponível</h3>
                  <p className="text-white/60">Novas recompensas por indicações serão adicionadas em breve.</p>
                </div>
              ) : (
                rewards.map((reward, index) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 border transition-all ${
                    reward.claimed 
                      ? 'border-green-500/50 bg-green-500/10' 
                      : referralData && referralData.completed_referrals >= reward.referrals_required
                        ? 'border-blue-500/50 bg-blue-500/10'
                        : 'border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        reward.claimed 
                          ? 'bg-green-500/20 text-green-400'
                          : referralData && referralData.completed_referrals >= reward.referrals_required
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-white/10 text-white/60'
                      }`}>
                        {getRewardIcon(reward.reward_type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{reward.title}</h3>
                        <p className="text-white/60 text-sm">{reward.description}</p>
                      </div>
                    </div>
                    
                    {reward.claimed && (
                      <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-medium">
                        Resgatado
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Indicações necessárias:</span>
                      <span className="text-white font-semibold">{reward.referrals_required}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Recompensa:</span>
                      <span className="text-yellow-400 font-semibold">{reward.reward_value}</span>
                    </div>
                    
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          reward.claimed 
                            ? 'bg-green-500'
                            : referralData && referralData.completed_referrals >= reward.referrals_required
                              ? 'bg-blue-500'
                              : 'bg-white/40'
                        }`}
                        style={{ 
                          width: `${Math.min(100, referralData ? (referralData.completed_referrals / reward.referrals_required) * 100 : 0)}%` 
                        }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">
                        {referralData?.completed_referrals || 0} / {reward.referrals_required}
                      </span>
                      {!reward.claimed && referralData && referralData.completed_referrals >= reward.referrals_required && (
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                          Resgatar
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}