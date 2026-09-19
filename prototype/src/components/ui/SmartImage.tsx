import { useState } from 'react'
import { Landmark } from 'lucide-react'

interface SmartImageProps {
  src?: string
  alt: string
  className?: string
}

export function SmartImage({ src, alt, className }: SmartImageProps) {
  const [failed, setFailed] = useState(!src)

  if (failed) {
    return (
      <div className={`smart-image-fallback ${className ?? ''}`} role="img" aria-label={alt}>
        <Landmark size={28} strokeWidth={1.6} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
