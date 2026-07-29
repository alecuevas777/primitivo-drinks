import { useEffect, useState } from 'react'

const QUERIES = {
  mobile: '(max-width: 768px)',
  tablet: '(max-width: 1024px)',
}

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const media = window.matchMedia(query)
    const handler = (event) => setMatches(event.matches)

    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [query])

  return matches
}

export function useIsMobile() {
  return useMediaQuery(QUERIES.mobile)
}

export function useIsTablet() {
  return useMediaQuery(QUERIES.tablet)
}
