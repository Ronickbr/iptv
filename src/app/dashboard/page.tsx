'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      router.push('/login')
      return
    }

    try {
      // Decode token to get user role
      const payload = JSON.parse(atob(token.split('.')[1]))
      
      if (payload.role === 'admin') {
        router.push('/dashboard/admin')
      } else {
        router.push('/dashboard/client')
      }
    } catch (error) {
      // Invalid token, redirect to login
      localStorage.removeItem('token')
      router.push('/login')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
    </div>
  )
}