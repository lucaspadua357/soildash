'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { TimeRange } from '../lib/useSensorData'

interface DataPoint {
  time: string
  humidity: number
}

interface HumidityChartProps {
  history:      DataPoint[]
  timeRange:    TimeRange
  onRangeChange: (range: TimeRange) => void
}

const RANGES: { value: TimeRange; label: string }[] = [
  { value: '1h',  label: '1h'  },
  { value: '6h',  label: '6h'  },
  { value: '24h', label: '24h' },
  { value: '7d',  label: '7d'  },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-xs font-mono">
        <p className="text-stone-400 mb-1">{label}</p>
        <p className="text-green-400">Umidade: {payload[0]?.value?.toFixed(1)}%</p>
      </div>
    )
  }
  return null
}

export default function HumidityChart({ history, timeRange, onRangeChange }: HumidityChartProps) {
  return (
    <div className="bg-stone-900 rounded-xl border border-stone-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-stone-200">Umidade do solo</h2>

        {/* Seletor de período */}
        <div className="flex items-center gap-1 bg-stone-800 rounded-lg p-1">
          {RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => onRangeChange(r.value)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                timeRange === r.value
                  ? 'bg-stone-600 text-stone-100'
                  : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <span className="text-[10px] font-mono text-stone-500 bg-stone-800 px-2 py-1 rounded">
          HD-38 ADC
        </span>
      </div>

      {history.length === 0 ? (
        <div className="flex items-center justify-center h-[200px]">
          <p className="text-xs font-mono text-stone-600 animate-pulse">carregando histórico...</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="humidGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#78716c', fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#78716c', fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="humidity"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#humidGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#22c55e', stroke: '#14532d' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}