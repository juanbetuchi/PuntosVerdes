import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Puntos Verdes — Municipalidad de Laboulaye',
  description: 'Red de puntos de reciclaje y gestión de residuos de Laboulaye, Córdoba.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-[#1a3a2a] text-white min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  )
}
