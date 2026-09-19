import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { ROUTES } from '@/constants/routes'
import type { User, AuthState, LoginCredentials, RegisterCredentials } from '@/types/auth.types'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  resendVerification: (email: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function isEmailVerified(sessionUser: { email_confirmed_at?: string | null }): boolean {
  return Boolean(sessionUser.email_confirmed_at)
}

function toUser(sessionUser: { id: string; email?: string; user_metadata?: { full_name?: string } }): User {
  return {
    id: sessionUser.id,
    full_name: sessionUser.user_metadata?.full_name || '',
    email: sessionUser.email || '',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let mounted = true
    const authClient = supabase

    async function initializeAuth() {
      if (!authClient) {
        if (mounted) setState({ user: null, loading: false, error: null })
        return
      }

      try {
        const { data: { session } } = await authClient.auth.getSession()
        if (!mounted) return
        if (session?.user && isEmailVerified(session.user)) {
          setState({ user: toUser(session.user), loading: false, error: null })
        } else {
          if (session?.user) void authClient.auth.signOut()
          setState({ user: null, loading: false, error: null })
        }
      } catch {
        if (mounted) setState({ user: null, loading: false, error: 'Failed to initialize auth' })
      }
    }

    initializeAuth()

    if (!authClient) return () => { mounted = false }

    const { data: { subscription } } = authClient.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (session?.user && isEmailVerified(session.user)) {
        setState({ user: toUser(session.user), loading: false, error: null })
      } else {
        if (session?.user) void authClient.auth.signOut()
        setState({ user: null, loading: false, error: null })
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = async ({ email, password }: LoginCredentials) => {
    if (!supabase) throw new Error('Supabase is not configured')
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (!data.user || !isEmailVerified(data.user)) {
        await supabase.auth.signOut()
        throw new Error('Please verify your email before signing in.')
      }
      setState({ user: toUser(data.user), loading: false, error: null })
    } catch (error) {
      setState({ user: null, loading: false, error: error instanceof Error ? error.message : 'Login failed' })
      throw error
    }
  }

  const register = async ({ full_name, email, password, confirm_password }: RegisterCredentials) => {
    if (!supabase) throw new Error('Supabase is not configured')
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      if (password !== confirm_password) throw new Error('Passwords do not match')
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name },
          emailRedirectTo: `${window.location.origin}${ROUTES.login}`,
        },
      })
      if (error) throw error
      if (data.session) await supabase.auth.signOut()
      setState({ user: null, loading: false, error: null })
    } catch (error) {
      setState({ user: null, loading: false, error: error instanceof Error ? error.message : 'Registration failed' })
      throw error
    }
  }

  const resendVerification = async (email: string) => {
    if (!supabase) throw new Error('Supabase is not configured')
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${window.location.origin}${ROUTES.login}` },
      })
      if (error) throw error
      setState((prev) => ({ ...prev, loading: false, error: null }))
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Could not resend verification email' }))
      throw error
    }
  }
  const logout = async () => {
    if (!supabase) {
      setState({ user: null, loading: false, error: null })
      return
    }
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setState({ user: null, loading: false, error: null })
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Logout failed' }))
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    if (!supabase) throw new Error('Supabase is not configured')
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      setState((prev) => ({ ...prev, loading: false, error: null }))
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Password reset failed' }))
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, resendVerification, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
