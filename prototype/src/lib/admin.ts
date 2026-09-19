function readAdminEmail(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase()
  return fromEnv || 'parthjbariya@gmail.com'
}

export const ADMIN_EMAIL = readAdminEmail()

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return email.trim().toLowerCase() === ADMIN_EMAIL
}
