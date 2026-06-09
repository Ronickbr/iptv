'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetchJson, clearLegacyToken } from '../../lib/api'

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    const redirectToDashboard = async () => {
      try {
        clearLegacyToken()
        const data = await apiFetchJson<{ profile: { role: 'admin' | 'client' } }>('/user/profile')
        router.replace(data.profile.role === 'admin' ? '/dashboard/admin' : '/dashboard/client')
      } catch {
        router.replace('/login')
      }
    }

    void redirectToDashboard()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
    </div>
  )
}
