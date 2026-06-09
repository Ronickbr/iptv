'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CreditCard, 
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  User
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../../components/Sidebar'
import CustomSelect from '../../../components/CustomSelect'

interface Subscription {
  id: string
  user_name: string
  user_email: string
  plan_name: string
  price: number
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  start_date: string
  end_date: string
  payment_method: string
  auto_renewal: boolean
  devices_used: number
  max_devices: number
}

interface CurrentUser {
  id: string
  name: string
  email: string
  role: string
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'cancelled' | 'pending'>('all')
  const [filterPlan, setFilterPlan] = useState<'all' | 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual'>('all')
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [editFormData, setEditFormData] = useState<Partial<Subscription>>({})
  const [createFormData, setCreateFormData] = useState({
    user_email: '',
    plan_name: 'Mensal',
    price: 29.99,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    payment_method: 'credit_card',
    auto_renewal: true,
    max_devices: 3
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.role !== 'admin') {
        router.push('/dashboard/client')
        return
      }
      setCurrentUser({
        id: payload.userId,
        name: payload.name || 'Admin',
        email: payload.email,
        role: payload.role
      })
    } catch (err) {
      router.push('/login')
      return
    }

    fetchSubscriptions(token)
  }, [])



  const fetchSubscriptions = async (token: string) => {
    try {
      setError('')
      // Buscando dados reais da API
      const response = await fetch('http://localhost:3001/api/admin/subscriptions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar assinaturas')
      }

      const data = await response.json()
      setSubscriptions(data.subscriptions || [])
    } catch (err) {
      setError('Erro ao carregar assinaturas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  // Modal handlers
  const handleViewSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
    setViewModalOpen(true)
  }

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
    setEditFormData({
      user_name: subscription.user_name,
      user_email: subscription.user_email,
      plan_name: subscription.plan_name,
      price: subscription.price,
      status: subscription.status,
      start_date: subscription.start_date,
      end_date: subscription.end_date,
      payment_method: subscription.payment_method,
      auto_renewal: subscription.auto_renewal,
      max_devices: subscription.max_devices
    })
    setEditModalOpen(true)
  }

  const saveSubscriptionChanges = async () => {
    if (!selectedSubscription) return
    
    setActionLoading(true)
    try {
      // Simular salvamento (implementar API real posteriormente)
      const updatedSubscription = {
        ...selectedSubscription,
        ...editFormData
      }
      
      // Atualizar a lista local
      setSubscriptions(prev => prev.map(sub => 
        sub.id === selectedSubscription.id ? updatedSubscription as Subscription : sub
      ))
      
      closeModals()
    } catch (error) {
      console.error('Erro ao salvar alterações:', error)
      alert('Erro ao salvar alterações da assinatura')
    } finally {
      setActionLoading(false)
    }
  }

  const handleStatusChange = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
    setStatusModalOpen(true)
  }

  const updateSubscriptionStatus = async (subscriptionId: string, newStatus: string) => {
    try {
      setActionLoading(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch(`http://localhost:3001/api/admin/subscriptions/${subscriptionId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar status')
      }

      // Atualizar a lista local
      setSubscriptions(prev => prev.map(sub => 
        sub.id === subscriptionId ? { ...sub, status: newStatus as any } : sub
      ))
      
      setStatusModalOpen(false)
      setSelectedSubscription(null)
    } catch (err) {
      setError('Erro ao atualizar status da assinatura')
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const closeModals = () => {
    setViewModalOpen(false)
    setEditModalOpen(false)
    setStatusModalOpen(false)
    setCreateModalOpen(false)
    setSelectedSubscription(null)
    setEditFormData({})
    setCreateFormData({
      user_email: '',
      plan_name: 'Mensal',
      price: 29.99,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      payment_method: 'credit_card',
      auto_renewal: true,
      max_devices: 3
    })
  }

  const handleCreateSubscription = () => {
    setCreateModalOpen(true)
  }

  const createSubscription = async () => {
    if (!createFormData.user_email || !createFormData.plan_name) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    setActionLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // Calcular data de fim baseada no plano
      const startDate = new Date(createFormData.start_date)
      const endDate = new Date(startDate)
      
      switch (createFormData.plan_name) {
        case 'Mensal':
          endDate.setMonth(endDate.getMonth() + 1)
          break
        case 'Trimestral':
          endDate.setMonth(endDate.getMonth() + 3)
          break
        case 'Semestral':
          endDate.setMonth(endDate.getMonth() + 6)
          break
        case 'Anual':
          endDate.setFullYear(endDate.getFullYear() + 1)
          break
      }

      const subscriptionData = {
        ...createFormData,
        end_date: endDate.toISOString().split('T')[0],
        status: 'active'
      }

      const response = await fetch('http://localhost:3001/api/admin/subscriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriptionData)
      })

      if (!response.ok) {
        throw new Error('Erro ao criar assinatura')
      }

      const newSubscription = await response.json()
      
      // Atualizar a lista de assinaturas
      setSubscriptions(prev => [newSubscription, ...prev])
      
      closeModals()
      alert('Assinatura criada com sucesso!')
    } catch (error) {
      console.error('Erro ao criar assinatura:', error)
      alert('Erro ao criar assinatura')
    } finally {
       setActionLoading(false)
     }
   }

   const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20'
      case 'expired': return 'text-red-400 bg-red-500/20'
      case 'cancelled': return 'text-gray-400 bg-gray-500/20'
      case 'pending': return 'text-yellow-400 bg-yellow-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa'
      case 'expired': return 'Expirada'
      case 'cancelled': return 'Cancelada'
      case 'pending': return 'Pendente'
      default: return status
    }
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.plan_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || subscription.status === filterStatus
    const matchesPlan = filterPlan === 'all' || subscription.plan_name === filterPlan
    
    return matchesSearch && matchesStatus && matchesPlan
  })

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
            onClick={() => router.push('/dashboard/admin')}
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
        userRole="admin" 
        userName={currentUser?.name || 'Admin'} 
        onLogout={handleLogout} 
      />

      <main className="flex-1 lg:ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Gerenciar Assinaturas</h1>
          <p className="text-white/60">Visualize e gerencie todas as assinaturas do sistema</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Total</p>
                <p className="text-2xl font-bold text-white">{subscriptions.length}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-400" />
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
                <p className="text-white/80 text-sm font-medium">Ativas</p>
                <p className="text-2xl font-bold text-white">{subscriptions.filter(s => s.status === 'active').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
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
                <p className="text-white/80 text-sm font-medium">Pendentes</p>
                <p className="text-2xl font-bold text-white">{subscriptions.filter(s => s.status === 'pending').length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
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
                <p className="text-white/80 text-sm font-medium">Receita Mensal</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.price, 0))}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por cliente, email ou plano..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            {/* Status Filter */}
            <CustomSelect
              options={[
                { value: 'all', label: 'Todos os Status' },
                { value: 'active', label: 'Ativa' },
                { value: 'pending', label: 'Pendente' },
                { value: 'expired', label: 'Expirada' },
                { value: 'cancelled', label: 'Cancelada' }
              ]}
              value={filterStatus}
              onChange={(value) => setFilterStatus(value as any)}
              placeholder="Filtrar por status"
            />
            
            {/* Plan Filter */}
            <CustomSelect
              options={[
                { value: 'all', label: 'Todos os Planos' },
                { value: 'Mensal', label: 'Mensal' },
                { value: 'Trimestral', label: 'Trimestral' },
                { value: 'Semestral', label: 'Semestral' },
                { value: 'Anual', label: 'Anual' }
              ]}
              value={filterPlan}
              onChange={(value) => setFilterPlan(value as any)}
              placeholder="Filtrar por plano"
            />
            
            {/* Add Subscription Button */}
            <button 
              onClick={handleCreateSubscription}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Nova Assinatura</span>
            </button>
          </div>
        </motion.div>

        {/* Subscriptions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-white/80 font-medium">Cliente</th>
                  <th className="text-left p-4 text-white/80 font-medium">Plano</th>
                  <th className="text-left p-4 text-white/80 font-medium">Status</th>
                  <th className="text-left p-4 text-white/80 font-medium">Período</th>
                  <th className="text-left p-4 text-white/80 font-medium">Dispositivos</th>
                  <th className="text-left p-4 text-white/80 font-medium">Renovação</th>
                  <th className="text-left p-4 text-white/80 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((subscription, index) => (
                  <motion.tr
                    key={subscription.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-t border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {subscription.user_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{subscription.user_name}</p>
                          <p className="text-white/60 text-sm">{subscription.user_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">{subscription.plan_name}</p>
                        <p className="text-white/60 text-sm">{formatCurrency(subscription.price)}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                        {getStatusText(subscription.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white text-sm">{formatDate(subscription.start_date)} - {formatDate(subscription.end_date)}</p>
                        {subscription.status === 'active' && (
                          <p className="text-white/60 text-xs">
                            {getDaysRemaining(subscription.end_date) > 0 
                              ? `${getDaysRemaining(subscription.end_date)} dias restantes`
                              : 'Expirada'
                            }
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-white text-sm">{subscription.devices_used}/{subscription.max_devices}</span>
                        <div className="w-16 bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(subscription.devices_used / subscription.max_devices) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        subscription.auto_renewal 
                          ? 'text-green-400 bg-green-500/20' 
                          : 'text-gray-400 bg-gray-500/20'
                      }`}>
                        {subscription.auto_renewal ? 'Automática' : 'Manual'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewSubscription(subscription)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Visualizar detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditSubscription(subscription)}
                          className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                          title="Editar assinatura"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {subscription.status === 'active' ? (
                          <button 
                            onClick={() => handleStatusChange(subscription)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Cancelar assinatura"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        ) : subscription.status === 'expired' || subscription.status === 'cancelled' ? (
                          <button 
                            onClick={() => handleStatusChange(subscription)}
                            className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                            title="Reativar assinatura"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredSubscriptions.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">Nenhuma assinatura encontrada</p>
            </div>
          )}
        </motion.div>
      </main>

      {/* Modal de Visualização */}
      {viewModalOpen && selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Detalhes da Assinatura</h3>
              <button
                onClick={closeModals}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-white/60 text-sm">Cliente</label>
                  <p className="text-white font-medium">{selectedSubscription.user_name}</p>
                  <p className="text-white/80 text-sm">{selectedSubscription.user_email}</p>
                </div>
                
                <div>
                  <label className="text-white/60 text-sm">Plano</label>
                  <p className="text-white font-medium">{selectedSubscription.plan_name}</p>
                  <p className="text-white/80 text-sm">{formatCurrency(selectedSubscription.price)}</p>
                </div>
                
                <div>
                  <label className="text-white/60 text-sm">Status</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSubscription.status)}`}>
                    {getStatusText(selectedSubscription.status)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-white/60 text-sm">Período</label>
                  <p className="text-white">{formatDate(selectedSubscription.start_date)} - {formatDate(selectedSubscription.end_date)}</p>
                  {selectedSubscription.status === 'active' && (
                    <p className="text-white/60 text-sm">
                      {getDaysRemaining(selectedSubscription.end_date) > 0 
                        ? `${getDaysRemaining(selectedSubscription.end_date)} dias restantes`
                        : 'Expirada'
                      }
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="text-white/60 text-sm">Método de Pagamento</label>
                  <p className="text-white">{selectedSubscription.payment_method}</p>
                </div>
                
                <div>
                  <label className="text-white/60 text-sm">Dispositivos</label>
                  <p className="text-white">{selectedSubscription.devices_used}/{selectedSubscription.max_devices}</p>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(selectedSubscription.devices_used / selectedSubscription.max_devices) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <label className="text-white/60 text-sm">Renovação Automática</label>
                  <p className="text-white">{selectedSubscription.auto_renewal ? 'Ativada' : 'Desativada'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Edição */}
      {editModalOpen && selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Editar Assinatura</h3>
              <button
                onClick={closeModals}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-white/80 text-sm font-medium mb-2">Nome do Cliente</label>
                   <input
                     type="text"
                     value={editFormData.user_name || ''}
                     onChange={(e) => setEditFormData({...editFormData, user_name: e.target.value})}
                     className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-white/80 text-sm font-medium mb-2">Email do Cliente</label>
                   <input
                     type="email"
                     value={editFormData.user_email || ''}
                     onChange={(e) => setEditFormData({...editFormData, user_email: e.target.value})}
                     className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                   />
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-white/80 text-sm font-medium mb-2">Plano</label>
                   <CustomSelect
                     options={[
                       { value: 'Mensal', label: 'Mensal' },
                       { value: 'Trimestral', label: 'Trimestral' },
                       { value: 'Semestral', label: 'Semestral' },
                       { value: 'Anual', label: 'Anual' }
                     ]}
                     value={editFormData.plan_name || ''}
                     onChange={(value) => setEditFormData({...editFormData, plan_name: value})}
                     placeholder="Selecione o plano"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-white/80 text-sm font-medium mb-2">Preço (R$)</label>
                   <input
                     type="number"
                     step="0.01"
                     value={editFormData.price || ''}
                     onChange={(e) => setEditFormData({...editFormData, price: parseFloat(e.target.value) || 0})}
                     className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                   />
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-white/80 text-sm font-medium mb-2">Status</label>
                   <CustomSelect
                     options={[
                       { value: 'active', label: 'Ativa' },
                       { value: 'pending', label: 'Pendente' },
                       { value: 'expired', label: 'Expirada' },
                       { value: 'cancelled', label: 'Cancelada' }
                     ]}
                     value={editFormData.status || ''}
                     onChange={(value) => setEditFormData({...editFormData, status: value as any})}
                     placeholder="Selecione o status"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-white/80 text-sm font-medium mb-2">Método de Pagamento</label>
                   <CustomSelect
                     options={[
                       { value: 'Cartão de Crédito', label: 'Cartão de Crédito' },
                       { value: 'PIX', label: 'PIX' },
                       { value: 'Boleto', label: 'Boleto' },
                       { value: 'Transferência', label: 'Transferência' }
                     ]}
                     value={editFormData.payment_method || ''}
                     onChange={(value) => setEditFormData({...editFormData, payment_method: value})}
                     placeholder="Selecione o método"
                   />
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-white/80 text-sm font-medium mb-2">Data de Início</label>
                   <input
                     type="date"
                     value={editFormData.start_date || ''}
                     onChange={(e) => setEditFormData({...editFormData, start_date: e.target.value})}
                     className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-white/80 text-sm font-medium mb-2">Data de Término</label>
                   <input
                     type="date"
                     value={editFormData.end_date || ''}
                     onChange={(e) => setEditFormData({...editFormData, end_date: e.target.value})}
                     className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                   />
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-white/80 text-sm font-medium mb-2">Máximo de Dispositivos</label>
                   <input
                     type="number"
                     min="1"
                     max="10"
                     value={editFormData.max_devices || ''}
                     onChange={(e) => setEditFormData({...editFormData, max_devices: parseInt(e.target.value) || 2})}
                     className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                   />
                 </div>
                 
                 <div className="flex items-center space-x-3 pt-8">
                   <input
                     type="checkbox"
                     id="auto_renewal"
                     checked={editFormData.auto_renewal || false}
                     onChange={(e) => setEditFormData({...editFormData, auto_renewal: e.target.checked})}
                     className="w-4 h-4 text-blue-600 bg-white/5 border-white/20 rounded focus:ring-blue-500"
                   />
                   <label htmlFor="auto_renewal" className="text-white/80 text-sm font-medium">
                     Renovação Automática
                   </label>
                 </div>
               </div>
             </div>
             
             <div className="flex space-x-3 mt-6">
               <button
                 onClick={closeModals}
                 className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                 disabled={actionLoading}
               >
                 Cancelar
               </button>
               <button
                 onClick={saveSubscriptionChanges}
                 className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                 disabled={actionLoading}
               >
                 {actionLoading ? 'Salvando...' : 'Salvar Alterações'}
               </button>
             </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Alteração de Status */}
      {statusModalOpen && selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {selectedSubscription.status === 'active' ? 'Cancelar Assinatura' : 'Reativar Assinatura'}
              </h3>
              <button
                onClick={closeModals}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-white/80 mb-2">
                Tem certeza que deseja {selectedSubscription.status === 'active' ? 'cancelar' : 'reativar'} a assinatura de:
              </p>
              <p className="text-white font-medium">{selectedSubscription.user_name}</p>
              <p className="text-white/60 text-sm">{selectedSubscription.plan_name}</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={closeModals}
                className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                disabled={actionLoading}
              >
                Cancelar
              </button>
              <button
                onClick={() => updateSubscriptionStatus(
                  selectedSubscription.id, 
                  selectedSubscription.status === 'active' ? 'cancelled' : 'active'
                )}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  selectedSubscription.status === 'active' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processando...' : (selectedSubscription.status === 'active' ? 'Cancelar' : 'Reativar')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Criação de Assinatura */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Criar Nova Assinatura</h3>
              <button
                onClick={closeModals}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Email do Cliente *</label>
                <input
                  type="email"
                  value={createFormData.user_email}
                  onChange={(e) => setCreateFormData({...createFormData, user_email: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  placeholder="Digite o email do cliente"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Plano *</label>
                  <CustomSelect
                    options={[
                      { value: 'Mensal', label: 'Mensal - R$ 29,99' },
                      { value: 'Trimestral', label: 'Trimestral - R$ 79,99' },
                      { value: 'Semestral', label: 'Semestral - R$ 149,99' },
                      { value: 'Anual', label: 'Anual - R$ 279,99' }
                    ]}
                    value={createFormData.plan_name}
                    onChange={(value) => {
                      const prices = {
                        'Mensal': 29.99,
                        'Trimestral': 79.99,
                        'Semestral': 149.99,
                        'Anual': 279.99
                      }
                      setCreateFormData({
                        ...createFormData, 
                        plan_name: value,
                        price: prices[value as keyof typeof prices] || 29.99
                      })
                    }}
                    placeholder="Selecione o plano"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={createFormData.price}
                    onChange={(e) => setCreateFormData({...createFormData, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Data de Início</label>
                  <input
                    type="date"
                    value={createFormData.start_date}
                    onChange={(e) => setCreateFormData({...createFormData, start_date: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Método de Pagamento</label>
                  <CustomSelect
                    options={[
                      { value: 'credit_card', label: 'Cartão de Crédito' },
                      { value: 'pix', label: 'PIX' },
                      { value: 'boleto', label: 'Boleto' },
                      { value: 'transfer', label: 'Transferência' }
                    ]}
                    value={createFormData.payment_method}
                    onChange={(value) => setCreateFormData({...createFormData, payment_method: value})}
                    placeholder="Selecione o método"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Máximo de Dispositivos</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={createFormData.max_devices}
                    onChange={(e) => setCreateFormData({...createFormData, max_devices: parseInt(e.target.value) || 3})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div className="flex items-center space-x-3 pt-8">
                  <input
                    type="checkbox"
                    id="create_auto_renewal"
                    checked={createFormData.auto_renewal}
                    onChange={(e) => setCreateFormData({...createFormData, auto_renewal: e.target.checked})}
                    className="w-4 h-4 text-blue-600 bg-white/5 border-white/20 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="create_auto_renewal" className="text-white/80 text-sm font-medium">
                    Renovação Automática
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={closeModals}
                className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                disabled={actionLoading}
              >
                Cancelar
              </button>
              <button
                onClick={createSubscription}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                disabled={actionLoading || !createFormData.user_email || !createFormData.plan_name}
              >
                {actionLoading ? 'Criando...' : 'Criar Assinatura'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}