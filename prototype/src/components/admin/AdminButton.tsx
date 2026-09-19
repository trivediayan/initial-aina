import './AdminButton.css'

interface AdminButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  icon?: string
}

export function AdminButton({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  icon,
}: AdminButtonProps) {
  return (
    <button
      type={type}
      className={`admin-button admin-button-${variant} admin-button-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && <span className="button-icon">{icon}</span>}
      {children}
    </button>
  )
}
