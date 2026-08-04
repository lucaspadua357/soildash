'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

interface DataPoint {
  time: string
  humidity: number
  temperature?: number
}

interface HumidityChartProps {
  history: DataPoint[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-xs font-mono">
        <p className="text-stone-400 mb-1">{label}</p>
        <p className="text-green-400">Umidade: {payload[0]?.value}%</p>
      </div>
    )
  }
  return null
}

export default function HumidityChart({ history }: HumidityChartProps) {
  return (
    <div className="bg-stone-900 rounded-xl border border-stone-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-stone-200">Umidade do solo — últimas 24h</h2>
        <span className="text-[10px] font-mono text-stone-500 bg-stone-800 px-2 py-1 rounded">HD-38 ADC</span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="humidGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: '#78716c', fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
            interval={3}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#78716c', fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
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
    </div>
  )
}
