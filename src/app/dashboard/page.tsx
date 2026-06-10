'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetchJson, clearLegacyToken } from '../../lib/api'

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    const loadProfile = async () => {
      try {
        clearLegacyToken()
        const data = await apiFetchJson<{
          profile: {
            role: 'admin' | 'client'
          }
        }>('/user/profile')

        if (data.profile.role === 'admin') {
          router.replace('/dashboard/admin')
        } else {
          router.replace('/dashboard/client')
        }
      } catch {
        router.replace('/login')
      }
    }

    void loadProfile()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
    </div>
  )
}
