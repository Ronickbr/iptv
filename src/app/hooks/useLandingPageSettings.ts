import { useState, useEffect } from 'react'

export interface LandingPageSettings {
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

const defaultSettings: LandingPageSettings = {
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
}

export function useLandingPageSettings() {
  const [settings, setSettings] = useState<LandingPageSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar configurações do localStorage ou API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Primeiro, tenta carregar do localStorage
        const savedSettings = localStorage.getItem('landingPageSettings')
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings))
        }

        // Depois, tenta carregar da API (se disponível)
        const token = localStorage.getItem('token')
        if (token) {
          try {
            const response = await fetch('http://localhost:3001/api/landing-page/settings', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })

            if (response.ok) {
              const data = await response.json()
              if (data.settings) {
                setSettings(data.settings)
                localStorage.setItem('landingPageSettings', JSON.stringify(data.settings))
              }
            }
          } catch (apiError) {
            console.log('API não disponível, usando configurações locais')
          }
        }
      } catch (err) {
        console.error('Erro ao carregar configurações:', err)
        setError('Erro ao carregar configurações')
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Salvar configurações
  const saveSettings = async (newSettings: LandingPageSettings) => {
    try {
      setError(null)
      
      // Salva no localStorage
      localStorage.setItem('landingPageSettings', JSON.stringify(newSettings))
      setSettings(newSettings)

      // Tenta salvar na API (se disponível)
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await fetch('http://localhost:3001/api/admin/landing-page', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ settings: newSettings })
          })

          if (!response.ok) {
            throw new Error('Erro ao salvar na API')
          }
        } catch (apiError) {
          console.log('API não disponível, salvando apenas localmente')
        }
      }

      return true
    } catch (err) {
      console.error('Erro ao salvar configurações:', err)
      setError('Erro ao salvar configurações')
      return false
    }
  }

  // Atualizar uma seção específica
  const updateSection = (section: keyof LandingPageSettings, data: any) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        ...data
      }
    }
    setSettings(newSettings)
  }

  // Resetar para configurações padrão
  const resetToDefault = () => {
    setSettings(defaultSettings)
    localStorage.removeItem('landingPageSettings')
  }

  return {
    settings,
    loading,
    error,
    saveSettings,
    updateSection,
    resetToDefault
  }
}