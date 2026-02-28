import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fintrack - Seguimiento de Gastos y Presupuestos',
    short_name: 'Fintrack',
    description: 'Controla tus finanzas personales con seguimiento de gastos, presupuestos y reportes visuales. Soporte multi-moneda USD/COP.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#2cb67d',
    lang: 'es',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
