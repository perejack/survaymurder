import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    // Scroll to top on every route change
    if (hash) {
      const id = hash.replace('#', '')
      const el = typeof document !== 'undefined' ? document.getElementById(id) : null
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname, hash])

  return null
}

export default ScrollToTop
