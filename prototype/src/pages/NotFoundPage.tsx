import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import './NotFoundPage.css'

export function NotFoundPage() {
  return (
    <main className="phase-shell">
      <section className="phase-card">
        <p className="phase-eyebrow">AINA</p>
        <h1>Page not found</h1>
        <p className="phase-copy">This route is not part of Phase 1.</p>
        <Link className="phase-link" to={ROUTES.home}>
          Back to home
        </Link>
      </section>
    </main>
  )
}
