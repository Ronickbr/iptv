'use client'

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

interface ApiErrorWithCode {
  code?: string
}

function normalizeApiPath(path: string) {
  if (path.startsWith('/api/')) {
    return path
  }

  if (path.startsWith('/')) {
    return `/api${path}`
  }

  return `/api/${path}`
}

export function clearLegacyToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
  }
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)

  if (!headers.has('X-Requested-With')) {
    headers.set('X-Requested-With', 'XMLHttpRequest')
  }

  return fetch(normalizeApiPath(path), {
    ...init,
    headers,
    credentials: 'same-origin'
  })
}

export async function apiFetchJson<T>(path: string, init: RequestInit = {}) {
  const response = await apiFetch(path, init)
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message = typeof data === 'object' && data && 'message' in data
      ? String(data.message)
      : 'Erro ao processar a requisicao'

    throw new ApiError(message, response.status, data)
  }

  return data as T
}

export function isInstallRequiredError(error: unknown) {
  if (!(error instanceof ApiError)) {
    return false
  }

  const data = error.data as ApiErrorWithCode | null
  return error.status === 503 && data?.code === 'INSTALL_REQUIRED'
}
