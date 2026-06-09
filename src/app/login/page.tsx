'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Store token in localStorage or cookie
        localStorage.setItem('token', data.token)
        
        // Redirect based on user role
        if (data.user.role === 'admin') {
          router.push('/dashboard/admin')
        } else {
          router.push('/dashboard/client')
        }
      } else {
        setError(data.message || 'Erro ao fazer login')
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const fillAdminCredentials = () => {
    setFormData({
      email: 'admin@iptv.com',
      password: 'secret'
    })
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
                  Bem-vindo de volta
                </h1>
                <p className="text-gray-600 mt-2">
                  Entre na sua conta para acessar o painel
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
                
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
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
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

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="ml-2 text-sm text-gray-600">Lembrar de mim</span>
                  </label>
                  <Link href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
                    Esqueceu a senha?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Credencial de administrador</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={fillAdminCredentials}
                    className="w-full text-left px-4 py-3 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <strong>Admin:</strong> admin@iptv.com / secret
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center mt-6">
            <p className="text-white">
              Não tem uma conta?{' '}
              <Link href="/register" className="font-semibold hover:underline">
                Cadastre-se aqui
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}