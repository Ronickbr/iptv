'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Lock,
  Shield,
  Bell,
  Smartphone,
  CreditCard,
  Download,
  Trash2,
  AlertTriangle,
  Check,
  Camera,
  Upload,
  Settings,
  Key,
  Globe,
  Star,
  Award,
  TrendingUp,
  Trophy,
  Clock,
  Target
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../../components/Sidebar'
import CustomSelect from '../../../components/CustomSelect'

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  birth_date?: string
  address?: {
    street: string
    city: string
    state: string
    zip_code: string
    country: string
  }
  avatar?: string
  created_at: string
  last_login?: string
  subscription?: {
    plan: string
    status: string
    expires_at: string
  }
  preferences: {
    language: string
    timezone: string
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
    privacy: {
      profile_visibility: 'public' | 'private'
      show_activity: boolean
    }
  }
  stats: {
    total_points: number
    current_points: number
    level: string
    referrals: number
    watch_time: number
  }
}

interface CurrentUser {
  id: string
  name: string
  email: string
  role: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'stats'>('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({})
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const router = useRouter()

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'preferences', label: 'Preferências', icon: Settings },
    { id: 'stats', label: 'Estatísticas', icon: TrendingUp }
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

    fetchProfile(token)
  }, [])

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar perfil')
      }

      const data = await response.json()
      const profileData = {
        ...data.profile,
        preferences: data.profile.preferences || {
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          notifications: {
            email: true,
            sms: false,
            push: true
          },
          privacy: {
            profile_visibility: 'private',
            show_activity: false
          }
        },
        stats: data.profile.stats || {
          total_points: 0,
          current_points: 0,
          level: 'Bronze',
          referrals: 0,
          watch_time: 0
        }
      }
      setProfile(profileData)
      setEditedProfile(profileData)
    } catch (err) {
      setError('Erro ao carregar perfil')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const handleSaveProfile = async () => {
    try {
      setError('')
      setSuccess('')

      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('http://localhost:3001/api/client/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editedProfile.name,
          phone: editedProfile.phone,
          birth_date: editedProfile.birth_date,
          address: editedProfile.address
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar perfil')
      }
      
      setProfile(editedProfile as UserProfile)
      setIsEditing(false)
      setSuccess('Perfil atualizado com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erro ao salvar perfil')
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('As senhas não coincidem')
      return
    }
    
    if (passwordData.new_password.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres')
      return
    }
    
    try {
      // Simulação de mudança de senha
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
      setShowPasswordChange(false)
      setSuccess('Senha alterada com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erro ao alterar senha')
    }
  }

  const handlePreferenceChange = (section: string, key: string, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [section]: {
          ...(prev.preferences as any)?.[section],
          [key]: value
        }
      }
    } as Partial<UserProfile>))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }



  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'bronze': return 'from-orange-600 to-yellow-600'
      case 'prata': return 'from-gray-400 to-gray-600'
      case 'ouro': return 'from-yellow-400 to-yellow-600'
      case 'platina': return 'from-blue-400 to-purple-600'
      case 'diamante': return 'from-cyan-400 to-blue-600'
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

  if (error && !profile) {
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
          <h1 className="text-3xl font-bold text-white mb-2">Meu Perfil</h1>
          <p className="text-white/60">Gerencie suas informações pessoais e configurações</p>
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

        {/* Profile Header */}
        {profile && (
          <div className="mb-8 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                    <Camera className="w-3 h-3 text-white" />
                  </button>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                  <p className="text-white/60">{profile.email}</p>
                  {profile.subscription && (
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                        {profile.subscription.plan}
                      </span>
                      <span className="text-white/60 text-sm">
                        Expira em {formatDate(profile.subscription.expires_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 lg:mt-0 flex items-center space-x-4">
                <div className={`px-4 py-2 bg-gradient-to-r ${getLevelColor(profile.stats.level)} rounded-lg`}>
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-white" />
                    <span className="text-white font-semibold">Nível {profile.stats.level}</span>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-white font-semibold">{profile.stats.current_points.toLocaleString()}</span>
                    <span className="text-white/60 text-sm">pontos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white/10 rounded-lg p-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
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

        {/* Profile Tab */}
        {activeTab === 'profile' && profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Personal Information */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Informações Pessoais</h3>
                <button
                  onClick={() => {
                    if (isEditing) {
                      handleSaveProfile()
                    } else {
                      setIsEditing(true)
                    }
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Salvar</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4" />
                      <span>Editar</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Nome Completo</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.name || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-white">{profile.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
                  <p className="text-white">{profile.email}</p>
                  <p className="text-white/60 text-xs mt-1">O email não pode ser alterado</p>
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Telefone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedProfile.phone || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                      placeholder="+55 11 99999-9999"
                    />
                  ) : (
                    <p className="text-white">{profile.phone || 'Não informado'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Data de Nascimento</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedProfile.birth_date || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, birth_date: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-white">{profile.birth_date ? formatDate(profile.birth_date) : 'Não informado'}</p>
                  )}
                </div>
              </div>
              
              {/* Address */}
              {profile.address && (
                <div className="mt-6">
                  <h4 className="text-white font-medium mb-4">Endereço</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-white/80 text-sm font-medium mb-2">Rua</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.address?.street || ''}
                          onChange={(e) => setEditedProfile(prev => ({
                            ...prev,
                            address: { ...prev.address, street: e.target.value } as any
                          }))}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-white">{profile.address.street}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Cidade</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.address?.city || ''}
                          onChange={(e) => setEditedProfile(prev => ({
                            ...prev,
                            address: { ...prev.address, city: e.target.value } as any
                          }))}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-white">{profile.address.city}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Estado</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.address?.state || ''}
                          onChange={(e) => setEditedProfile(prev => ({
                            ...prev,
                            address: { ...prev.address, state: e.target.value } as any
                          }))}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-white">{profile.address.state}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {isEditing && (
                <div className="mt-6 flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditedProfile(profile)
                    }}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
            
            {/* Account Information */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Informações da Conta</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Membro desde</label>
                  <p className="text-white">{formatDate(profile.created_at)}</p>
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Último acesso</label>
                  <p className="text-white">{profile.last_login ? formatDateTime(profile.last_login) : 'Nunca'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Password Change */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">Alterar Senha</h3>
                  <p className="text-white/60 text-sm">Mantenha sua conta segura com uma senha forte</p>
                </div>
                <button
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Key className="w-4 h-4" />
                  <span>Alterar Senha</span>
                </button>
              </div>
              
              {showPasswordChange && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Senha Atual</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                        className="w-full px-4 py-2 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                        placeholder="Digite sua senha atual"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Nova Senha</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                        className="w-full px-4 py-2 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                        placeholder="Digite sua nova senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Confirmar Nova Senha</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                        className="w-full px-4 py-2 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                        placeholder="Confirme sua nova senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handlePasswordChange}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Alterar Senha
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordChange(false)
                        setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
                      }}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Security Settings */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Configurações de Segurança</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-green-400" />
                    <div>
                      <h4 className="text-white font-medium">Autenticação de Dois Fatores</h4>
                      <p className="text-white/60 text-sm">Adicione uma camada extra de segurança</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Configurar
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-blue-400" />
                    <div>
                      <h4 className="text-white font-medium">Dispositivos Conectados</h4>
                      <p className="text-white/60 text-sm">Gerencie dispositivos com acesso à sua conta</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                    Gerenciar
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <div>
                      <h4 className="text-white font-medium">Histórico de Login</h4>
                      <p className="text-white/60 text-sm">Visualize acessos recentes à sua conta</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                    Ver Histórico
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Notification Preferences */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Notificações</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-400" />
                    <div>
                      <h4 className="text-white font-medium">Notificações por Email</h4>
                      <p className="text-white/60 text-sm">Receba atualizações importantes por email</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedProfile.preferences?.notifications?.email || false}
                      onChange={(e) => handlePreferenceChange('notifications', 'email', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-green-400" />
                    <div>
                      <h4 className="text-white font-medium">Notificações por SMS</h4>
                      <p className="text-white/60 text-sm">Receba alertas importantes por SMS</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedProfile.preferences?.notifications?.sms || false}
                      onChange={(e) => handlePreferenceChange('notifications', 'sms', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-purple-400" />
                    <div>
                      <h4 className="text-white font-medium">Notificações Push</h4>
                      <p className="text-white/60 text-sm">Receba notificações no navegador</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedProfile.preferences?.notifications?.push || false}
                      onChange={(e) => handlePreferenceChange('notifications', 'push', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Privacy Preferences */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Privacidade</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="text-white font-medium">Visibilidade do Perfil</h4>
                      <p className="text-white/60 text-sm">Controle quem pode ver seu perfil</p>
                    </div>
                  </div>
                  <CustomSelect
                    options={[
                      { value: 'public', label: 'Público' },
                      { value: 'private', label: 'Privado' }
                    ]}
                    value={editedProfile.preferences?.privacy?.profile_visibility || 'private'}
                    onChange={(value) => handlePreferenceChange('privacy', 'profile_visibility', value)}
                    placeholder="Selecione a visibilidade"
                    className="min-w-[120px]"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-orange-400" />
                    <div>
                      <h4 className="text-white font-medium">Mostrar Atividade</h4>
                      <p className="text-white/60 text-sm">Permitir que outros vejam sua atividade</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedProfile.preferences?.privacy?.show_activity || false}
                      onChange={(e) => handlePreferenceChange('privacy', 'show_activity', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Language and Region */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Idioma e Região</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Idioma</label>
                  <CustomSelect
                    options={[
                      { value: 'pt-BR', label: 'Português (Brasil)' },
                      { value: 'en-US', label: 'English (US)' },
                      { value: 'es-ES', label: 'Español' }
                    ]}
                    value={editedProfile.preferences?.language || 'pt-BR'}
                    onChange={(value) => setEditedProfile(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        language: value
                      }
                    } as Partial<UserProfile>))}
                    placeholder="Selecione o idioma"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Fuso Horário</label>
                  <CustomSelect
                    options={[
                      { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
                      { value: 'America/New_York', label: 'New York (GMT-5)' },
                      { value: 'Europe/London', label: 'London (GMT+0)' }
                    ]}
                    value={editedProfile.preferences?.timezone || 'America/Sao_Paulo'}
                    onChange={(value) => setEditedProfile(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        timezone: value
                      }
                    } as Partial<UserProfile>))}
                    placeholder="Selecione o fuso horário"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleSaveProfile}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Salvar Preferências
              </button>
            </div>
          </motion.div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Pontos Atuais</p>
                    <p className="text-2xl font-bold text-white">{profile.stats.current_points.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Total de Pontos</p>
                    <p className="text-2xl font-bold text-white">{profile.stats.total_points.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Indicações</p>
                    <p className="text-2xl font-bold text-white">{profile.stats.referrals}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Level Progress */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Progresso do Nível</h3>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-16 h-16 bg-gradient-to-r ${getLevelColor(profile.stats.level)} rounded-full flex items-center justify-center`}>
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white">Nível {profile.stats.level}</h4>
                  <p className="text-white/60">Continue ganhando pontos para subir de nível</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-white/10 rounded-full h-3 mb-4">
                <div 
                  className={`h-3 bg-gradient-to-r ${getLevelColor(profile.stats.level)} rounded-full transition-all duration-500`}
                  style={{ width: '65%' }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm text-white/60">
                <span>2.450 pontos</span>
                <span>Próximo nível: 4.000 pontos</span>
              </div>
            </div>
            

          </motion.div>
        )}
      </main>
    </div>
  )
}