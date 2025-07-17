'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Save,
  Upload,
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
  X
} from 'lucide-react'

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

interface LandingPageConfigProps {
  onSave?: (settings: LandingPageSettings) => void
}

export default function LandingPageConfig({ onSave }: LandingPageConfigProps) {
  const [settings, setSettings] = useState<LandingPageSettings>({
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

  const [activeTab, setActiveTab] = useState<'logo' | 'contact' | 'hero' | 'stats' | 'features' | 'plans' | 'footer'>('logo')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    
    try {
      // Simular salvamento (aqui você implementaria a chamada para a API)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (onSave) {
        onSave(settings)
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
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const updateNestedSettings = (section: keyof LandingPageSettings, subsection: string, field: string, value: any) => {
    setSettings(prev => {
      const currentSection = prev[section] as any
      const currentSubsection = currentSection[subsection] as any
      
      return {
        ...prev,
        [section]: {
          ...currentSection,
          [subsection]: {
            ...currentSubsection,
            [field]: value
          }
        }
      }
    })
  }

  const tabs = [
    { id: 'logo', label: 'Logo', icon: ImageIcon },
    { id: 'contact', label: 'Contato', icon: Phone },
    { id: 'hero', label: 'Hero Section', icon: Star },
    { id: 'stats', label: 'Estatísticas', icon: Users },
    { id: 'features', label: 'Recursos', icon: Settings },
    { id: 'plans', label: 'Planos', icon: Tv },
    { id: 'footer', label: 'Footer', icon: Globe }
  ]

  return (
    <div className="w-full">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Configurações da Landing Page</h1>
                <p className="text-purple-100">Gerencie o conteúdo e aparência da sua página inicial</p>
              </div>
              <motion.button
                onClick={handleSave}
                disabled={saving}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>{saving ? 'Salvando...' : 'Salvar'}</span>
              </motion.button>
            </div>
          </div>

          {/* Notifications */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/20 border border-green-500/30 text-green-100 px-6 py-4 mx-8 mt-6 rounded-xl flex items-center space-x-2"
            >
              <Check className="w-5 h-5" />
              <span>{success}</span>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/30 text-red-100 px-6 py-4 mx-8 mt-6 rounded-xl flex items-center space-x-2"
            >
              <X className="w-5 h-5" />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border-r border-gray-200">
              <div className="p-6">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </motion.button>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-8">
              {activeTab === 'logo' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Configurações do Logo</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">URL do Logo</label>
                      <input
                        type="url"
                        value={settings.logo.url}
                        onChange={(e) => updateSettings('logo', 'url', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="https://exemplo.com/logo.png"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Texto Alternativo</label>
                      <input
                        type="text"
                        value={settings.logo.alt}
                        onChange={(e) => updateSettings('logo', 'alt', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Nome da empresa"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Largura (px)</label>
                      <input
                        type="number"
                        value={settings.logo.width}
                        onChange={(e) => updateSettings('logo', 'width', parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="140"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Altura (px)</label>
                      <input
                        type="number"
                        value={settings.logo.height}
                        onChange={(e) => updateSettings('logo', 'height', parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="46"
                      />
                    </div>
                  </div>
                  
                  {/* Preview */}
                  <div className="bg-gray-100 border border-gray-200 rounded-xl p-6">
                    <h3 className="text-gray-900 font-semibold mb-4">Preview</h3>
                    <div className="bg-white rounded-lg p-4 inline-block border border-gray-200">
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

              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Informações de Contato</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={settings.contact.email}
                        onChange={(e) => updateSettings('contact', 'email', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="contato@empresa.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Telefone</label>
                      <input
                        type="tel"
                        value={settings.contact.phone}
                        onChange={(e) => updateSettings('contact', 'phone', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="+55 (11) 99999-9999"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">WhatsApp</label>
                      <input
                        type="tel"
                        value={settings.contact.whatsapp}
                        onChange={(e) => updateSettings('contact', 'whatsapp', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="+55 (11) 99999-9999"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Endereço</label>
                      <input
                        type="text"
                        value={settings.contact.address}
                        onChange={(e) => updateSettings('contact', 'address', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="São Paulo, SP - Brasil"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 text-sm font-medium mb-2">Horário de Funcionamento</label>
                      <input
                        type="text"
                        value={settings.contact.business_hours}
                        onChange={(e) => updateSettings('contact', 'business_hours', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="24/7 - Suporte sempre disponível"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Adicione mais seções conforme necessário */}
            </div>
          </div>
        </div>
    </div>
  )
}