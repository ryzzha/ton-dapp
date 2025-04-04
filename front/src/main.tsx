import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TonConnectUIProvider } from '@tonconnect/ui-react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TonConnectUIProvider manifestUrl="https://alefmanvladimir.github.io/my-twa/tonconnect-manifest.json">
      <App />
    </TonConnectUIProvider>
  </StrictMode>,
)
