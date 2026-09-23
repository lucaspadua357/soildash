import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0c0a09',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Grid de fundo */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, #292524 1px, transparent 0)',
          backgroundSize: '40px 40px',
          opacity: 0.4,
        }} />

        {/* Gradiente verde no centro */}
        <div style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
        }} />

        {/* Ícone gota */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          fontSize: '40px',
        }}>
          💧
        </div>

        {/* Título */}
        <div style={{
          fontSize: '72px',
          fontWeight: 700,
          color: '#f5f5f4',
          letterSpacing: '-2px',
          marginBottom: '16px',
        }}>
          SoilDash
        </div>

        {/* Subtítulo */}
        <div style={{
          fontSize: '24px',
          color: '#78716c',
          letterSpacing: '4px',
          marginBottom: '48px',
          textTransform: 'uppercase',
        }}>
          ESP32 · HD-38 · LIVE
        </div>

        {/* Descrição */}
        <div style={{
          fontSize: '20px',
          color: '#a8a29e',
          textAlign: 'center',
          maxWidth: '700px',
          lineHeight: 1.5,
          marginBottom: '48px',
        }}>
          Monitoramento de umidade do solo em tempo real com IoT e dashboard web
        </div>

        {/* Tags */}
        <div style={{
          display: 'flex',
          gap: '12px',
        }}>
          {['Next.js 15', 'Supabase', 'ESP32', 'Open-Meteo', 'Inatel FETIN 2026'].map(tag => (
            <div key={tag} style={{
              padding: '8px 16px',
              borderRadius: '999px',
              border: '1px solid #292524',
              background: 'rgba(28,25,23,0.8)',
              color: '#78716c',
              fontSize: '14px',
            }}>
              {tag}
            </div>
          ))}
        </div>

        {/* Badge verde */}
        <div style={{
          position: 'absolute',
          top: '40px',
          right: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '999px',
          border: '1px solid rgba(34,197,94,0.3)',
          background: 'rgba(34,197,94,0.1)',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#22c55e',
          }} />
          <span style={{ color: '#22c55e', fontSize: '14px' }}>online</span>
        </div>

        {/* URL */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          color: '#57534e',
          fontSize: '14px',
          letterSpacing: '1px',
        }}>
          soilwatch-fetin.vercel.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}