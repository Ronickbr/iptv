'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Users, 
  Shield, 
  Zap, 
  Star, 
  ArrowRight, 
  CheckCircle,
  Menu,
  X,
  Tv,
  Globe,
  Smartphone,
  Award,
  Clock,
  Heart,
  TrendingUp,
  Sparkles,
  Download,
  Wifi,
  Monitor
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useLandingPageSettings } from './hooks/useLandingPageSettings'

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const { settings, loading } = useLandingPageSettings()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  const stats = [
    {
      number: settings.stats.clients,
      label: "Clientes Ativos",
      icon: <Users className="w-6 h-6" />
    },
    {
      number: settings.stats.uptime,
      label: "Uptime Garantido",
      icon: <Shield className="w-6 h-6" />
    },
    {
      number: settings.stats.channels,
      label: "Canais Disponíveis",
      icon: <Tv className="w-6 h-6" />
    },
    {
      number: settings.stats.support,
      label: "Suporte Técnico",
      icon: <Clock className="w-6 h-6" />
    }
  ]

  const testimonials = [
    {
      name: "Carlos Silva",
      role: "Cliente Premium",
      content: "Melhor serviço de IPTV que já usei. Qualidade excepcional e suporte incrível!",
      rating: 5,
      avatar: "CS"
    },
    {
      name: "Maria Santos",
      role: "Cliente Família",
      content: "Toda a família adora! Canais para todos os gostos e preço justo.",
      rating: 5,
      avatar: "MS"
    },
    {
      name: "João Oliveira",
      role: "Cliente Básico",
      content: "Fácil de usar e funciona perfeitamente em todos os dispositivos.",
      rating: 5,
      avatar: "JO"
    }
  ]

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      tv: <Tv className="w-8 h-8" />,
      globe: <Globe className="w-8 h-8" />,
      smartphone: <Smartphone className="w-8 h-8" />,
      shield: <Shield className="w-8 h-8" />,
      zap: <Zap className="w-8 h-8" />,
      users: <Users className="w-8 h-8" />
    }
    return iconMap[iconName] || <Star className="w-8 h-8" />
  }

  const features = settings.features.items.map(item => ({
    icon: getIconComponent(item.icon),
    title: item.title,
    description: item.description
  }))

  const plans = [
    {
      name: settings.plans.monthly.name,
      price: settings.plans.monthly.price,
      period: "/mês",
      originalPrice: null,
      discount: null,
      features: settings.plans.monthly.features,
      popular: false
    },
    {
      name: settings.plans.quarterly.name,
      price: settings.plans.quarterly.price,
      period: "/3 meses",
      originalPrice: settings.plans.quarterly.originalPrice,
      discount: settings.plans.quarterly.discount,
      features: settings.plans.quarterly.features,
      popular: true
    },
    {
      name: settings.plans.semiannual.name,
      price: settings.plans.semiannual.price,
      period: "/6 meses",
      originalPrice: settings.plans.semiannual.originalPrice,
      discount: settings.plans.semiannual.discount,
      features: settings.plans.semiannual.features,
      popular: false
    },
    {
      name: settings.plans.annual.name,
      price: settings.plans.annual.price,
      period: "/ano",
      originalPrice: settings.plans.annual.originalPrice,
      discount: settings.plans.annual.discount,
      features: settings.plans.annual.features,
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src={settings.logo.url}
                alt={settings.logo.alt}
                width={settings.logo.width}
                height={settings.logo.height}
                style={{ borderRadius: '6px' }}
              />
            </motion.div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium relative group">
                Recursos
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#plans" className="text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium relative group">
                Planos
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#contact" className="text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium relative group">
                Contato
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300"></span>
              </a>
              <Link href="/login" className="text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium relative group">
                Login
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/register" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold">
                Começar Grátis
              </Link>
            </nav>
            
            {/* Mobile menu button */}
            <motion.button 
              className="md:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              {isMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
            </motion.button>
          </div>
          
          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.div 
              className="md:hidden py-6 border-t border-gray-200/50 bg-white/95 backdrop-blur-sm rounded-b-2xl shadow-xl"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-700 hover:text-purple-600 transition-colors duration-300 font-medium py-2 px-4 rounded-lg hover:bg-purple-50">Recursos</a>
                <a href="#plans" className="text-gray-700 hover:text-purple-600 transition-colors duration-300 font-medium py-2 px-4 rounded-lg hover:bg-purple-50">Planos</a>
                <a href="#contact" className="text-gray-700 hover:text-purple-600 transition-colors duration-300 font-medium py-2 px-4 rounded-lg hover:bg-purple-50">Contato</a>
                <Link href="/login" className="text-gray-700 hover:text-purple-600 transition-colors duration-300 font-medium py-2 px-4 rounded-lg hover:bg-purple-50">Login</Link>
                <Link href="/register" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 text-center font-semibold shadow-lg">
                  Começar Grátis
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-pink-400 to-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {settings.hero.title}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent block">{settings.hero.subtitle}</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {settings.hero.description}
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link href="/register" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2">
                <span>{settings.hero.cta_primary}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button 
                onClick={() => setIsVideoModalOpen(true)}
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>{settings.hero.cta_secondary}</span>
              </button>
            </motion.div>
            
            <motion.div 
              className="mt-12 flex items-center justify-center space-x-6 text-sm text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>3 dias grátis</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Sem fidelidade</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Cancele quando quiser</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Números que <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Impressionam</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Milhares de clientes confiam em nossa plataforma todos os dias
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300">
                  <div className="text-purple-600 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-purple-100 to-transparent rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-pink-100 to-transparent rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">IPTV Manager</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Oferecemos a melhor experiência em streaming com tecnologia de ponta e suporte excepcional.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200 hover:-translate-y-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300">
                  <div className="text-purple-600 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              O que nossos <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">clientes dizem</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Milhares de pessoas já transformaram sua experiência de entretenimento conosco
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-200 mb-6 leading-relaxed italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold mr-4 group-hover:scale-110 transition-transform duration-300">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center space-x-2 text-gray-300">
              <Heart className="w-5 h-5 text-red-400" />
              <span>Mais de 50.000 clientes satisfeitos</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-20 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-purple-100 to-transparent rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-pink-100 to-transparent rounded-full transform translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
               Escolha a <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">periodicidade ideal</span> para você
             </h2>
             <p className="text-xl text-gray-600 max-w-3xl mx-auto">
               Todos os planos incluem acesso completo à plataforma. Economize mais com planos de maior duração!
             </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
             {plans.map((plan, index) => (
               <motion.div 
                 key={index}
                 className={`group relative rounded-3xl shadow-2xl p-8 transition-all duration-500 hover:-translate-y-3 overflow-hidden ${
                   plan.popular 
                     ? 'bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white scale-105 ring-4 ring-purple-300/50' 
                     : 'bg-white/90 backdrop-blur-xl border border-gray-200/50 hover:border-purple-300/50 hover:shadow-purple-100/50'
                 }`}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.7, delay: index * 0.15 }}
                 viewport={{ once: true }}
                 whileHover={{ scale: plan.popular ? 1.08 : 1.05, rotateY: 2 }}
               >
                 {/* Background Pattern */}
                 <div className="absolute inset-0 opacity-10">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/30 to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>
                   <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/20 to-transparent rounded-full transform -translate-x-12 translate-y-12"></div>
                 </div>
                 
                 {plan.popular && (
                   <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                     <motion.div 
                       className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl"
                       animate={{ scale: [1, 1.05, 1] }}
                       transition={{ duration: 2, repeat: Infinity }}
                     >
                       <Sparkles className="w-4 h-4 inline mr-1" />
                       MAIS POPULAR
                     </motion.div>
                   </div>
                 )}
                 
                 {/* Discount Badge */}
                 {plan.discount && (
                   <div className="absolute top-4 right-4">
                     <motion.div 
                       className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                       whileHover={{ scale: 1.1, rotate: 5 }}
                     >
                       -{plan.discount}
                     </motion.div>
                   </div>
                 )}
                 
                 <div className="relative z-10">
                   {/* Plan Icon */}
                   <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
                     plan.popular 
                       ? 'bg-white/20 backdrop-blur-sm' 
                       : 'bg-gradient-to-br from-purple-100 to-pink-100'
                   }`}>
                     <motion.div
                       whileHover={{ rotate: 360 }}
                       transition={{ duration: 0.6 }}
                     >
                       {index === 0 && <Clock className={`w-8 h-8 ${plan.popular ? 'text-white' : 'text-purple-600'}`} />}
                       {index === 1 && <TrendingUp className={`w-8 h-8 ${plan.popular ? 'text-white' : 'text-purple-600'}`} />}
                       {index === 2 && <Award className={`w-8 h-8 ${plan.popular ? 'text-white' : 'text-purple-600'}`} />}
                       {index === 3 && <Star className={`w-8 h-8 ${plan.popular ? 'text-white' : 'text-purple-600'}`} />}
                     </motion.div>
                   </div>
                   
                   <div className="text-center mb-8">
                     <h3 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                       plan.popular ? 'text-white' : 'text-gray-900 group-hover:text-purple-600'
                     }`}>
                       {plan.name}
                     </h3>
                     
                     {plan.originalPrice && (
                        <div className="mb-4 space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <span className={`text-base line-through ${
                              plan.popular ? 'text-white/70' : 'text-gray-500'
                            }`}>
                              {plan.originalPrice}
                            </span>
                          </div>
                          <motion.div 
                            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg mx-auto w-fit"
                            whileHover={{ scale: 1.1 }}
                          >
                            ECONOMIZE {plan.discount}
                          </motion.div>
                        </div>
                      )}
                     
                     <div className="mb-4">
                        <div className="text-center">
                          <span className={`text-3xl xl:text-4xl font-bold block ${
                            plan.popular 
                              ? 'text-white' 
                              : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
                          }`}>
                            {plan.price}
                          </span>
                          <span className={`text-sm mt-1 block ${
                            plan.popular ? 'text-white/80' : 'text-gray-600'
                          }`}>
                            {plan.period}
                          </span>
                        </div>
                      </div>
                     
                     {plan.popular && (
                       <motion.div 
                         className="flex items-center justify-center text-sm text-yellow-300 font-medium"
                         animate={{ scale: [1, 1.05, 1] }}
                         transition={{ duration: 2, repeat: Infinity }}
                       >
                         <Heart className="w-4 h-4 mr-1 fill-current" />
                         Escolha dos Clientes
                       </motion.div>
                     )}
                   </div>
                   
                   <ul className="space-y-2 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li 
                          key={featureIndex} 
                          className="flex items-start space-x-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: featureIndex * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <div className={`rounded-full p-1 flex-shrink-0 mt-0.5 ${
                            plan.popular 
                              ? 'bg-white/20' 
                              : 'bg-gradient-to-r from-green-400 to-green-500'
                          }`}>
                            <CheckCircle className={`w-3 h-3 ${
                              plan.popular ? 'text-white' : 'text-white'
                            }`} />
                          </div>
                          <span className={`text-xs xl:text-sm font-medium transition-colors duration-300 leading-relaxed ${
                            plan.popular 
                              ? 'text-white/90' 
                              : 'text-gray-700 group-hover:text-gray-900'
                          }`}>
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                   
                   <Link href={`/register?plan=${encodeURIComponent(plan.name)}&price=${encodeURIComponent(plan.price)}&period=${encodeURIComponent(plan.period)}&originalPrice=${encodeURIComponent(plan.originalPrice || '')}&discount=${encodeURIComponent(plan.discount || '')}`}>
                     <motion.button 
                        className={`w-full py-3 px-4 rounded-2xl font-bold text-sm xl:text-base transition-all duration-300 transform ${
                          plan.popular 
                            ? 'bg-white text-purple-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl' 
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="flex items-center justify-center space-x-2">
                          <span className="whitespace-nowrap">Escolher Plano</span>
                          <motion.div
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </motion.div>
                        </span>
                      </motion.button>
                   </Link>
                 </div>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="mb-6"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Pronto para <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">começar</span>?
            </h2>
            <p className="text-xl text-purple-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Junte-se a milhares de usuários satisfeitos e transforme sua experiência de entretenimento hoje mesmo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register" className="group bg-white text-purple-600 px-10 py-5 rounded-2xl text-lg font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl inline-flex items-center space-x-3">
                <span>Começar Teste Grátis</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              
              <button 
                onClick={() => setIsVideoModalOpen(true)}
                className="group bg-white/10 backdrop-blur-sm text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-white/20 transition-all duration-300 border border-white/30 hover:border-white/50 inline-flex items-center space-x-3"
              >
                <Play className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                <span>Ver Demonstração</span>
              </button>
            </div>
            
            <motion.div 
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-purple-100"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>3 dias grátis</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Sem fidelidade</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Cancele quando quiser</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-300" />
                <span>100% Seguro</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            className="bg-black rounded-2xl shadow-2xl w-full max-w-sm h-[80vh] overflow-hidden relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <button 
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors duration-200"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <div className="w-full h-full bg-black rounded-2xl overflow-hidden">
              <video 
                controls 
                autoPlay
                muted
                className="w-full h-full object-contain"
                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 711'%3E%3Crect width='400' height='711' fill='%23000'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23fff' font-size='24' font-family='Arial'%3ECarregando...%3C/text%3E%3C/svg%3E"
              >
                <source src="https://kmkzclan.com/wp-content/uploads/2025/07/demostracao.mp4" type="video/mp4" />
                Seu navegador não suporta a reprodução de vídeo.
              </video>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <div className="bg-black/70 backdrop-blur-sm rounded-xl p-4">
                <p className="text-white text-sm mb-3">Demonstração do IPTV Manager</p>
                <Link 
                  href="/register" 
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm font-semibold"
                >
                  <span>Começar Agora</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12 relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Logo */}
            <motion.div 
              className="flex justify-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Image
                src={settings.logo.url}
                alt={settings.logo.alt}
                width={160}
                height={50}
                className="rounded-lg opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
            </motion.div>
            
            {/* Company Description */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
                {settings.footer.description}
              </p>
            </motion.div>
            
            {/* Navigation Links */}
            <motion.div 
              className="flex flex-wrap justify-center items-center gap-8 mb-8 text-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {/* Product Links */}
              {settings.footer.links.product.map((link, index) => (
                <a key={`product-${index}`} href={link.url} className="text-gray-400 hover:text-white transition-colors duration-300">
                  {link.name}
                </a>
              ))}
              
              {/* Support Links */}
              {settings.footer.links.support.slice(0, 2).map((link, index) => (
                <a key={`support-${index}`} href={link.url} className="text-gray-400 hover:text-white transition-colors duration-300">
                  {link.name}
                </a>
              ))}
              
              {/* Auth Links */}
              <Link href="/login" className="text-gray-400 hover:text-white transition-colors duration-300">Login</Link>
              <Link href="/register" className="text-gray-400 hover:text-white transition-colors duration-300">Registro</Link>
            </motion.div>
            
            {/* Social Icons */}
            <motion.div 
              className="flex justify-center space-x-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              {settings.footer.social.facebook && (
                <a 
                  href={settings.footer.social.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all duration-300 cursor-pointer hover:scale-110"
                >
                  <Globe className="w-5 h-5" />
                </a>
              )}
              {settings.footer.social.instagram && (
                <a 
                  href={settings.footer.social.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-pink-600 transition-all duration-300 cursor-pointer hover:scale-110"
                >
                  <Monitor className="w-5 h-5" />
                </a>
              )}
              {settings.footer.social.youtube && (
                <a 
                  href={settings.footer.social.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-300 cursor-pointer hover:scale-110"
                >
                  <Smartphone className="w-5 h-5" />
                </a>
              )}
            </motion.div>
            
            {/* Copyright */}
            <motion.div 
              className="border-t border-gray-800 pt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 text-sm text-gray-400">
                <p>&copy; {settings.footer.copyright}</p>
                <div className="flex items-center space-x-6">
                  {/* Company Links */}
                  {settings.footer.links.company.slice(-2).map((link, index) => (
                    <a key={`company-${index}`} href={link.url} className="hover:text-white transition-colors duration-300">
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  )
}