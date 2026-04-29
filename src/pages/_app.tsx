import '@/styles/globals.css'

import type { AppProps } from 'next/app'
import type React from 'react'

import { AuthProvider } from '@/contexts/auth-context'

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}

export default App
