'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Layout,
  Save,
  Image as ImageIcon,
  Phone,
  Mail,
  Globe,
  MapPin,
  Clock,
  Users,
  Star,
  Tv,
  Shield,
  Check,
  X,
  AlertTriangle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../../components/Sidebar'

interface LandingPageSettings {
  site: {
    title: string
    description: string
  }
  logo: {
    url: string
    alt: string
    width: number
    height: number
  }
  contact: {
    email: string
    phone: string
    whatsapp: string
    address: string
    business_hours: string
  }
  hero: {
    title: string
    subtitle: string
    description: string
    cta_primary: string
    cta_secondary: string
    background_video?: string
  }
  stats: {
    clients: string
    uptime: string
    channels: string
    support: string
  }
  features: {
    title: string
    subtitle: string
    items: Array<{
      title: string
      description: string
      icon: string
    }>
  }
  plans: {
    title: string
    subtitle: string
    monthly: {
      name: string
      price: string
      features: string[]
    }
    quarterly: {
      name: string
      price: string
      originalPrice: string
      discount: string
      features: string[]
    }
    semiannual: {
      name: string
      price: string
      originalPrice: string
      discount: string
      features: string[]
    }
    annual: {
      name: string
      price: string
      originalPrice: string
      discount: string
      features: string[]
    }
  }
  footer: {
    company_name: string
    description: string
    copyright: string
    social: {
      facebook?: string
      instagram?: string
      twitter?: string
      youtube?: string
    }
    links: {
      product: Array<{ name: string; url: string }>
      support: Array<{ name: string; url: string }>
      company: Array<{ name: string; url: string }>
    }
  }
}

interface CurrentUser {
  id: string
  name: string
  email: string
  role: string
}

export default function LandingPageManagement() {
  const [settings, setSettings] = useState<LandingPageSettings | null>(null)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'site' | 'logo' | 'contact' | 'hero' | 'stats' | 'features' | 'plans' | 'footer'>('site')
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
      // Carregar configurações do localStorage ou API
      const savedSettings = localStorage.getItem('landingPageSettings')
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings)
        // Verificar se as configurações têm o campo 'site', se não, adicionar
        if (!parsedSettings.site) {
          parsedSettings.site = {
            title: 'IPTV Manager',
            description: 'Sistema de Gerenciamento de IPTV'
          }
        }
        setSettings(parsedSettings)
      } else {
        // Configurações padrão
        setSettings({
          site: {
            title: 'IPTV Manager',
            description: 'Sistema de Gerenciamento de IPTV'
          },
          logo: {
            url: 'https://i.imgur.com/E08eWYX.png',
            alt: 'IPTV Manager',
            width: 140,
            height: 46
          },
          contact: {
            email: 'contato@iptvmanager.com',
            phone: '+55 (11) 99999-9999',
            whatsapp: '+55 (11) 99999-9999',
            address: 'São Paulo, SP - Brasil',
            business_hours: '24/7 - Suporte sempre disponível'
          },
          hero: {
            title: 'O Futuro da TV está',
            subtitle: 'Nas Suas Mãos',
            description: 'Acesse milhares de canais em alta definição, filmes, séries e conteúdo exclusivo. Tudo isso com a melhor qualidade e preço do mercado.',
            cta_primary: 'Começar Teste Grátis',
            cta_secondary: 'Ver Demonstração'
          },
          stats: {
            clients: '50K+',
            uptime: '99.9%',
            channels: '1500+',
            support: '24/7'
          },
          features: {
            title: 'Por que escolher nosso serviço?',
            subtitle: 'Oferecemos a melhor experiência em entretenimento digital',
            items: [
              {
                title: 'Canais Premium',
                description: 'Acesso a mais de 1000 canais em alta definição',
                icon: 'tv'
              },
              {
                title: 'Streaming Global',
                description: 'Assista de qualquer lugar do mundo',
                icon: 'globe'
              },
              {
                title: 'Multi-dispositivos',
                description: 'Compatível com TV, celular, tablet e computador',
                icon: 'smartphone'
              },
              {
                title: 'Segurança Total',
                description: 'Conexão criptografada e dados protegidos',
                icon: 'shield'
              },
              {
                title: 'Velocidade Máxima',
                description: 'Streaming sem travamentos em FullHD',
                icon: 'zap'
              },
              {
                title: 'Suporte 24/7',
                description: 'Atendimento especializado sempre disponível',
                icon: 'users'
              }
            ]
          },
          plans: {
            title: 'Escolha o plano ideal para você',
            subtitle: 'Preços justos e transparentes, sem surpresas',
            monthly: {
              name: 'Mensal',
              price: 'R$ 35,00',
              features: [
                '1500+ canais',
                'Qualidade FullHD',
                '2 dispositivos simultâneos',
                'Suporte 24/7',
                'Canais internacionais',
                'Conteúdo premium'
              ]
            },
            quarterly: {
              name: 'Trimestral',
              price: 'R$ 99,00',
              originalPrice: 'R$ 105,00',
              discount: '6%',
              features: [
                '1500+ canais',
                'Qualidade FullHD',
                '2 dispositivos simultâneos',
                'Suporte 24/7',
                'Canais internacionais',
                'Conteúdo premium',
                'Economia de R$ 6,00'
              ]
            },
            semiannual: {
              name: 'Semestral',
              price: 'R$ 180,00',
              originalPrice: 'R$ 210,00',
              discount: '14%',
              features: [
                '1500+ canais',
                'Qualidade FullHD',
                '2 dispositivos simultâneos',
                'Suporte 24/7',
                'Canais internacionais',
                'Conteúdo premium',
                'Economia de R$ 30,00'
              ]
            },
            annual: {
              name: 'Anual',
              price: 'R$ 300,00',
              originalPrice: 'R$ 420,00',
              discount: '29%',
              features: [
                '1500+ canais',
                'Qualidade FullHD',
                '2 dispositivos simultâneos',
                'Suporte 24/7',
                'Canais internacionais',
                'Conteúdo premium',
                'Economia de R$ 120,00'
              ]
            }
          },
          footer: {
            company_name: 'IPTV Manager',
            description: 'A melhor plataforma de IPTV do Brasil. Entretenimento de qualidade ao seu alcance.',
            copyright: '2024 IPTV Manager. Todos os direitos reservados.',
            social: {
              facebook: 'https://facebook.com/iptvmanager',
              instagram: 'https://instagram.com/iptvmanager',
              twitter: 'https://twitter.com/iptvmanager',
              youtube: 'https://youtube.com/iptvmanager'
            },
            links: {
              product: [
                { name: 'Recursos', url: '#features' },
                { name: 'Planos', url: '#plans' },
                { name: 'Preços', url: '#pricing' },
                { name: 'API', url: '#api' }
              ],
              support: [
                { name: 'Central de Ajuda', url: '#help' },
                { name: 'Contato', url: '#contact' },
                { name: 'Status', url: '#status' },
                { name: 'Documentação', url: '#docs' }
              ],
              company: [
                { name: 'Sobre', url: '#about' },
                { name: 'Blog', url: '#blog' },
                { name: 'Carreiras', url: '#careers' },
                { name: 'Privacidade', url: '#privacy' }
              ]
            }
          }
        })
      }
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
      // Salvar no localStorage
      localStorage.setItem('landingPageSettings', JSON.stringify(settings))
      
      // Tentar salvar na API
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await fetch('http://localhost:3001/api/admin/landing-page', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ settings })
          })
          
          if (!response.ok) {
            console.warn('Erro ao salvar na API, mas salvo localmente')
          }
        } catch (apiError) {
          console.warn('API não disponível, salvo apenas localmente')
        }
      }
      
      setSuccess('Configurações salvas com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (section: keyof LandingPageSettings, field: string, value: any) => {
    if (!settings) return
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    })
  }

  const updateNestedSettings = (section: keyof LandingPageSettings, subsection: string, field: string, value: any) => {
    if (!settings) return
    
    const currentSection = settings[section] as any
    const currentSubsection = currentSection[subsection] as any
    
    setSettings({
      ...settings,
      [section]: {
        ...currentSection,
        [subsection]: {
          ...currentSubsection,
          [field]: value
        }
      }
    })
  }

  const tabs = [
    { id: 'site', label: 'Site', icon: Layout },
    { id: 'logo', label: 'Logo', icon: ImageIcon },
    { id: 'contact', label: 'Contato', icon: Phone },
    { id: 'hero', label: 'Hero Section', icon: Star },
    { id: 'stats', label: 'Estatísticas', icon: Users },
    { id: 'features', label: 'Recursos', icon: Shield },
    { id: 'plans', label: 'Planos', icon: Tv },
    { id: 'footer', label: 'Footer', icon: Globe }
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
              <h1 className="text-3xl font-bold text-white mb-2">Configurações da Landing Page</h1>
              <p className="text-white/60">Gerencie o conteúdo e aparência da sua página inicial</p>
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
          {/* Site Settings */}
          {activeTab === 'site' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Configurações do Site</h3>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Título da Página</label>
                  <input
                    type="text"
                    value={settings.site.title}
                    onChange={(e) => updateSettings('site', 'title', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="IPTV Manager"
                  />
                  <p className="text-white/60 text-sm mt-1">Este título aparecerá na aba do navegador e nos resultados de busca</p>
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Descrição da Página</label>
                  <textarea
                    value={settings.site.description}
                    onChange={(e) => updateSettings('site', 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Sistema de Gerenciamento de IPTV"
                  />
                  <p className="text-white/60 text-sm mt-1">Esta descrição aparecerá nos resultados de busca e quando o link for compartilhado</p>
                </div>
              </div>
              
              {/* Preview */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-4">Preview do SEO</h4>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-blue-400 text-lg font-medium">{settings.site.title}</div>
                  <div className="text-green-400 text-sm mt-1">www.seusite.com</div>
                  <div className="text-white/80 text-sm mt-2">{settings.site.description}</div>
                </div>
              </div>
            </div>
          )}

          {/* Logo Settings */}
          {activeTab === 'logo' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Configurações do Logo</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">URL do Logo</label>
                  <input
                    type="url"
                    value={settings.logo.url}
                    onChange={(e) => updateSettings('logo', 'url', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="https://exemplo.com/logo.png"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Texto Alternativo</label>
                  <input
                    type="text"
                    value={settings.logo.alt}
                    onChange={(e) => updateSettings('logo', 'alt', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="Nome da empresa"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Largura (px)</label>
                  <input
                    type="number"
                    value={settings.logo.width}
                    onChange={(e) => updateSettings('logo', 'width', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="140"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Altura (px)</label>
                  <input
                    type="number"
                    value={settings.logo.height}
                    onChange={(e) => updateSettings('logo', 'height', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="46"
                  />
                </div>
              </div>
              
              {/* Preview */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-4">Preview</h4>
                <div className="bg-white/10 rounded-lg p-4 inline-block">
                  <img
                    src={settings.logo.url}
                    alt={settings.logo.alt}
                    width={settings.logo.width}
                    height={settings.logo.height}
                    className="rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Settings */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Informações de Contato</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={settings.contact.email}
                    onChange={(e) => updateSettings('contact', 'email', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="contato@empresa.com"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Telefone</label>
                  <input
                    type="tel"
                    value={settings.contact.phone}
                    onChange={(e) => updateSettings('contact', 'phone', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="+55 (11) 99999-9999"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">WhatsApp</label>
                  <input
                    type="tel"
                    value={settings.contact.whatsapp}
                    onChange={(e) => updateSettings('contact', 'whatsapp', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="+55 (11) 99999-9999"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Endereço</label>
                  <input
                    type="text"
                    value={settings.contact.address}
                    onChange={(e) => updateSettings('contact', 'address', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="São Paulo, SP - Brasil"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-white/80 text-sm font-medium mb-2">Horário de Funcionamento</label>
                  <input
                    type="text"
                    value={settings.contact.business_hours}
                    onChange={(e) => updateSettings('contact', 'business_hours', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="24/7 - Suporte sempre disponível"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hero Settings */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Seção Hero</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Título Principal</label>
                  <input
                    type="text"
                    value={settings.hero.title}
                    onChange={(e) => updateSettings('hero', 'title', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="O Futuro da TV está"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Subtítulo</label>
                  <input
                    type="text"
                    value={settings.hero.subtitle}
                    onChange={(e) => updateSettings('hero', 'subtitle', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="Nas Suas Mãos"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-white/80 text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    value={settings.hero.description}
                    onChange={(e) => updateSettings('hero', 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Acesse milhares de canais em alta definição..."
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Botão Primário</label>
                  <input
                    type="text"
                    value={settings.hero.cta_primary}
                    onChange={(e) => updateSettings('hero', 'cta_primary', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="Começar Teste Grátis"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Botão Secundário</label>
                  <input
                    type="text"
                    value={settings.hero.cta_secondary}
                    onChange={(e) => updateSettings('hero', 'cta_secondary', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="Ver Demonstração"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stats Settings */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Estatísticas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Clientes</label>
                  <input
                    type="text"
                    value={settings.stats.clients}
                    onChange={(e) => updateSettings('stats', 'clients', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="50K+"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Uptime</label>
                  <input
                    type="text"
                    value={settings.stats.uptime}
                    onChange={(e) => updateSettings('stats', 'uptime', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="99.9%"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Canais</label>
                  <input
                    type="text"
                    value={settings.stats.channels}
                    onChange={(e) => updateSettings('stats', 'channels', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="1500+"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Suporte</label>
                  <input
                    type="text"
                    value={settings.stats.support}
                    onChange={(e) => updateSettings('stats', 'support', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="24/7"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Features Settings */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recursos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Título da Seção</label>
                  <input
                    type="text"
                    value={settings.features.title}
                    onChange={(e) => updateSettings('features', 'title', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="Por que escolher nosso serviço?"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Subtítulo</label>
                  <input
                    type="text"
                    value={settings.features.subtitle}
                    onChange={(e) => updateSettings('features', 'subtitle', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="Oferecemos a melhor experiência..."
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Itens de Recursos</h4>
                {settings.features.items.map((item, index) => (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Título</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const newItems = [...settings.features.items]
                            newItems[index] = { ...item, title: e.target.value }
                            updateSettings('features', 'items', newItems)
                          }}
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                          placeholder="Título do recurso"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Ícone</label>
                        <input
                          type="text"
                          value={item.icon}
                          onChange={(e) => {
                            const newItems = [...settings.features.items]
                            newItems[index] = { ...item, icon: e.target.value }
                            updateSettings('features', 'items', newItems)
                          }}
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                          placeholder="tv, globe, shield..."
                        />
                      </div>
                      
                      <div className="md:col-span-1">
                        <label className="block text-white/80 text-sm font-medium mb-2">Descrição</label>
                        <textarea
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...settings.features.items]
                            newItems[index] = { ...item, description: e.target.value }
                            updateSettings('features', 'items', newItems)
                          }}
                          rows={2}
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 resize-none"
                          placeholder="Descrição do recurso"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Plans Settings */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Planos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Título da Seção</label>
                  <input
                    type="text"
                    value={settings.plans.title}
                    onChange={(e) => updateSettings('plans', 'title', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="Escolha o plano ideal para você"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Subtítulo</label>
                  <input
                    type="text"
                    value={settings.plans.subtitle}
                    onChange={(e) => updateSettings('plans', 'subtitle', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="Preços justos e transparentes"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Plano Mensal */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Plano Mensal</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Nome</label>
                      <input
                        type="text"
                        value={settings.plans.monthly.name}
                        onChange={(e) => updateNestedSettings('plans', 'monthly', 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                        placeholder="Mensal"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Preço</label>
                      <input
                        type="text"
                        value={settings.plans.monthly.price}
                        onChange={(e) => updateNestedSettings('plans', 'monthly', 'price', e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                        placeholder="R$ 35,00"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Plano Trimestral */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Plano Trimestral</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Nome</label>
                      <input
                        type="text"
                        value={settings.plans.quarterly.name}
                        onChange={(e) => updateNestedSettings('plans', 'quarterly', 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                        placeholder="Trimestral"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Preço</label>
                        <input
                          type="text"
                          value={settings.plans.quarterly.price}
                          onChange={(e) => updateNestedSettings('plans', 'quarterly', 'price', e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                          placeholder="R$ 99,00"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Preço Original</label>
                        <input
                          type="text"
                          value={settings.plans.quarterly.originalPrice}
                          onChange={(e) => updateNestedSettings('plans', 'quarterly', 'originalPrice', e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                          placeholder="R$ 105,00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Desconto</label>
                      <input
                        type="text"
                        value={settings.plans.quarterly.discount}
                        onChange={(e) => updateNestedSettings('plans', 'quarterly', 'discount', e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                        placeholder="6%"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Plano Semestral */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Plano Semestral</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Nome</label>
                      <input
                        type="text"
                        value={settings.plans.semiannual.name}
                        onChange={(e) => updateNestedSettings('plans', 'semiannual', 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                        placeholder="Semestral"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Preço</label>
                        <input
                          type="text"
                          value={settings.plans.semiannual.price}
                          onChange={(e) => updateNestedSettings('plans', 'semiannual', 'price', e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                          placeholder="R$ 180,00"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Preço Original</label>
                        <input
                          type="text"
                          value={settings.plans.semiannual.originalPrice}
                          onChange={(e) => updateNestedSettings('plans', 'semiannual', 'originalPrice', e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                          placeholder="R$ 210,00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Desconto</label>
                      <input
                        type="text"
                        value={settings.plans.semiannual.discount}
                        onChange={(e) => updateNestedSettings('plans', 'semiannual', 'discount', e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                        placeholder="14%"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Plano Anual */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Plano Anual</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Nome</label>
                      <input
                        type="text"
                        value={settings.plans.annual.name}
                        onChange={(e) => updateNestedSettings('plans', 'annual', 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                        placeholder="Anual"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Preço</label>
                        <input
                          type="text"
                          value={settings.plans.annual.price}
                          onChange={(e) => updateNestedSettings('plans', 'annual', 'price', e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                          placeholder="R$ 300,00"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Preço Original</label>
                        <input
                          type="text"
                          value={settings.plans.annual.originalPrice}
                          onChange={(e) => updateNestedSettings('plans', 'annual', 'originalPrice', e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                          placeholder="R$ 420,00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Desconto</label>
                      <input
                        type="text"
                        value={settings.plans.annual.discount}
                        onChange={(e) => updateNestedSettings('plans', 'annual', 'discount', e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                        placeholder="29%"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Settings */}
          {activeTab === 'footer' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Footer</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Nome da Empresa</label>
                  <input
                    type="text"
                    value={settings.footer.company_name}
                    onChange={(e) => updateSettings('footer', 'company_name', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="IPTV Manager"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Copyright</label>
                  <input
                    type="text"
                    value={settings.footer.copyright}
                    onChange={(e) => updateSettings('footer', 'copyright', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="2024 IPTV Manager. Todos os direitos reservados."
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-white/80 text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    value={settings.footer.description}
                    onChange={(e) => updateSettings('footer', 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="A melhor plataforma de IPTV do Brasil..."
                  />
                </div>
              </div>
              
              {/* Redes Sociais */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-4">Redes Sociais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Facebook</label>
                    <input
                      type="url"
                      value={settings.footer.social.facebook || ''}
                      onChange={(e) => updateNestedSettings('footer', 'social', 'facebook', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                      placeholder="https://facebook.com/empresa"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Instagram</label>
                    <input
                      type="url"
                      value={settings.footer.social.instagram || ''}
                      onChange={(e) => updateNestedSettings('footer', 'social', 'instagram', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                      placeholder="https://instagram.com/empresa"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Twitter</label>
                    <input
                      type="url"
                      value={settings.footer.social.twitter || ''}
                      onChange={(e) => updateNestedSettings('footer', 'social', 'twitter', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                      placeholder="https://twitter.com/empresa"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">YouTube</label>
                    <input
                      type="url"
                      value={settings.footer.social.youtube || ''}
                      onChange={(e) => updateNestedSettings('footer', 'social', 'youtube', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                      placeholder="https://youtube.com/empresa"
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