'use client'

import { useEffect, useState } from 'react'

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<'intro' | 'text' | 'out'>('intro')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 600)
    const t2 = setTimeout(() => setPhase('out'), 3000)
    const t3 = setTimeout(() => onFinish(), 3600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onFinish])

  return (
    <div className={`fixed inset-0 z-50 bg-stone-950 flex flex-col items-center justify-center
      transition-opacity duration-500 ${phase === 'out' ? 'opacity-0' : 'opacity-100'}`}>

      {/* Anel animado */}
      <div className="relative flex items-center justify-center mb-8">
        <div className={`absolute w-32 h-32 rounded-full border-2 border-green-500/20
          transition-all duration-1000 ${phase === 'intro' ? 'scale-50 opacity-0' : 'scale-100 opacity-100'}`} />
        <div className={`absolute w-24 h-24 rounded-full border border-green-500/30
          transition-all duration-1000 delay-100 ${phase === 'intro' ? 'scale-50 opacity-0' : 'scale-100 opacity-100'}`} />

        {/* Ícone central */}
        <div className={`relative w-16 h-16 rounded-full bg-stone-900 border border-stone-700
          flex items-center justify-center transition-all duration-700
          ${phase === 'intro' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
          <svg viewBox="0 0 40 40" className="w-8 h-8">
            {/* Gota de água */}
            <path
              d="M20 4 C20 4 8 18 8 26 C8 33 13.4 38 20 38 C26.6 38 32 33 32 26 C32 18 20 4 20 4Z"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              strokeLinecap="round"
              className={`transition-all duration-1000 delay-300 ${
                phase === 'intro' ? '[stroke-dasharray:100] [stroke-dashoffset:100]' : '[stroke-dasharray:100] [stroke-dashoffset:0]'
              }`}
            />
            {/* Solo */}
            <line x1="6" y1="30" x2="34" y2="30" stroke="#78716c" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="10" y1="33" x2="30" y2="33" stroke="#57534e" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>

        {/* Ping animado */}
        {phase === 'text' && (
          <div className="absolute w-32 h-32 rounded-full border border-green-500/20 animate-ping" />
        )}
      </div>

      {/* Texto */}
      <div className={`text-center transition-all duration-700 delay-200
        ${phase === 'intro' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <h1 className="text-3xl font-bold text-stone-100 tracking-tight mb-1">SoilDash</h1>
        <p className="text-xs font-mono text-stone-500 tracking-widest mb-6">
          ESP32 · HD-38 · LIVE
        </p>

        {/* Barra de progresso */}
        <div className="w-48 h-0.5 bg-stone-800 rounded-full overflow-hidden mx-auto">
          <div className={`h-full bg-green-500 rounded-full transition-all duration-2000 ease-linear
            ${phase === 'text' ? 'w-full' : 'w-0'}`} />
        </div>

        <p className={`text-[10px] font-mono text-stone-600 mt-3 transition-all duration-500 delay-500
          ${phase === 'text' ? 'opacity-100' : 'opacity-0'}`}>
          Monitoramento de solo em tempo real
        </p>
      </div>

    </div>
  )
}