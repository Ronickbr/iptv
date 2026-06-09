'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetchJson, clearLegacyToken } from '../../lib/api'

type UserRole = 'admin' | 'client'

export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  role: UserRole
}

interface ProfileResponse {
  profile: {
    id: string
    name: string
    email: string
    role: UserRole
  }
}

export function useAuthenticatedUser(requiredRole?: UserRole) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const logout = useCallback(async () => {
    try {
      await apiFetchJson('/auth/logout', { method: 'POST' })
    } catch {
      // Even if the API logout fails, clear any legacy client token and force re-auth.
    } finally {
      clearLegacyToken()
      setUser(null)
      router.replace('/login')
    }
  }, [router])

  const loadUser = useCallback(async () => {
    try {
      clearLegacyToken()
      const data = await apiFetchJson<ProfileResponse>('/user/profile')
      const nextUser: AuthenticatedUser = {
        id: data.profile.id,
        name: data.profile.name || (data.profile.role === 'admin' ? 'Admin' : 'Cliente'),
        email: data.profile.email,
        role: data.profile.role
      }

      if (requiredRole && nextUser.role !== requiredRole) {
        router.replace(requiredRole === 'admin' ? '/dashboard/client' : '/dashboard/admin')
        return null
      }

      setUser(nextUser)
      return nextUser
    } catch {
      setUser(null)
      router.replace('/login')
      return null
    } finally {
      setLoading(false)
    }
  }, [requiredRole, router])

  useEffect(() => {
    void loadUser()
  }, [loadUser])

  return {
    user,
    loading,
    logout,
    refreshUser: loadUser
  }
}
