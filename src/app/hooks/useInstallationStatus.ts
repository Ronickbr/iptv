'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetchJson } from '../../lib/api'

export interface InstallationStatus {
  installed: boolean
  needsSetup: boolean
  databaseReachable: boolean
  schemaReady: boolean
  adminReady: boolean
  error?: string
  config?: {
    host?: string
    port?: number
    user?: string
    database?: string
    hasSavedConfig?: boolean
    hasPasswordConfigured?: boolean
    source?: 'environment' | 'installer'
  }
}

interface UseInstallationStatusOptions {
  redirectIfSetupRequired?: boolean
  redirectIfInstalled?: boolean
  setupRedirectTo?: string
  installedRedirectTo?: string
}

export function useInstallationStatus(options: UseInstallationStatusOptions = {}) {
  const {
    redirectIfSetupRequired = false,
    redirectIfInstalled = false,
    setupRedirectTo = '/install',
    installedRedirectTo = '/'
  } = options

  const [status, setStatus] = useState<InstallationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const data = await apiFetchJson<{ installation: InstallationStatus }>('/install/status')
        setStatus(data.installation)

        if (redirectIfSetupRequired && !data.installation.installed) {
          router.replace(setupRedirectTo)
          return
        }

        if (redirectIfInstalled && data.installation.installed) {
          router.replace(installedRedirectTo)
          return
        }
      } catch (error) {
        console.error('Falha ao carregar status de instalacao:', error)
      } finally {
        setLoading(false)
      }
    }

    void loadStatus()
  }, [installedRedirectTo, redirectIfInstalled, redirectIfSetupRequired, router, setupRedirectTo])

  return {
    status,
    loading
  }
}
