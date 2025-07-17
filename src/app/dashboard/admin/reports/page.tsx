'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Download,
  Calendar,
  DollarSign,
  Users,
  CreditCard,
  Activity,
  Filter,
  FileText,
  PieChart,
  LineChart,
  Receipt,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../../components/Sidebar'
import CustomSelect from '../../../components/CustomSelect'

interface ReportData {
  revenue: {
    total: number
    monthly: number
    growth: number
  }
  subscriptions: {
    total: number
    active: number
    new_this_month: number
    churn_rate: number
  }
  users: {
    total: number
    new_this_month: number
    active_users: number
  }
  plans: {
    name: string
    subscribers: number
    revenue: number
    percentage: number
  }[]
  monthly_revenue: {
    month: string
    revenue: number
    subscriptions: number
  }[]
  expenses: {
    total: number
    monthly: number
    categories: {
      name: string
      amount: number
      percentage: number
    }[]
  }
}

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
  type: 'fixed' | 'variable'
}

interface CurrentUser {
  id: string
  name: string
  email: string
  role: string
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedReport, setSelectedReport] = useState<'overview' | 'revenue' | 'subscriptions' | 'users' | 'expenses'>('overview')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    type: 'variable' as 'fixed' | 'variable'
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

    fetchReportData(token)
  }, [selectedPeriod])

  const fetchReportData = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar relatórios')
      }

      const data = await response.json()
      setReportData(data.reportData || {})
      
      // Set expenses from the report data
      if (data.reportData && data.reportData.expenses) {
        setExpenses(data.reportData.expenses)
      }
    } catch (err) {
      setError('Erro ao carregar relatórios')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const getPeriodText = (period: string) => {
    switch (period) {
      case '7d': return 'Últimos 7 dias'
      case '30d': return 'Últimos 30 dias'
      case '90d': return 'Últimos 90 dias'
      case '1y': return 'Último ano'
      default: return 'Últimos 30 dias'
    }
  }

  const exportReport = (type: 'pdf' | 'excel') => {
    // Simulação de exportação
    alert(`Exportando relatório em ${type.toUpperCase()}...`)
  }

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.category) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const url = editingExpense 
        ? `http://localhost:3001/api/admin/expenses/${editingExpense.id}`
        : 'http://localhost:3001/api/admin/expenses'
      
      const method = editingExpense ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          category: newExpense.category,
          date: newExpense.date,
          type: newExpense.type,
          notes: ''
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao salvar despesa')
      }

      const data = await response.json()
      
      if (editingExpense) {
        setExpenses(expenses.map(exp => exp.id === editingExpense.id ? data.expense : exp))
        setEditingExpense(null)
      } else {
        setExpenses([...expenses, data.expense])
      }

      setNewExpense({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        type: 'variable'
      })
      setShowExpenseForm(false)
      
      alert(data.message || 'Despesa salva com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar despesa:', error)
      alert(error instanceof Error ? error.message : 'Erro ao salvar despesa')
    }
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setNewExpense({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
      type: expense.type
    })
    setShowExpenseForm(true)
  }

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`http://localhost:3001/api/admin/expenses/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Erro ao excluir despesa')
        }

        const data = await response.json()
        setExpenses(expenses.filter(exp => exp.id !== id))
        alert(data.message || 'Despesa excluída com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir despesa:', error)
        alert(error instanceof Error ? error.message : 'Erro ao excluir despesa')
      }
    }
  }

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0)
  }

  const getExpensesByCategory = () => {
    const categories: { [key: string]: number } = {}
    expenses.forEach(expense => {
      categories[expense.category] = (categories[expense.category] || 0) + expense.amount
    })
    return Object.entries(categories).map(([name, amount]) => ({
      name,
      amount,
      percentage: (amount / getTotalExpenses()) * 100
    }))
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
            onClick={() => router.push('/dashboard/admin')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!reportData) return null

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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Relatórios e Análises</h1>
              <p className="text-white/60">Acompanhe o desempenho do seu negócio</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <CustomSelect
                options={[
                  { value: '7d', label: 'Últimos 7 dias' },
                  { value: '30d', label: 'Últimos 30 dias' },
                  { value: '90d', label: 'Últimos 90 dias' },
                  { value: '1y', label: 'Último ano' }
                ]}
                value={selectedPeriod}
                onChange={(value) => setSelectedPeriod(value as any)}
                placeholder="Selecione o período"
                className="min-w-[180px]"
              />
              <button 
                onClick={() => exportReport('pdf')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
              <button 
                onClick={() => exportReport('excel')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Report Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
              { id: 'revenue', label: 'Receita', icon: DollarSign },
              { id: 'subscriptions', label: 'Assinaturas', icon: CreditCard },
              { id: 'users', label: 'Usuários', icon: Users },
              { id: 'expenses', label: 'Despesas', icon: Receipt }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedReport(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    selectedReport === tab.id
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

        {/* Overview Report */}
        {selectedReport === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-green-400" />
                  <span className="text-green-400 text-sm font-medium flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +{reportData.revenue.growth}%
                  </span>
                </div>
                <h3 className="text-white/80 text-sm font-medium mb-1">Receita Total</h3>
                <p className="text-2xl font-bold text-white">{formatCurrency(reportData.revenue.total)}</p>
                <p className="text-white/60 text-sm mt-1">{formatCurrency(reportData.revenue.monthly)} este mês</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <CreditCard className="w-8 h-8 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">
                    {reportData.subscriptions.new_this_month} novas
                  </span>
                </div>
                <h3 className="text-white/80 text-sm font-medium mb-1">Assinaturas</h3>
                <p className="text-2xl font-bold text-white">{reportData.subscriptions.active}</p>
                <p className="text-white/60 text-sm mt-1">de {reportData.subscriptions.total} total</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-purple-400" />
                  <span className="text-purple-400 text-sm font-medium">
                    +{reportData.users.new_this_month} novos
                  </span>
                </div>
                <h3 className="text-white/80 text-sm font-medium mb-1">Usuários Ativos</h3>
                <p className="text-2xl font-bold text-white">{reportData.users.active_users}</p>
                <p className="text-white/60 text-sm mt-1">de {reportData.users.total} total</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <Activity className="w-8 h-8 text-red-400" />
                  <span className="text-red-400 text-sm font-medium">
                    {reportData.subscriptions.churn_rate}% churn
                  </span>
                </div>
                <h3 className="text-white/80 text-sm font-medium mb-1">Taxa de Retenção</h3>
                <p className="text-2xl font-bold text-white">{(100 - reportData.subscriptions.churn_rate).toFixed(1)}%</p>
                <p className="text-white/60 text-sm mt-1">nos últimos 30 dias</p>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Evolução da Receita</h3>
                  <LineChart className="w-6 h-6 text-blue-400" />
                </div>
                <div className="space-y-4">
                  {reportData.monthly_revenue.map((item, index) => (
                    <div key={item.month} className="flex items-center justify-between">
                      <span className="text-white/80">{item.month}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-white font-medium">{formatCurrency(item.revenue)}</span>
                        <div className="w-32 bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${(item.revenue / Math.max(...reportData.monthly_revenue.map(r => r.revenue))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Plans Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Distribuição por Plano</h3>
                  <PieChart className="w-6 h-6 text-green-400" />
                </div>
                <div className="space-y-4">
                  {reportData.plans.map((plan, index) => {
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500']
                    return (
                      <div key={plan.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${colors[index]}`}></div>
                            <span className="text-white">{plan.name}</span>
                          </div>
                          <span className="text-white/80">{plan.percentage}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">{plan.subscribers} assinantes</span>
                          <span className="text-white/60">{formatCurrency(plan.revenue)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Revenue Report */}
        {selectedReport === 'revenue' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Relatório de Receita - {getPeriodText(selectedPeriod)}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <p className="text-white/60 text-sm mb-2">Receita Total</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(reportData.revenue.total)}</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-sm mb-2">Receita Mensal</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(reportData.revenue.monthly)}</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-sm mb-2">Crescimento</p>
                <p className="text-3xl font-bold text-green-400">+{reportData.revenue.growth}%</p>
              </div>
            </div>
            <div className="text-center text-white/60">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Gráficos detalhados de receita serão implementados em breve</p>
            </div>
          </motion.div>
        )}

        {/* Subscriptions Report */}
        {selectedReport === 'subscriptions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Relatório de Assinaturas - {getPeriodText(selectedPeriod)}</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <p className="text-white/60 text-sm mb-2">Total</p>
                <p className="text-3xl font-bold text-white">{reportData.subscriptions.total}</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-sm mb-2">Ativas</p>
                <p className="text-3xl font-bold text-green-400">{reportData.subscriptions.active}</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-sm mb-2">Novas este mês</p>
                <p className="text-3xl font-bold text-blue-400">{reportData.subscriptions.new_this_month}</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-sm mb-2">Taxa de Churn</p>
                <p className="text-3xl font-bold text-red-400">{reportData.subscriptions.churn_rate}%</p>
              </div>
            </div>
            <div className="text-center text-white/60">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Análises detalhadas de assinaturas serão implementadas em breve</p>
            </div>
          </motion.div>
        )}

        {/* Users Report */}
        {selectedReport === 'users' && (
          <div className="space-y-6">
            {/* User Metrics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">
                    +{reportData.users.new_this_month} novos
                  </span>
                </div>
                <h3 className="text-white/80 text-sm font-medium mb-1">Total de Usuários</h3>
                <p className="text-2xl font-bold text-white">{reportData.users.total}</p>
                <p className="text-white/60 text-sm mt-1">desde o início</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <Activity className="w-8 h-8 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">
                    {((reportData.users.active_users / reportData.users.total) * 100).toFixed(1)}%
                  </span>
                </div>
                <h3 className="text-white/80 text-sm font-medium mb-1">Usuários Ativos</h3>
                <p className="text-2xl font-bold text-white">{reportData.users.active_users}</p>
                <p className="text-white/60 text-sm mt-1">últimos 30 dias</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                  <span className="text-purple-400 text-sm font-medium">
                    +{Math.round((reportData.users.new_this_month / (reportData.users.total - reportData.users.new_this_month)) * 100)}%
                  </span>
                </div>
                <h3 className="text-white/80 text-sm font-medium mb-1">Crescimento Mensal</h3>
                <p className="text-2xl font-bold text-white">{reportData.users.new_this_month}</p>
                <p className="text-white/60 text-sm mt-1">novos usuários</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="w-8 h-8 text-orange-400" />
                  <span className="text-orange-400 text-sm font-medium">
                    {Math.round(reportData.users.active_users / 30)} /dia
                  </span>
                </div>
                <h3 className="text-white/80 text-sm font-medium mb-1">Média Diária</h3>
                <p className="text-2xl font-bold text-white">{Math.round(reportData.users.active_users / 30)}</p>
                <p className="text-white/60 text-sm mt-1">usuários ativos</p>
              </motion.div>
            </div>

            {/* User Growth Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Crescimento de Usuários</h3>
                <LineChart className="w-6 h-6 text-blue-400" />
              </div>
              <div className="space-y-4">
                {[
                  { month: 'Jan', users: Math.round(reportData.users.total * 0.6), new_users: Math.round(reportData.users.new_this_month * 0.8) },
                  { month: 'Fev', users: Math.round(reportData.users.total * 0.7), new_users: Math.round(reportData.users.new_this_month * 0.9) },
                  { month: 'Mar', users: Math.round(reportData.users.total * 0.8), new_users: Math.round(reportData.users.new_this_month * 1.1) },
                  { month: 'Abr', users: Math.round(reportData.users.total * 0.9), new_users: Math.round(reportData.users.new_this_month * 1.2) },
                  { month: 'Mai', users: reportData.users.total, new_users: reportData.users.new_this_month }
                ].map((item, index) => (
                  <div key={item.month} className="flex items-center justify-between">
                    <span className="text-white/80 w-12">{item.month}</span>
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-sm">Total: {item.users}</span>
                          <span className="text-blue-400 text-sm">+{item.new_users} novos</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${(item.users / reportData.users.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* User Activity and Engagement */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Activity Patterns */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Padrões de Atividade</h3>
                  <BarChart3 className="w-6 h-6 text-green-400" />
                </div>
                <div className="space-y-4">
                  {[
                    { period: 'Manhã (6h-12h)', users: Math.round(reportData.users.active_users * 0.3), percentage: 30 },
                    { period: 'Tarde (12h-18h)', users: Math.round(reportData.users.active_users * 0.4), percentage: 40 },
                    { period: 'Noite (18h-24h)', users: Math.round(reportData.users.active_users * 0.25), percentage: 25 },
                    { period: 'Madrugada (0h-6h)', users: Math.round(reportData.users.active_users * 0.05), percentage: 5 }
                  ].map((item, index) => {
                    const colors = ['bg-yellow-500', 'bg-orange-500', 'bg-blue-500', 'bg-purple-500']
                    return (
                      <div key={item.period} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${colors[index]}`}></div>
                            <span className="text-white">{item.period}</span>
                          </div>
                          <span className="text-white/80">{item.percentage}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">{item.users} usuários</span>
                          <div className="w-32 bg-white/20 rounded-full h-2">
                            <div 
                              className={`${colors[index]} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>

              {/* User Engagement Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Métricas de Engajamento</h3>
                  <PieChart className="w-6 h-6 text-purple-400" />
                </div>
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-white/60 text-sm mb-2">Taxa de Retenção (30 dias)</p>
                    <p className="text-3xl font-bold text-green-400">78.5%</p>
                    <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '78.5%' }}></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-white/60 text-sm mb-1">Sessão Média</p>
                      <p className="text-xl font-bold text-white">24min</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/60 text-sm mb-1">Páginas/Sessão</p>
                      <p className="text-xl font-bold text-white">3.2</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Usuários Diários</span>
                      <span className="text-white font-medium">{Math.round(reportData.users.active_users * 0.4)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Usuários Semanais</span>
                      <span className="text-white font-medium">{Math.round(reportData.users.active_users * 0.7)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Usuários Mensais</span>
                      <span className="text-white font-medium">{reportData.users.active_users}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* User Demographics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Demografia dos Usuários</h3>
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Age Groups */}
                <div>
                  <h4 className="text-white font-medium mb-4">Faixa Etária</h4>
                  <div className="space-y-3">
                    {[
                      { range: '18-25', percentage: 25, color: 'bg-blue-500' },
                      { range: '26-35', percentage: 35, color: 'bg-green-500' },
                      { range: '36-45', percentage: 25, color: 'bg-yellow-500' },
                      { range: '46+', percentage: 15, color: 'bg-purple-500' }
                    ].map((age) => (
                      <div key={age.range} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${age.color}`}></div>
                          <span className="text-white/80 text-sm">{age.range} anos</span>
                        </div>
                        <span className="text-white text-sm">{age.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Device Types */}
                <div>
                  <h4 className="text-white font-medium mb-4">Dispositivos</h4>
                  <div className="space-y-3">
                    {[
                      { device: 'Mobile', percentage: 60, color: 'bg-blue-500' },
                      { device: 'Desktop', percentage: 30, color: 'bg-green-500' },
                      { device: 'Tablet', percentage: 10, color: 'bg-yellow-500' }
                    ].map((device) => (
                      <div key={device.device} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${device.color}`}></div>
                          <span className="text-white/80 text-sm">{device.device}</span>
                        </div>
                        <span className="text-white text-sm">{device.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Regions */}
                <div>
                  <h4 className="text-white font-medium mb-4">Principais Regiões</h4>
                  <div className="space-y-3">
                    {[
                      { region: 'São Paulo', percentage: 35, color: 'bg-blue-500' },
                      { region: 'Rio de Janeiro', percentage: 20, color: 'bg-green-500' },
                      { region: 'Minas Gerais', percentage: 15, color: 'bg-yellow-500' },
                      { region: 'Outros', percentage: 30, color: 'bg-purple-500' }
                    ].map((region) => (
                      <div key={region.region} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${region.color}`}></div>
                          <span className="text-white/80 text-sm">{region.region}</span>
                        </div>
                        <span className="text-white text-sm">{region.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Expenses Report */}
        {selectedReport === 'expenses' && (
          <div className="space-y-6">
            {/* Expenses Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <h3 className="text-xl font-semibold text-white mb-4 lg:mb-0">Gestão de Despesas - {getPeriodText(selectedPeriod)}</h3>
              <button
                onClick={() => {
                  setEditingExpense(null)
                  setNewExpense({
                    description: '',
                    amount: '',
                    category: '',
                    date: new Date().toISOString().split('T')[0],
                    type: 'variable'
                  })
                  setShowExpenseForm(true)
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Despesa</span>
              </button>
            </div>

            {/* Expenses Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <Receipt className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-white/80 text-sm font-medium mb-1">Total de Despesas</h3>
                <p className="text-2xl font-bold text-white">{formatCurrency(getTotalExpenses())}</p>
                <p className="text-white/60 text-sm mt-1">{expenses.length} despesas registradas</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <Activity className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-white/80 text-sm font-medium mb-1">Despesas Fixas</h3>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(expenses.filter(e => e.type === 'fixed').reduce((sum, e) => sum + e.amount, 0))}
                </p>
                <p className="text-white/60 text-sm mt-1">{expenses.filter(e => e.type === 'fixed').length} despesas</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-white/80 text-sm font-medium mb-1">Despesas Variáveis</h3>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(expenses.filter(e => e.type === 'variable').reduce((sum, e) => sum + e.amount, 0))}
                </p>
                <p className="text-white/60 text-sm mt-1">{expenses.filter(e => e.type === 'variable').length} despesas</p>
              </motion.div>
            </div>

            {/* Expense Form Modal */}
            {showExpenseForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowExpenseForm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 w-full max-w-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h4 className="text-xl font-semibold text-white mb-6">
                    {editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Descrição</label>
                      <input
                        type="text"
                        value={newExpense.description}
                        onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Hospedagem do servidor"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Valor</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0,00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Categoria</label>
                      <CustomSelect
                        options={[
                          { value: 'Infraestrutura', label: 'Infraestrutura' },
                          { value: 'Marketing', label: 'Marketing' },
                          { value: 'Pessoal', label: 'Pessoal' },
                          { value: 'Operacional', label: 'Operacional' },
                          { value: 'Licenças', label: 'Licenças' },
                          { value: 'Outros', label: 'Outros' }
                        ]}
                        value={newExpense.category}
                        onChange={(value) => setNewExpense({...newExpense, category: value})}
                        placeholder="Selecione uma categoria"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Data</label>
                      <input
                        type="date"
                        value={newExpense.date}
                        onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Tipo</label>
                      <CustomSelect
                        options={[
                          { value: 'variable', label: 'Variável' },
                          { value: 'fixed', label: 'Fixa' }
                        ]}
                        value={newExpense.type}
                        onChange={(value) => setNewExpense({...newExpense, type: value as 'fixed' | 'variable'})}
                        placeholder="Selecione o tipo"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={() => setShowExpenseForm(false)}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddExpense}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingExpense ? 'Atualizar' : 'Adicionar'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Expenses List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <h4 className="text-lg font-semibold text-white mb-4">Lista de Despesas</h4>
              
              {expenses.length === 0 ? (
                <div className="text-center text-white/60 py-8">
                  <Receipt className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma despesa registrada ainda</p>
                  <p className="text-sm mt-2">Clique em "Nova Despesa" para começar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            expense.type === 'fixed' ? 'bg-orange-500' : 'bg-blue-500'
                          }`}></div>
                          <div>
                            <h5 className="text-white font-medium">{expense.description}</h5>
                            <p className="text-white/60 text-sm">
                              {expense.category} • {new Date(expense.date).toLocaleDateString('pt-BR')} • 
                              <span className="capitalize">{expense.type === 'fixed' ? 'Fixa' : 'Variável'}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-white font-semibold">{formatCurrency(expense.amount)}</span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="p-2 text-blue-400 hover:bg-blue-400/20 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Expenses by Category */}
            {expenses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <h4 className="text-lg font-semibold text-white mb-4">Despesas por Categoria</h4>
                <div className="space-y-4">
                  {getExpensesByCategory().map((category, index) => {
                    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500']
                    return (
                      <div key={category.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                            <span className="text-white">{category.name}</span>
                          </div>
                          <span className="text-white/80">{category.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">{formatCurrency(category.amount)}</span>
                          <div className="w-32 bg-white/20 rounded-full h-2">
                            <div 
                              className={`${colors[index % colors.length]} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${category.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}