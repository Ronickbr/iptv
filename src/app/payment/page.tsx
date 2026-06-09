'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, Copy, QrCode, Clock, Shield, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

interface PlanDetails {
  name: string
  price: string
  period: string
  originalPrice: string
  discount: string
}

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [planDetails, setPlanDetails] = useState<PlanDetails>({
    name: '',
    price: '',
    period: '',
    originalPrice: '',
    discount: ''
  })
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [pixCode, setPixCode] = useState('')
  const [showPixCode, setShowPixCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutos

  useEffect(() => {
    // Capturar dados do plano e usuário da URL
    const planName = searchParams.get('planName') || searchParams.get('plan') || ''
    const planPrice = searchParams.get('planPrice') || searchParams.get('price') || ''
    const planPeriod = searchParams.get('planPeriod') || searchParams.get('period') || ''
    const planOriginalPrice = searchParams.get('planOriginalPrice') || searchParams.get('originalPrice') || ''
    const planDiscount = searchParams.get('planDiscount') || searchParams.get('discount') || ''
    const email = searchParams.get('userEmail') || ''
    const id = searchParams.get('userId') || ''

    setPlanDetails({
      name: planName,
      price: planPrice,
      period: planPeriod,
      originalPrice: planOriginalPrice,
      discount: planDiscount
    })
    setUserEmail(email)
    setUserId(id)

    // Redirecionar se não houver dados do plano
    if (!planName || !planPrice) {
      router.push('/register')
    }
  }, [searchParams, router])

  // Timer para expiração do PIX
  useEffect(() => {
    if (showPixCode && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [showPixCode, timeLeft])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const generatePixCode = () => {
    // Simular geração de código PIX
    const code = `00020126580014BR.GOV.BCB.PIX0136${Math.random().toString(36).substring(2, 15)}520400005303986540${planDetails.price.replace('R$', '').replace(',', '.')}5802BR5925EMPRESA EXEMPLO LTDA6009SAO PAULO62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    setPixCode(code)
    setShowPixCode(true)
  }

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar código PIX:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Simular geração do código PIX
      await new Promise(resolve => setTimeout(resolve, 1500))
      generatePixCode()
      
    } catch (err) {
      setError('Erro ao gerar código PIX. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const confirmPayment = async () => {
    setIsLoading(true)
    try {
      // Simular confirmação de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSuccess(true)
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        router.push('/login')
      }, 3000)
      
    } catch (err) {
      setError('Erro ao confirmar pagamento. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Pagamento Confirmado!
              </h2>
              <p className="text-gray-600 mb-6">
                Seu pagamento foi processado com sucesso. Bem-vindo à nossa plataforma!
              </p>
              <div className="bg-emerald-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-emerald-700 font-medium">
                  Plano ativado: {planDetails.name}
                </p>
              </div>
              <Link href="/login">
                 <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all transform hover:scale-105">
                   Fazer Login
                 </button>
               </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link href="/register" className="inline-flex items-center text-gray-600 hover:text-gray-800 hover:bg-white/50 px-4 py-2 rounded-lg transition-all mb-6">
            <ArrowLeft size={20} className="mr-2" />
            Voltar ao registro
          </Link>
          
          <div className="flex justify-center mb-6">
            <Image
              src="https://i.imgur.com/E08eWYX.png"
              alt="Logo"
              width={200}
              height={60}
              className="rounded-lg"
            />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Finalizar Pagamento
          </h1>
          <p className="text-gray-600">
            Pague com PIX de forma rápida e segura
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resumo do Pedido */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                Resumo do Pedido
              </h3>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">{planDetails.name}</h4>
                    <p className="text-gray-600">{planDetails.period}</p>
                    <p className="text-sm text-gray-500 mt-2">Cliente: {userEmail}</p>
                  </div>
                  <div className="text-right">
                    {planDetails.originalPrice && (
                      <p className="text-sm text-gray-500 line-through">{planDetails.originalPrice}</p>
                    )}
                    <p className="text-2xl font-bold text-gray-800">{planDetails.price}</p>
                    {planDetails.discount && (
                      <span className="inline-block bg-emerald-500 text-white text-xs px-3 py-1 rounded-full mt-2">
                        {planDetails.discount} OFF
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total a pagar:</span>
                  <span className="text-blue-600">{planDetails.price}</span>
                </div>
              </div>

              {/* Vantagens do PIX */}
              <div className="mt-8">
                <h4 className="font-semibold text-gray-800 mb-4">Vantagens do PIX:</h4>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Zap className="w-4 h-4 mr-3 text-yellow-500" />
                    Pagamento instantâneo
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="w-4 h-4 mr-3 text-green-500" />
                    100% seguro e criptografado
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-3 text-blue-500" />
                    Disponível 24h por dia
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Área de Pagamento */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              {!showPixCode ? (
                <>
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <QrCode className="w-5 h-5 mr-2 text-blue-600" />
                    Pagamento via PIX
                  </h3>
                  
                  <div className="text-center py-8">
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <QrCode size={40} className="text-white" />
                    </div>
                    <h4 className="text-lg font-semibold mb-4">Pague com PIX</h4>
                    <p className="text-gray-600 mb-6">
                      Clique no botão abaixo para gerar seu código PIX e finalizar o pagamento
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Gerando código PIX...
                        </div>
                      ) : (
                        `Gerar PIX - ${planDetails.price}`
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Código PIX Gerado!</h3>
                    <p className="text-gray-600">Escaneie o QR Code ou copie o código abaixo</p>
                  </div>

                  {/* Timer */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center text-yellow-800">
                      <Clock className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Tempo restante: {formatTime(timeLeft)}</span>
                    </div>
                  </div>

                  {/* QR Code Placeholder */}
                  <div className="bg-gray-100 rounded-xl p-8 mb-6">
                    <div className="w-48 h-48 bg-white rounded-lg mx-auto flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <QrCode size={80} className="text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">QR Code PIX</p>
                      </div>
                    </div>
                  </div>

                  {/* Código PIX */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código PIX (Copia e Cola)
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={pixCode}
                        readOnly
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg bg-gray-50 text-sm font-mono"
                      />
                      <button
                        type="button"
                        onClick={copyPixCode}
                        className={`px-4 py-3 rounded-r-lg border border-l-0 border-gray-300 transition-all ${
                          copied
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    {copied && (
                      <p className="text-sm text-green-600 mt-2">Código copiado!</p>
                    )}
                  </div>

                  {/* Instruções */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-blue-800 mb-2">Como pagar:</h4>
                    <ol className="text-sm text-blue-700 space-y-1">
                      <li>1. Abra o app do seu banco</li>
                      <li>2. Escolha a opção PIX</li>
                      <li>3. Escaneie o QR Code ou cole o código</li>
                      <li>4. Confirme o pagamento</li>
                    </ol>
                  </div>

                  <button
                    onClick={confirmPayment}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Confirmando pagamento...
                      </div>
                    ) : (
                      'Já paguei - Confirmar Pagamento'
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Loading component para o Suspense
function PaymentLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  )
}

// Componente principal com Suspense
export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentContent />
    </Suspense>
  )
}