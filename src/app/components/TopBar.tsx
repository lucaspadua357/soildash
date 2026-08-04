'use client'

import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TopBarProps {
  isConnected: boolean
  lastUpdate: Date | null
}

export default function TopBar({ isConnected, lastUpdate }: TopBarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative flex h-3 w-3">
          {isConnected && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          )}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-stone-100">SoilWatch</h1>
          <p className="text-xs font-mono text-stone-500 tracking-widest">ESP32 · HD-38 · LIVE</p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-700 text-xs font-mono text-stone-400">
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        {isConnected ? '192.168.1.42' : 'desconectado'}
        {lastUpdate && (
          <span className="text-stone-600 ml-1">
            · {formatDistanceToNow(lastUpdate, { addSuffix: true, locale: ptBR })}
          </span>
        )}
      </div>
    </div>
  )
}
