'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useLandingPageSettings } from '../hooks/useLandingPageSettings'

export default function DynamicTitle() {
  const { settings } = useLandingPageSettings()
  const pathname = usePathname()

  const getPageTitle = (baseName: string, currentPath: string) => {
    // Mapeamento de rotas para títulos específicos
    const routeTitles: { [key: string]: string } = {
      '/': baseName,
      '/login': `${baseName} - Login`,
      '/register': `${baseName} - Cadastro`,
      '/dashboard': `${baseName} - Dashboard`,
      '/dashboard/admin': `${baseName} - Painel Admin`,
      '/dashboard/admin/users': `${baseName} - Gerenciar Usuários`,
      '/dashboard/admin/landing-page': `${baseName} - Configurar Landing Page`,
      '/dashboard/client': `${baseName} - Painel Cliente`,
      '/payment': `${baseName} - Pagamento`,
    }

    // Verificar correspondência exata primeiro
    if (routeTitles[currentPath]) {
      return routeTitles[currentPath]
    }

    // Verificar correspondências parciais para rotas dinâmicas
    if (currentPath.startsWith('/dashboard/admin')) {
      return `${baseName} - Painel Admin`
    }
    if (currentPath.startsWith('/dashboard/client')) {
      return `${baseName} - Painel Cliente`
    }
    if (currentPath.startsWith('/dashboard')) {
      return `${baseName} - Dashboard`
    }

    // Fallback para o nome base
    return baseName
  }

  useEffect(() => {
    if (settings?.site?.title) {
      const pageTitle = getPageTitle(settings.site.title, pathname)
      document.title = pageTitle
    }
    if (settings?.site?.description) {
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', settings.site.description)
      } else {
        const meta = document.createElement('meta')
        meta.name = 'description'
        meta.content = settings.site.description
        document.head.appendChild(meta)
      }
    }
  }, [settings, pathname])

  return null
}