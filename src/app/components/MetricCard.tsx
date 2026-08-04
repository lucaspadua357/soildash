interface MetricCardProps {
  label: string
  value: number
  unit: string
  icon: string
  trend: string | null
  status: 'ok' | 'low' | 'high'
}

const statusStyles = {
  ok: 'text-green-400',
  low: 'text-amber-400',
  high: 'text-red-400',
}

export default function MetricCard({ label, value, unit, icon, trend, status }: MetricCardProps) {
  return (
    <div className="bg-stone-900 rounded-xl p-4 border border-stone-800">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-sm">{icon}</span>
        <span className="text-[10px] font-mono tracking-widest text-stone-500">{label}</span>
      </div>

      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold font-mono tabular-nums ${statusStyles[status]}`}>
          {typeof value === 'number' ? value.toFixed(value % 1 === 0 ? 0 : 1) : '--'}
        </span>
        <span className="text-sm text-stone-500 font-mono">{unit}</span>
      </div>

      {trend && (
        <p className="text-[11px] font-mono text-stone-500 mt-1.5">{trend}</p>
      )}
    </div>
  )
}
