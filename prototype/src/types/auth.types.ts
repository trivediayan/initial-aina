export interface User {
  id: string
  full_name: string
  email: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  full_name: string
  email: string
  password: string
  confirm_password: string
}
