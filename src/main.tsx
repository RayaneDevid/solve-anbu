import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { router } from './router'
import './index.css'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#E0E0E0',
            border: '1px solid #2A2A2A',
            borderRadius: '2px',
            fontSize: '13px',
          },
          success: {
            style: { borderLeft: '3px solid #1B4332' },
          },
          error: {
            style: { borderLeft: '3px solid #8B0000' },
          },
        }}
      />
    </QueryClientProvider>
  </StrictMode>,
)
