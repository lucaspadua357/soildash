import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface Alert {
  id: string
  type: 'warn' | 'ok' | 'info' | 'error'
  message: string
  timestamp: Date
}

interface AlertsPanelProps {
  alerts: Alert[]
}

const dotColors = {
  warn: 'bg-amber-400',
  ok: 'bg-green-400',
  info: 'bg-blue-400',
  error: 'bg-red-400',
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <div className="bg-stone-900 rounded-xl border border-stone-800 p-4">
      <h2 className="text-sm font-medium text-stone-200 mb-4">Alertas recentes</h2>

      {alerts.length === 0 ? (
        <p className="text-xs font-mono text-stone-600 text-center py-4">Sem alertas</p>
      ) : (
        <div className="space-y-0">
          {alerts.map((alert, i) => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 py-2.5 ${
                i < alerts.length - 1 ? 'border-b border-stone-800' : ''
              }`}
            >
              <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${dotColors[alert.type]}`} />
              <div>
                <p className="text-xs font-mono text-stone-300 leading-relaxed">{alert.message}</p>
                <p className="text-[10px] font-mono text-stone-600 mt-0.5">
                  {formatDistanceToNow(alert.timestamp, { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
