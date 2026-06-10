'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetchJson, clearLegacyToken } from '../../lib/api'
import { useInstallationStatus } from '../hooks/useInstallationStatus'

export default function DashboardRedirect() {
  const router = useRouter()
  const { loading: installationLoading, status } = useInstallationStatus({
    redirectIfSetupRequired: true
  })

  useEffect(() => {
    if (installationLoading || !status?.installed) {
      return
    }

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
  }, [installationLoading, router, status?.installed])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
    </div>
  )
}
