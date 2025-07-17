'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState({
    name: '',
    price: '',
    period: '',
    originalPrice: '',
    discount: ''
  })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    referralCode: '',
    acceptTerms: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  // Preencher automaticamente o código de indicação e dados do plano se houver parâmetros na URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const refCode = urlParams.get('ref')
      const planName = urlParams.get('plan') || urlParams.get('planName')
      const planPrice = urlParams.get('price') || urlParams.get('planPrice')
      const planPeriod = urlParams.get('period') || urlParams.get('planPeriod')
      const planOriginalPrice = urlParams.get('originalPrice') || urlParams.get('planOriginalPrice')
      const planDiscount = urlParams.get('discount') || urlParams.get('planDiscount')
      
      if (refCode) {
        setFormData(prev => ({
          ...prev,
          referralCode: refCode
        }))
      }
      
      if (planName && planPrice && planPeriod) {
        setSelectedPlan({
          name: planName,
          price: planPrice,
          period: planPeriod,
          originalPrice: planOriginalPrice || '',
          discount: planDiscount || ''
        })
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    // Validate terms acceptance
    if (!formData.acceptTerms) {
      setError('Você deve aceitar os termos de uso')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          referralCode: formData.referralCode
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          // Se há um plano selecionado, redireciona para pagamento, senão para login
          if (selectedPlan.name) {
            const paymentParams = new URLSearchParams({
              planName: selectedPlan.name,
              planPrice: selectedPlan.price,
              planPeriod: selectedPlan.period,
              ...(selectedPlan.originalPrice && { planOriginalPrice: selectedPlan.originalPrice }),
              ...(selectedPlan.discount && { planDiscount: selectedPlan.discount }),
              userId: data.userId || '',
              userEmail: formData.email
            })
            router.push(`/payment?${paymentParams.toString()}`)
          } else {
            router.push('/login')
          }
        }, 2000)
      } else {
        setError(data.message || 'Erro ao criar conta')
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-800 p-2 rounded-2xl shadow-2xl">
              <div className="bg-white rounded-xl p-8 text-center">
                <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Conta criada com sucesso!
                </h2>
                <p className="text-gray-600 mb-6">
                  {selectedPlan.name ? 'Você será redirecionado para finalizar o pagamento em alguns segundos.' : 'Você será redirecionado para a página de login em alguns segundos.'}
                </p>
                {selectedPlan.name ? (
                  <Link href={`/payment?planName=${selectedPlan.name}&planPrice=${selectedPlan.price}&planPeriod=${selectedPlan.period}&userEmail=${formData.email}`}>
                    <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all">
                      Ir para pagamento agora
                    </button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all">
                      Ir para login agora
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors mb-6">
              <ArrowLeft size={20} className="mr-2" />
              Voltar ao início
            </Link>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-800 p-2 rounded-2xl shadow-2xl">
            <div className="bg-white rounded-xl p-8">
              {/* Logo */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <Image
                    src="https://i.imgur.com/E08eWYX.png"
                    alt="Logo"
                    width={180}
                    height={60}
                    className="rounded-lg"
                  />
                </div>
                <h1 className="text-2xl font-semibold text-gray-800 mt-4">
                  Criar nova conta
                </h1>
                <p className="text-gray-600 mt-2">
                  Preencha os dados abaixo para se cadastrar
                </p>
              </div>

              {/* Selected Plan Display */}
              {selectedPlan.name && (
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">Plano Selecionado</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-purple-700 font-medium">{selectedPlan.name}</p>
                      <p className="text-sm text-purple-600">{selectedPlan.period}</p>
                    </div>
                    <div className="text-right">
                      {selectedPlan.originalPrice && (
                        <p className="text-sm text-gray-500 line-through">{selectedPlan.originalPrice}</p>
                      )}
                      <p className="text-xl font-bold text-purple-800">{selectedPlan.price}</p>
                      {selectedPlan.discount && (
                        <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          {selectedPlan.discount} OFF
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Register Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome completo
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Código de Indicação (opcional)
                  </label>
                  <input
                    id="referralCode"
                    name="referralCode"
                    type="text"
                    value={formData.referralCode}
                    onChange={handleChange}
                    placeholder="Digite o código de indicação"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Sua senha"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirme sua senha"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-600">
                    Eu aceito os{' '}
                    <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">
                      termos de uso
                    </Link>
                    {' '}e{' '}
                    <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">
                      política de privacidade
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Criando conta...' : 'Criar conta'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Já tem uma conta?{' '}
                  <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                    Faça login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}