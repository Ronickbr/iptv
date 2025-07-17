'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Star, 
  Gift, 
  Users, 
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Coins,
  Target,
  Zap,
  Heart,
  Trophy,
  Crown
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../../components/Sidebar'

interface PointsData {
  current_points: number
  total_earned: number
  points_this_month: number
  referrals_count: number
  referral_code: string
  level: {
    current: number
    name: string
    min_points: number
    max_points: number
    benefits: string[]
  }
  next_level: {
    level: number
    name: string
    points_needed: number
  }
}

interface PointsHistory {
  id: string
  type: 'earned' | 'spent' | 'bonus'
  description: string
  points: number
  date: string
  details?: string
}

interface EarningMethod {
  id: string
  title: string
  description: string
  points: number
  icon: any
  color: string
  action: string
}

interface CurrentUser {
  id: string
  name: string
  email: string
  role: string
}

export default function PointsPage() {
  const [pointsData, setPointsData] = useState<PointsData | null>(null)
  const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'earn' | 'history'>('overview')
  const router = useRouter()

  const earningMethods: EarningMethod[] = [
    {
      id: 'referral',
      title: 'Indicar Amigos',
      description: 'Ganhe pontos para cada amigo que se cadastrar',
      points: 500,
      icon: Users,
      color: 'from-blue-500 to-purple-600',
      action: 'Compartilhar Código'
    },
    {
      id: 'monthly',
      title: 'Assinatura Mensal',
      description: 'Pontos automáticos por manter sua assinatura ativa',
      points: 100,
      icon: Calendar,
      color: 'from-green-500 to-blue-600',
      action: 'Automático'
    },
    {
      id: 'loyalty',
      title: 'Fidelidade',
      description: 'Bônus por tempo de assinatura',
      points: 200,
      icon: Heart,
      color: 'from-red-500 to-pink-600',
      action: 'Automático'
    },
    {
      id: 'social',
      title: 'Compartilhar nas Redes',
      description: 'Compartilhe nossa plataforma nas redes sociais',
      points: 50,
      icon: Share2,
      color: 'from-purple-500 to-indigo-600',
      action: 'Compartilhar'
    },
    {
      id: 'review',
      title: 'Avaliar Serviço',
      description: 'Deixe uma avaliação sobre nosso serviço',
      points: 150,
      icon: Star,
      color: 'from-yellow-500 to-orange-600',
      action: 'Avaliar'
    },
    {
      id: 'milestone',
      title: 'Marcos de Uso',
      description: 'Alcance marcos de tempo assistido',
      points: 300,
      icon: Trophy,
      color: 'from-orange-500 to-red-600',
      action: 'Assistir'
    }
  ]

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

    fetchPointsData(token)
  }, [])

  const fetchPointsData = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/client/points', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar dados de pontos')
      }

      const data = await response.json()
      setPointsData(data.pointsData)
      setPointsHistory(data.history || [])
    } catch (err) {
      setError('Erro ao carregar dados de pontos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const copyReferralCode = () => {
    if (pointsData?.referral_code) {
      navigator.clipboard.writeText(pointsData.referral_code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const shareReferralCode = () => {
    if (pointsData?.referral_code) {
      const text = `Venha assistir IPTV comigo! Use meu código ${pointsData.referral_code} e ganhe benefícios exclusivos!`
      if (navigator.share) {
        navigator.share({
          title: 'IPTV Manager - Convite',
          text: text,
          url: window.location.origin
        })
      } else {
        navigator.clipboard.writeText(text)
        setSuccess('Link de convite copiado!')
        setTimeout(() => setSuccess(''), 3000)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getProgressPercentage = () => {
    if (!pointsData || !pointsData.level) return 0
    const { current_points, level } = pointsData
    const currentLevelPoints = current_points - (level.min_points || 0)
    const totalLevelPoints = (level.max_points || 0) - (level.min_points || 0)
    if (totalLevelPoints <= 0) return 0
    return Math.min((currentLevelPoints / totalLevelPoints) * 100, 100)
  }

  const getLevelIcon = (level: number) => {
    switch (level) {
      case 1: return Star
      case 2: return Award
      case 3: return Trophy
      case 4: return Crown
      default: return Star
    }
  }

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'from-gray-400 to-gray-600'
      case 2: return 'from-yellow-400 to-yellow-600'
      case 3: return 'from-yellow-500 to-orange-600'
      case 4: return 'from-purple-500 to-indigo-600'
      default: return 'from-gray-400 to-gray-600'
    }
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
            onClick={() => router.push('/dashboard/client')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
          <h1 className="text-3xl font-bold text-white mb-2">Sistema de Pontos</h1>
          <p className="text-white/60">Ganhe pontos e desbloqueie benefícios exclusivos</p>
        </div>

        {/* Success Message */}
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

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Visão Geral', icon: Star },
              { id: 'earn', label: 'Ganhar Pontos', icon: Coins },
              { id: 'history', label: 'Histórico', icon: Clock }
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {!pointsData ? (
              <div className="text-center py-12">
                <Coins className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Nenhum dado de pontos encontrado</h3>
                <p className="text-white/60">Comece a ganhar pontos indicando amigos ou participando de promoções.</p>
              </div>
            ) : (
              <>
                {/* Points Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm font-medium">Pontos Atuais</p>
                        <p className="text-2xl font-bold text-white">{pointsData.current_points.toLocaleString()}</p>
                      </div>
                      <Coins className="w-8 h-8 text-yellow-400" />
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
                    <p className="text-white/80 text-sm font-medium">Total Ganho</p>
                    <p className="text-2xl font-bold text-white">{pointsData.total_earned.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
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
                    <p className="text-white/80 text-sm font-medium">Este Mês</p>
                    <p className="text-2xl font-bold text-white">{pointsData.points_this_month.toLocaleString()}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-400" />
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
                    <p className="text-white/80 text-sm font-medium">Indicações</p>
                    <p className="text-2xl font-bold text-white">{pointsData.referrals_count}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
              </motion.div>
            </div>

            {/* Level Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Nível Atual</h3>
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 bg-gradient-to-br ${getLevelColor(pointsData.level?.current || 1)} rounded-full flex items-center justify-center`}>
                  {(() => {
                    const LevelIcon = getLevelIcon(pointsData.level?.current || 1)
                    return <LevelIcon className="w-4 h-4 text-white" />
                  })()}
                </div>
                <span className="text-white font-semibold">{pointsData.level?.name || 'Nível Inicial'}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                  <span>Progresso para {pointsData.next_level?.name || 'Próximo Nível'}</span>
                  <span>{pointsData.next_level?.points_needed || 0} pontos restantes</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">Benefícios do Nível {pointsData.level?.name || 'Inicial'}:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(pointsData.level?.benefits || []).map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2 text-white/80 text-sm">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Referral Code */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Seu Código de Indicação</h3>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1 p-4 bg-white/5 border border-white/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-mono font-bold text-white">{pointsData.referral_code}</span>
                    <button
                      onClick={copyReferralCode}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={shareReferralCode}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartilhar</span>
                </button>
              </div>
              
              <p className="text-white/60 text-sm">
                Compartilhe seu código com amigos e ganhe <strong className="text-white">100 pontos</strong> para cada pessoa que se cadastrar!
              </p>
            </motion.div>
              </>
            )}
          </div>
        )}

        {/* Earn Points Tab */}
        {activeTab === 'earn' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {earningMethods.map((method, index) => {
              const Icon = method.icon
              return (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${method.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-yellow-400">
                        <Coins className="w-4 h-4" />
                        <span className="font-bold">+{method.points}</span>
                      </div>
                      <span className="text-white/60 text-xs">pontos</span>
                    </div>
                  </div>
                  
                  <h3 className="text-white font-semibold mb-2">{method.title}</h3>
                  <p className="text-white/60 text-sm mb-4">{method.description}</p>
                  
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors group-hover:bg-blue-700">
                    {method.action}
                  </button>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden"
          >
            <div className="p-6 border-b border-white/20">
              <h3 className="text-xl font-semibold text-white">Histórico de Pontos</h3>
            </div>
            
            <div className="divide-y divide-white/10">
              {pointsHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Nenhum histórico encontrado</h3>
                  <p className="text-white/60">Suas transações de pontos aparecerão aqui.</p>
                </div>
              ) : (
                pointsHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.type === 'earned' ? 'bg-green-500/20' :
                        item.type === 'spent' ? 'bg-red-500/20' :
                        'bg-blue-500/20'
                      }`}>
                        {item.type === 'earned' ? (
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        ) : item.type === 'spent' ? (
                          <Gift className="w-5 h-5 text-red-400" />
                        ) : (
                          <Zap className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      
                      <div>
                        <h4 className="text-white font-medium">{item.description}</h4>
                        <p className="text-white/60 text-sm">{formatDate(item.date)}</p>
                        {item.details && (
                          <p className="text-white/40 text-xs mt-1">{item.details}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`flex items-center space-x-1 ${
                        item.points > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        <span className="font-bold">
                          {item.points > 0 ? '+' : ''}{item.points}
                        </span>
                        <Coins className="w-4 h-4" />
                      </div>
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