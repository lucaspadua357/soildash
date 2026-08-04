import type { Metadata } from 'next'
import { DM_Mono, Syne } from 'next/font/google'
import './globals.css'

const syne = Syne({ subsets: ['latin'], variable: '--font-syne' })
const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-mono',   // nome registrado em @theme no globals.css
})

export const metadata: Metadata = {
  title: 'SoilWatch',
  description: 'Dashboard de monitoramento de umidade do solo com ESP32 e sensor HD-38',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${syne.variable} ${dmMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
