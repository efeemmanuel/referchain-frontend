import { create } from 'zustand'
import { User, Tokens, Hospital } from '../lib/types'

interface AuthState {
  user: User | null
  tokens: Tokens | null
  hospital: Hospital | null
  isAuthenticated: boolean
  setAuth: (user: User, tokens: Tokens, hospital?: Hospital) => void
  setHospital: (hospital: Hospital) => void
  logout: () => void
  getUser: () => User | null
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: (() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })(),
  tokens: (() => {
    const access = localStorage.getItem('access_token')
    const refresh = localStorage.getItem('refresh_token')
    return access && refresh ? { access, refresh } : null
  })(),
  hospital: (() => {
    try {
      const stored = localStorage.getItem('hospital')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })(),
  isAuthenticated: !!localStorage.getItem('access_token'),

  setAuth: (user, tokens, hospital) => {
    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    localStorage.setItem('user', JSON.stringify(user))
    if (hospital) localStorage.setItem('hospital', JSON.stringify(hospital))
    set({ user, tokens, hospital: hospital || null, isAuthenticated: true })
  },

  setHospital: (hospital) => {
    localStorage.setItem('hospital', JSON.stringify(hospital))
    set({ hospital })
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    localStorage.removeItem('hospital')
    set({ user: null, tokens: null, hospital: null, isAuthenticated: false })
  },

  getUser: () => get().user,
}))
