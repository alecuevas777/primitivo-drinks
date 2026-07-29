import { Suspense } from 'react'
import Loader from './Loader'

export default function PageLoader({ children }) {
  return <Suspense fallback={<Loader />}>{children}</Suspense>
}
