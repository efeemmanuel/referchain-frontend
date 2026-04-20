import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getApiError(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const err = error as { response?: { data?: Record<string, unknown> } }
    const data = err.response?.data

    if (!data) return 'Something went wrong. Please try again.'

    // Handle DRF validation errors — they come as { field: ['error'] }
    if (typeof data === 'object') {
      const messages: string[] = []
      for (const key in data) {
        const value = data[key]
        if (Array.isArray(value)) {
          messages.push(...value.map(String))
        } else if (typeof value === 'string') {
          messages.push(value)
        }
      }
      if (messages.length > 0) return messages[0]
    }
  }

  return 'Something went wrong. Please try again.'
}

export function urgencyColor(level: string) {
  switch (level) {
    case 'critical': return 'badge-critical'
    case 'high': return 'badge-high'
    case 'medium': return 'badge-medium'
    case 'low': return 'badge-low'
    default: return 'badge-low'
  }
}

export function statusColor(status: string) {
  switch (status) {
    case 'pending': return 'badge-pending'
    case 'accepted': return 'badge-accepted'
    case 'rejected': return 'badge-rejected'
    case 'completed': return 'badge-completed'
    default: return 'badge-pending'
  }
}
