'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Database, ShieldCheck, UserCog } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { apiFetchJson } from '../../lib/api'
import { InstallationStatus, useInstallationStatus } from '../hooks/useInstallationStatus'

interface InstallResponse {
  message: string
  installation: InstallationStatus
}

export default function InstallPage() {
  const router = useRouter()
  const { status, loading } = useInstallationStatus({
    redirectIfInstalled: true,
    installedRedirectTo: '/login'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    dbHost: '',
    dbPort: '3306',
    dbUser: '',
    dbPassword: '',
    dbName: '',
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  })

  useEffect(() => {
    if (!status?.config) {
      return
    }

    setFormData((current) => ({
      ...current,
      dbHost: current.dbHost || status.config?.host || '',
      dbPort: current.dbPort || String(status.config?.port || 3306),
      dbUser: current.dbUser || status.config?.user || '',
      dbName: current.dbName || status.config?.database || '',
      adminName: current.adminName || 'Administrador',
      adminEmail: current.adminEmail || 'admin@iptv.com'
    }))
  }, [status])

  const statusLabel = useMemo(() => {
    if (!status) {
      return 'Verificando ambiente...'
    }

    if (!status.databaseReachable) {
      return 'Banco ainda nao conectado'
    }

    if (!status.schemaReady) {
      return 'Banco conectado, schema pendente'
    }

    if (!status.adminReady) {
      return 'Schema pronto, falta criar o admin'
    }

    return 'Instalacao concluida'
  }, [status])

  const detectedConfigLabel = useMemo(() => {
    if (!status?.config) {
      return null
    }

    if (status.config.source === 'installer') {
      return 'Configuracao salva anteriormente no instalador'
    }

    return 'Configuracao detectada automaticamente do ambiente do Dokploy'
  }, [status])

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await apiFetchJson<InstallResponse>('/install/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      setSuccess(response.message)
      setTimeout(() => {
        router.replace('/login')
      }, 1200)
    } catch (installError) {
      setError(installError instanceof Error ? installError.message : 'Falha ao executar a instalacao.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-5xl mx-auto grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-cyan-500/15 text-cyan-300">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Instalador Inicial</h1>
              <p className="text-white/60">Configure o banco, execute a migracao e crie o primeiro administrador.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Database className="w-5 h-5 text-cyan-300" />
                Banco de Dados
              </div>

              {detectedConfigLabel && (
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                  {detectedConfigLabel}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <InputField label="Host" value={formData.dbHost} onChange={(value) => handleChange('dbHost', value)} placeholder="mysql.interno" />
                <InputField label="Porta" value={formData.dbPort} onChange={(value) => handleChange('dbPort', value)} placeholder="3306" />
                <InputField label="Usuario" value={formData.dbUser} onChange={(value) => handleChange('dbUser', value)} placeholder="root" />
                <InputField label="Banco" value={formData.dbName} onChange={(value) => handleChange('dbName', value)} placeholder="DBStream" />
              </div>

              <InputField
                label="Senha do banco"
                type="password"
                value={formData.dbPassword}
                onChange={(value) => handleChange('dbPassword', value)}
                placeholder={status?.config?.hasPasswordConfigured ? 'Deixe em branco para usar a senha ja configurada no ambiente' : 'Digite a senha do banco'}
                required={!status?.config?.hasPasswordConfigured}
              />

              {status?.config?.hasPasswordConfigured && (
                <p className="text-sm text-white/60">
                  A senha do banco ja esta configurada no servidor. Se voce nao alterar host, porta, usuario e banco, pode deixar este campo em branco.
                </p>
              )}
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <UserCog className="w-5 h-5 text-cyan-300" />
                Administrador Inicial
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <InputField label="Nome" value={formData.adminName} onChange={(value) => handleChange('adminName', value)} placeholder="Administrador" />
                <InputField label="Email" type="email" value={formData.adminEmail} onChange={(value) => handleChange('adminEmail', value)} placeholder="admin@seudominio.com" />
              </div>

              <InputField
                label="Senha do admin"
                type="password"
                value={formData.adminPassword}
                onChange={(value) => handleChange('adminPassword', value)}
                placeholder="Minimo de 8 caracteres"
              />
            </section>

            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-200">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-4 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Instalando...' : 'Executar instalacao'}
            </button>
          </form>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
              <h2 className="text-xl font-semibold">Status Atual</h2>
            </div>
            <p className="text-white/80">{statusLabel}</p>
            {status?.error && (
              <p className="text-sm text-amber-300 mt-3">{status.error}</p>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-3">
            <h2 className="text-xl font-semibold">O que sera feito</h2>
            <p className="text-white/70">1. Validar a conexao com o banco informado.</p>
            <p className="text-white/70">2. Criar o banco caso ele ainda nao exista.</p>
            <p className="text-white/70">3. Executar a migracao inicial das tabelas e dados basicos.</p>
            <p className="text-white/70">4. Criar o primeiro usuario administrador.</p>
          </div>
        </motion.aside>
      </div>
    </div>
  )
}

interface InputFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  required?: boolean
}

function InputField({ label, value, onChange, placeholder, type = 'text', required = true }: InputFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm text-white/70">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        required={required}
      />
    </label>
  )
}
