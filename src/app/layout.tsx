import type { Metadata } from 'next'
import { DM_Mono, Syne } from 'next/font/google'
import './globals.css'

const syne = Syne({ subsets: ['latin'], variable: '--font-syne' })
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-dm-mono' })

export const metadata: Metadata = {
  title: 'SoilDash',
  description: 'Dashboard IoT para monitoramento de umidade do solo com ESP32 e sensor HD-38. Dados em tempo real, histórico e previsão meteorológica.',
  keywords: ['monitoramento solo', 'umidade solo', 'ESP32', 'IoT', 'agricultura', 'sensor HD-38'],
  alternates: {
    canonical: 'https://soildash.vercel.app',
  },
  verification: {
    google: 'D7nKj0ZsMGJCM8Z78IvbROSU58tZqU_Db7TL_2IEdBk',
  },
  openGraph: {
    title: 'SoilDash — Monitoramento de Solo em Tempo Real',
    description: 'Dashboard IoT para monitoramento de umidade do solo com ESP32 e sensor HD-38.',
    url: 'https://soildash.vercel.app',
    siteName: 'SoilDash',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/og-image',
        width: 1200,
        height: 630,
        alt: 'SoilDash — Dashboard de Monitoramento de Solo',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SoilDash — Monitoramento de Solo em Tempo Real',
    description: 'Dashboard IoT para monitoramento de umidade do solo com ESP32 e sensor HD-38.',
    images: ['/og-image'],
  },
  icons: {
    icon: '/favicon.ico'
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${syne.variable} ${dmMono.variable} font-sans antialiased`}
        suppressHydrationWarning>
        {children}
        <footer className="text-xs text-stone-500 text-center py-6">
          SoilDash — monitoramento de umidade do solo com ESP32 e sensor HD-38. Projeto FETIN 2026 · Inatel.
        </footer>
      </body>
    </html>
  )
}