'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../../components/Sidebar'
import CustomSelect from '../../../components/CustomSelect'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'admin' | 'client'
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  last_login?: string
  subscription?: {
    plan_name: string
    status: string
    end_date: string
  }
}

interface CurrentUser {
  id: string
  name: string
  email: string
  role: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'client'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all')
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [editFormData, setEditFormData] = useState<Partial<User>>({})
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'client' as 'admin' | 'client',
    password: ''
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

    fetchUsers(token)
  }, [])



  const fetchUsers = async (token: string) => {
    try {
      setError('')
      // Buscando dados reais da API
      const response = await fetch('http://localhost:3001/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar usuários')
      }

      const data = await response.json()
      setUsers(data.users || [])
    } catch (err) {
      setError('Erro ao carregar usuários')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const closeModals = () => {
    setViewModalOpen(false)
    setEditModalOpen(false)
    setCreateModalOpen(false)
    setStatusModalOpen(false)
    setDeleteModalOpen(false)
    setSelectedUser(null)
    setCreateFormData({
      name: '',
      email: '',
      phone: '',
      role: 'client',
      password: ''
    })
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setViewModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      created_at: user.created_at,
      last_login: user.last_login
    })
    setEditModalOpen(true)
  }

  const handleStatusChange = (user: User) => {
    setSelectedUser(user)
    setStatusModalOpen(true)
  }

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user)
    setDeleteModalOpen(true)
  }

  const handleCreateUser = () => {
    setCreateModalOpen(true)
  }

  const createUser = async () => {
    try {
      setActionLoading(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch('http://localhost:3001/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createFormData)
      })

      if (!response.ok) {
        throw new Error('Erro ao criar usuário')
      }

      const data = await response.json()
      
      // Adicionar o novo usuário à lista
      setUsers(prev => [...prev, data.user])
      
      closeModals()
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      alert('Erro ao criar usuário')
    } finally {
      setActionLoading(false)
    }
  }

  const updateUserStatus = async (userId: string, newStatus: string) => {
    setActionLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}/status`, {
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

      // Atualizar a lista de usuários
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus as any } : user
      ))
      
      closeModals()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status do usuário')
    } finally {
      setActionLoading(false)
    }
  }

  const deleteUser = async () => {
    if (!selectedUser) return
    
    setActionLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir usuário')
      }

      // Remover o usuário da lista
      setUsers(users.filter(user => user.id !== selectedUser.id))
      
      closeModals()
      alert('Usuário excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      alert('Erro ao excluir usuário')
    } finally {
      setActionLoading(false)
    }
  }

  const saveUserChanges = async () => {
    try {
      setActionLoading(true)
      
      // Simular chamada à API para salvar alterações
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Atualizar o usuário na lista local
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === editFormData.id 
            ? { ...user, ...editFormData } as User
            : user
        )
      )
      
      closeModals()
    } catch (error) {
      console.error('Erro ao salvar alterações do usuário:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20'
      case 'inactive': return 'text-gray-400 bg-gray-500/20'
      case 'suspended': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'text-purple-400 bg-purple-500/20' : 'text-blue-400 bg-blue-500/20'
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    
    return matchesSearch && matchesRole && matchesStatus
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
          <h1 className="text-3xl font-bold text-white mb-2">Gerenciar Usuários</h1>
          <p className="text-white/60">Visualize e gerencie todos os usuários do sistema</p>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            {/* Role Filter */}
            <CustomSelect
              options={[
                { value: 'all', label: 'Todos os Tipos' },
                { value: 'admin', label: 'Administradores' },
                { value: 'client', label: 'Clientes' }
              ]}
              value={filterRole}
              onChange={(value) => setFilterRole(value as any)}
              placeholder="Filtrar por tipo"
            />
            
            {/* Status Filter */}
            <CustomSelect
              options={[
                { value: 'all', label: 'Todos os Status' },
                { value: 'active', label: 'Ativo' },
                { value: 'inactive', label: 'Inativo' },
                { value: 'suspended', label: 'Suspenso' }
              ]}
              value={filterStatus}
              onChange={(value) => setFilterStatus(value as any)}
              placeholder="Filtrar por status"
            />
            
            {/* Add User Button */}
            <button 
              onClick={handleCreateUser}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Novo Usuário</span>
            </button>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-white/80 font-medium">Usuário</th>
                  <th className="text-left p-4 text-white/80 font-medium">Tipo</th>
                  <th className="text-left p-4 text-white/80 font-medium">Status</th>
                  <th className="text-left p-4 text-white/80 font-medium">Assinatura</th>
                  <th className="text-left p-4 text-white/80 font-medium">Último Login</th>
                  <th className="text-left p-4 text-white/80 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-t border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-white/60 text-sm">{user.email}</p>
                          {user.phone && (
                            <p className="text-white/40 text-xs">{user.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role === 'admin' ? 'Admin' : 'Cliente'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status === 'active' ? 'Ativo' : user.status === 'inactive' ? 'Inativo' : 'Suspenso'}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.subscription ? (
                        <div>
                          <p className="text-white text-sm">{user.subscription.plan_name}</p>
                          <p className="text-white/60 text-xs">Até {formatDate(user.subscription.end_date)}</p>
                        </div>
                      ) : (
                        <span className="text-white/40 text-sm">Sem assinatura</span>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="text-white/80 text-sm">
                        {user.last_login ? formatDate(user.last_login) : 'Nunca'}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewUser(user)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Visualizar usuário"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                          title="Editar usuário"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {user.status === 'active' ? (
                          <button 
                            onClick={() => handleStatusChange(user)}
                            className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-colors"
                            title="Suspender usuário"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleStatusChange(user)}
                            className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                            title="Ativar usuário"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Excluir usuário"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">Nenhum usuário encontrado</p>
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Total de Usuários</p>
                <p className="text-2xl font-bold text-white">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Usuários Ativos</p>
                <p className="text-2xl font-bold text-white">{users.filter(u => u.status === 'active').length}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Clientes</p>
                <p className="text-2xl font-bold text-white">{users.filter(u => u.role === 'client').length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Administradores</p>
                <p className="text-2xl font-bold text-white">{users.filter(u => u.role === 'admin').length}</p>
              </div>
              <UserCheck className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </motion.div>
      </main>

      {/* Modal de Visualização */}
      {viewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Detalhes do Usuário</h3>
              <button
                onClick={closeModals}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <Eye className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-white/60 text-sm">Nome Completo</label>
                  <p className="text-white font-medium">{selectedUser.name}</p>
                </div>
                
                <div>
                  <label className="text-white/60 text-sm">Email</label>
                  <p className="text-white font-medium">{selectedUser.email}</p>
                </div>
                
                <div>
                  <label className="text-white/60 text-sm">Telefone</label>
                  <p className="text-white font-medium">{selectedUser.phone || 'Não informado'}</p>
                </div>
                
                <div>
                  <label className="text-white/60 text-sm">Tipo de Usuário</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                    {selectedUser.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-white/60 text-sm">Status</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                    {selectedUser.status === 'active' ? 'Ativo' : selectedUser.status === 'inactive' ? 'Inativo' : 'Suspenso'}
                  </span>
                </div>
                
                <div>
                  <label className="text-white/60 text-sm">Data de Cadastro</label>
                  <p className="text-white">{formatDate(selectedUser.created_at)}</p>
                </div>
                
                <div>
                  <label className="text-white/60 text-sm">Último Login</label>
                  <p className="text-white">{selectedUser.last_login ? formatDate(selectedUser.last_login) : 'Nunca'}</p>
                </div>
                
                {selectedUser.subscription && (
                  <div>
                    <label className="text-white/60 text-sm">Assinatura</label>
                    <p className="text-white font-medium">{selectedUser.subscription.plan_name}</p>
                    <p className="text-white/60 text-sm">Válida até {formatDate(selectedUser.subscription.end_date)}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Edição */}
      {editModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Editar Usuário</h3>
              <button
                onClick={closeModals}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <Edit className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Nome Completo</label>
                  <input
                    type="text"
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="Digite o nome completo"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="Digite o email"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Telefone</label>
                  <input
                    type="tel"
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Função</label>
                  <CustomSelect
                    options={[
                      { value: 'client', label: 'Cliente' },
                      { value: 'admin', label: 'Administrador' }
                    ]}
                    value={editFormData.role || ''}
                    onChange={(value) => setEditFormData({...editFormData, role: value as any})}
                    placeholder="Selecione a função"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Status</label>
                  <CustomSelect
                    options={[
                      { value: 'active', label: 'Ativo' },
                      { value: 'inactive', label: 'Inativo' },
                      { value: 'suspended', label: 'Suspenso' }
                    ]}
                    value={editFormData.status || ''}
                    onChange={(value) => setEditFormData({...editFormData, status: value as any})}
                    placeholder="Selecione o status"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Data de Cadastro</label>
                  <input
                    type="text"
                    value={editFormData.created_at ? formatDate(editFormData.created_at) : ''}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white/60 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Último Login</label>
                <input
                  type="text"
                  value={editFormData.last_login ? formatDate(editFormData.last_login) : 'Nunca fez login'}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white/60 cursor-not-allowed"
                  disabled
                />
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
                onClick={saveUserChanges}
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
      {statusModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {selectedUser.status === 'active' ? 'Suspender Usuário' : 'Ativar Usuário'}
              </h3>
              <button
                onClick={closeModals}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <UserX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-white/80 mb-2">
                Tem certeza que deseja {selectedUser.status === 'active' ? 'suspender' : 'ativar'} o usuário:
              </p>
              <p className="text-white font-medium">{selectedUser.name}</p>
              <p className="text-white/60 text-sm">{selectedUser.email}</p>
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
                onClick={() => updateUserStatus(
                  selectedUser.id, 
                  selectedUser.status === 'active' ? 'suspended' : 'active'
                )}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  selectedUser.status === 'active' 
                    ? 'bg-yellow-600 hover:bg-yellow-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processando...' : (selectedUser.status === 'active' ? 'Suspender' : 'Ativar')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Criação de Usuário */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Criar Novo Usuário</h3>
              <button
                onClick={closeModals}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <UserX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Nome Completo</label>
                  <input
                    type="text"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="Digite o nome completo"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData({...createFormData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="Digite o email"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Telefone</label>
                  <input
                    type="tel"
                    value={createFormData.phone}
                    onChange={(e) => setCreateFormData({...createFormData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Função</label>
                  <CustomSelect
                    options={[
                      { value: 'client', label: 'Cliente' },
                      { value: 'admin', label: 'Administrador' }
                    ]}
                    value={createFormData.role}
                    onChange={(value) => setCreateFormData({...createFormData, role: value as any})}
                    placeholder="Selecione a função"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Senha</label>
                <input
                  type="password"
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData({...createFormData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  placeholder="Digite a senha"
                />
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
                onClick={createUser}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                disabled={actionLoading || !createFormData.name || !createFormData.email || !createFormData.password}
              >
                {actionLoading ? 'Criando...' : 'Criar Usuário'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Exclusão */}
      {deleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Excluir Usuário</h3>
              <button
                onClick={closeModals}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-white/80 mb-2">
                ⚠️ Esta ação é irreversível! Tem certeza que deseja excluir o usuário:
              </p>
              <p className="text-white font-medium">{selectedUser.name}</p>
              <p className="text-white/60 text-sm">{selectedUser.email}</p>
              <p className="text-red-400 text-sm mt-2">
                Todos os dados relacionados a este usuário serão perdidos permanentemente.
              </p>
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
                onClick={deleteUser}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                disabled={actionLoading}
              >
                {actionLoading ? 'Excluindo...' : 'Excluir Permanentemente'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}