import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@mantine/core/styles.css'
import { ProductMediaPage } from '../pages/product-media/ProductMediaPage.tsx'
import './index.css'
import { AppProviders } from './providers.tsx'

const rootElement = document.getElementById('root')

if (rootElement === null) {
  throw new Error('Root element #root is missing')
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <ProductMediaPage />
    </AppProviders>
  </StrictMode>,
)
