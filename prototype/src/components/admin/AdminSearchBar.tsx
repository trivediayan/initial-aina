import { useState } from 'react'
import './AdminSearchBar.css'

interface AdminSearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onClear?: () => void
}

export function AdminSearchBar({ value, onChange, placeholder = 'Search...', onClear }: AdminSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleClear = () => {
    onChange('')
    onClear?.()
  }

  return (
    <div className={`admin-search-bar ${isFocused ? 'focused' : ''}`}>
      <span className="search-icon">🔍</span>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="search-input"
      />
      {value && (
        <button className="clear-button" onClick={handleClear} title="Clear search">
          ✕
        </button>
      )}
    </div>
  )
}
