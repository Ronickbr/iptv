'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Save,
  Eye,
  EyeOff,
  Bell,
  Shield,
  Database,
  Mail,
  Smartphone,
  Globe,
  CreditCard,
  Users,
  Server,
  Lock,
  Key,
  AlertTriangle,
  Check
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../../components/Sidebar'
import CustomSelect from '../../../components/CustomSelect'

interface SystemSettings {
  subscription: {
    trial_days: number
    max_devices: number
    auto_renewal: boolean
    grace_period_days: number
  }
  payment: {
    currency: string
    tax_rate: number
    payment_methods: string[]
    webhook_url: string
  }
  notifications: {
    email_enabled: boolean
    sms_enabled: boolean
    push_enabled: boolean
    admin_notifications: boolean
  }
  security: {
    password_min_length: number
    require_2fa: boolean
    session_timeout: number
    max_login_attempts: number
  }
  plans: {
    monthly_price: number
    quarterly_price: number
    quarterly_discount: number
    semiannual_price: number
    semiannual_discount: number
    annual_price: number
    annual_discount: number
  }
  downloads: {
    android_app_url: string
    ios_app_url: string
    windows_app_url: string
    mac_app_url: string
    smart_tv_guide_url: string
  }
  branding: {
    primary_color: string
    secondary_color: string
    footer_text: string
    social_facebook: string
    social_instagram: string
    social_twitter: string
    social_youtube: string
  }
}

interface CurrentUser {
  id: string
  name: string
  email: string
  role: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'subscription' | 'payment' | 'notifications' | 'security' | 'plans' | 'downloads' | 'branding'>('subscription')
  const [showApiKey, setShowApiKey] = useState(false)
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

    fetchSettings(token)
  }, [])

  const fetchSettings = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar configurações')
      }

      const data = await response.json()
      setSettings(data.settings || {})
    } catch (err) {
      setError('Erro ao carregar configurações')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const handleSave = async () => {
    if (!settings) return
    
    setSaving(true)
    setError('')
    setSuccess('')
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('http://localhost:3001/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ settings })
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar configurações')
      }

      setSuccess('Configurações salvas com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (section: keyof SystemSettings, field: string, value: any) => {
    if (!settings) return
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    })
  }

  const tabs = [
    { id: 'subscription', label: 'Assinaturas', icon: CreditCard },
    { id: 'payment', label: 'Pagamentos', icon: CreditCard },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'plans', label: 'Planos', icon: CreditCard },
    { id: 'downloads', label: 'Downloads', icon: Smartphone },
    { id: 'branding', label: 'Marca', icon: Settings }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error && !settings) {
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

  if (!settings) return null

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
              <h1 className="text-3xl font-bold text-white mb-2">Configurações do Sistema</h1>
              <p className="text-white/60">Gerencie as configurações da plataforma</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-4 lg:mt-0 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
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
          <div className="flex flex-wrap gap-2 bg-white/10 rounded-lg p-1">
            {tabs.map((tab) => {
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
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Settings Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
        >
          {/* Subscription Settings */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Configurações de Assinatura</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Dias de Teste Grátis</label>
                  <input
                    type="number"
                    value={settings.subscription.trial_days}
                    onChange={(e) => updateSettings('subscription', 'trial_days', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Máximo de Dispositivos</label>
                  <input
                    type="number"
                    value={settings.subscription.max_devices}
                    onChange={(e) => updateSettings('subscription', 'max_devices', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Período de Carência (dias)</label>
                  <input
                    type="number"
                    value={settings.subscription.grace_period_days}
                    onChange={(e) => updateSettings('subscription', 'grace_period_days', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="auto_renewal"
                  checked={settings.subscription.auto_renewal}
                  onChange={(e) => updateSettings('subscription', 'auto_renewal', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white/5 border-white/20 rounded focus:ring-blue-500"
                />
                <label htmlFor="auto_renewal" className="text-white/80">Renovação Automática Habilitada por Padrão</label>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Configurações de Pagamento</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Moeda</label>
                  <CustomSelect
                    options={[
                      { value: 'BRL', label: 'Real Brasileiro (BRL)' },
                      { value: 'USD', label: 'Dólar Americano (USD)' },
                      { value: 'EUR', label: 'Euro (EUR)' }
                    ]}
                    value={settings.payment.currency}
                    onChange={(value) => updateSettings('payment', 'currency', value)}
                    placeholder="Selecione a moeda"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Taxa de Imposto (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.payment.tax_rate}
                    onChange={(e) => updateSettings('payment', 'tax_rate', parseFloat(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">URL do Webhook</label>
                <input
                  type="url"
                  value={settings.payment.webhook_url}
                  onChange={(e) => updateSettings('payment', 'webhook_url', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-3">Métodos de Pagamento Habilitados</label>
                <div className="space-y-2">
                  {[
                    { id: 'credit_card', label: 'Cartão de Crédito' },
                    { id: 'pix', label: 'PIX' },
                    { id: 'boleto', label: 'Boleto Bancário' },
                    { id: 'paypal', label: 'PayPal' }
                  ].map((method) => (
                    <div key={method.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={method.id}
                        checked={settings.payment.payment_methods.includes(method.id)}
                        onChange={(e) => {
                          const methods = e.target.checked
                            ? [...settings.payment.payment_methods, method.id]
                            : settings.payment.payment_methods.filter(m => m !== method.id)
                          updateSettings('payment', 'payment_methods', methods)
                        }}
                        className="w-4 h-4 text-blue-600 bg-white/5 border-white/20 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={method.id} className="text-white/80">{method.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Configurações de Notificações</h3>
              
              <div className="space-y-4">
                {[
                  { key: 'email_enabled', label: 'Notificações por Email', icon: Mail },
                  { key: 'sms_enabled', label: 'Notificações por SMS', icon: Smartphone },
                  { key: 'push_enabled', label: 'Notificações Push', icon: Bell },
                  { key: 'admin_notifications', label: 'Notificações para Administradores', icon: Users }
                ].map((notification) => {
                  const Icon = notification.icon
                  return (
                    <div key={notification.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-blue-400" />
                        <span className="text-white">{notification.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications[notification.key as keyof typeof settings.notifications] as boolean}
                        onChange={(e) => updateSettings('notifications', notification.key, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-white/5 border-white/20 rounded focus:ring-blue-500"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Configurações de Segurança</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Tamanho Mínimo da Senha</label>
                  <input
                    type="number"
                    value={settings.security.password_min_length}
                    onChange={(e) => updateSettings('security', 'password_min_length', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Timeout da Sessão (horas)</label>
                  <input
                    type="number"
                    value={settings.security.session_timeout}
                    onChange={(e) => updateSettings('security', 'session_timeout', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Máximo de Tentativas de Login</label>
                  <input
                    type="number"
                    value={settings.security.max_login_attempts}
                    onChange={(e) => updateSettings('security', 'max_login_attempts', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="require_2fa"
                  checked={settings.security.require_2fa}
                  onChange={(e) => updateSettings('security', 'require_2fa', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white/5 border-white/20 rounded focus:ring-blue-500"
                />
                <label htmlFor="require_2fa" className="text-white/80">Exigir Autenticação de Dois Fatores</label>
              </div>
              
              <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Key className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-medium">Chave da API</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value="sk-1234567890abcdef1234567890abcdef"
                    readOnly
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="p-2 text-white/60 hover:text-white transition-colors"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Plans Settings */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Configurações de Planos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Preço Mensal (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.plans.monthly_price}
                    onChange={(e) => updateSettings('plans', 'monthly_price', parseFloat(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Preço Trimestral (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.plans.quarterly_price}
                    onChange={(e) => updateSettings('plans', 'quarterly_price', parseFloat(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Desconto Trimestral (%)</label>
                  <input
                    type="number"
                    value={settings.plans.quarterly_discount}
                    onChange={(e) => updateSettings('plans', 'quarterly_discount', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Preço Semestral (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.plans.semiannual_price}
                    onChange={(e) => updateSettings('plans', 'semiannual_price', parseFloat(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Desconto Semestral (%)</label>
                  <input
                    type="number"
                    value={settings.plans.semiannual_discount}
                    onChange={(e) => updateSettings('plans', 'semiannual_discount', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Preço Anual (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.plans.annual_price}
                    onChange={(e) => updateSettings('plans', 'annual_price', parseFloat(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Desconto Anual (%)</label>
                  <input
                    type="number"
                    value={settings.plans.annual_discount}
                    onChange={(e) => updateSettings('plans', 'annual_discount', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Downloads Settings */}
          {activeTab === 'downloads' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Links de Download</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">App Android (Google Play)</label>
                  <input
                    type="url"
                    value={settings.downloads.android_app_url}
                    onChange={(e) => updateSettings('downloads', 'android_app_url', e.target.value)}
                    placeholder="https://play.google.com/store/apps/details?id=..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">App iOS (App Store)</label>
                  <input
                    type="url"
                    value={settings.downloads.ios_app_url}
                    onChange={(e) => updateSettings('downloads', 'ios_app_url', e.target.value)}
                    placeholder="https://apps.apple.com/app/..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">App Windows</label>
                  <input
                    type="url"
                    value={settings.downloads.windows_app_url}
                    onChange={(e) => updateSettings('downloads', 'windows_app_url', e.target.value)}
                    placeholder="https://exemplo.com/download/windows-app.exe"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">App macOS</label>
                  <input
                    type="url"
                    value={settings.downloads.mac_app_url}
                    onChange={(e) => updateSettings('downloads', 'mac_app_url', e.target.value)}
                    placeholder="https://exemplo.com/download/mac-app.dmg"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Guia Smart TV</label>
                  <input
                    type="url"
                    value={settings.downloads.smart_tv_guide_url}
                    onChange={(e) => updateSettings('downloads', 'smart_tv_guide_url', e.target.value)}
                    placeholder="https://exemplo.com/guia-smart-tv.pdf"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Branding Settings */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Configurações de Marca</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Cor Primária</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={settings.branding.primary_color}
                      onChange={(e) => updateSettings('branding', 'primary_color', e.target.value)}
                      className="w-12 h-12 rounded border border-white/20 bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.branding.primary_color}
                      onChange={(e) => updateSettings('branding', 'primary_color', e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Cor Secundária</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={settings.branding.secondary_color}
                      onChange={(e) => updateSettings('branding', 'secondary_color', e.target.value)}
                      className="w-12 h-12 rounded border border-white/20 bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.branding.secondary_color}
                      onChange={(e) => updateSettings('branding', 'secondary_color', e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Texto do Rodapé</label>
                <textarea
                  value={settings.branding.footer_text}
                  onChange={(e) => updateSettings('branding', 'footer_text', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="© 2024 Sua Empresa. Todos os direitos reservados."
                />
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white">Redes Sociais</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Facebook</label>
                    <input
                      type="url"
                      value={settings.branding.social_facebook}
                      onChange={(e) => updateSettings('branding', 'social_facebook', e.target.value)}
                      placeholder="https://facebook.com/suaempresa"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Instagram</label>
                    <input
                      type="url"
                      value={settings.branding.social_instagram}
                      onChange={(e) => updateSettings('branding', 'social_instagram', e.target.value)}
                      placeholder="https://instagram.com/suaempresa"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Twitter</label>
                    <input
                      type="url"
                      value={settings.branding.social_twitter}
                      onChange={(e) => updateSettings('branding', 'social_twitter', e.target.value)}
                      placeholder="https://twitter.com/suaempresa"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">YouTube</label>
                    <input
                      type="url"
                      value={settings.branding.social_youtube}
                      onChange={(e) => updateSettings('branding', 'social_youtube', e.target.value)}
                      placeholder="https://youtube.com/suaempresa"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}