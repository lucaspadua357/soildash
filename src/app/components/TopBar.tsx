'use client'

import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TopBarProps {
  isConnected: boolean
  lastUpdate: Date | null
}

export default function TopBar({ isConnected, lastUpdate }: TopBarProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-2">
        <div className="relative flex h-3 w-3">
          {isConnected && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          )}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-stone-100">SoilDash</h1>
      </div>

      <p className="text-[10px] font-mono text-stone-500 tracking-widest">
        ESP32 · HD-38 · LIVE
      </p>

      <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-stone-700 text-[10px] font-mono text-stone-400">
        <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        {isConnected ? '192.168.1.42' : 'desconectado'}
        {lastUpdate && (
          <span className="text-stone-600">
            · {formatDistanceToNow(lastUpdate, { addSuffix: true, locale: ptBR })}
          </span>
        )}
      </div>
    </div>
  )
}