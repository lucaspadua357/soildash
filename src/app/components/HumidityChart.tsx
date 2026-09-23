'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { TimeRange } from '../lib/useSensorData'

interface DataPoint {
  time: string
  humidity: number
}

interface HumidityChartProps {
  history:       DataPoint[]
  timeRange:     TimeRange
  onRangeChange: (range: TimeRange) => void
}

const RANGES: { value: TimeRange; label: string }[] = [
  { value: '1h',  label: '1h'  },
  { value: '12h', label: '12h' },
  { value: '7d',  label: '7d'  },
]

function getColor(v: number) {
  if (v < 25)  return '#ef4444'
  if (v < 45)  return '#f59e0b'
  if (v <= 75) return '#22c55e'
  return '#3b82f6'
}

function getStatus(v: number) {
  if (v < 25)  return 'seco'
  if (v < 45)  return 'atenção'
  if (v <= 75) return 'ideal'
  return 'saturado'
}

// Gera stops do gradiente baseado na posição percentual de cada ponto
function buildGradientStops(data: DataPoint[]) {
  if (data.length === 0) return []
  return data.map((d, i) => ({
    offset: `${(i / (data.length - 1)) * 100}%`,
    color:  getColor(d.humidity),
  }))
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const v = payload[0]?.value
  if (v == null) return null
  const color = getColor(v)
  return (
    <div className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
      <p className="text-stone-400 mb-1">{label}</p>
      <p style={{ color }} className="font-bold text-base">{v.toFixed(1)}%</p>
      <p style={{ color }} className="text-[10px] opacity-70">{getStatus(v)}</p>
    </div>
  )
}

const CustomDot = (props: any) => {
  const { cx, cy, value } = props
  if (value == null) return null
  return <circle cx={cx} cy={cy} r={3} fill={getColor(value)} stroke="#1c1917" strokeWidth={1.5} />
}

const CustomActiveDot = (props: any) => {
  const { cx, cy, value } = props
  if (value == null) return <g />
  return <circle cx={cx} cy={cy} r={5} fill={getColor(value)} stroke="#1c1917" strokeWidth={2} />
}

export default function HumidityChart({ history, timeRange, onRangeChange }: HumidityChartProps) {
  const lastValid = [...history].reverse().find(h => h.humidity > 0)
  const lastValue = lastValid?.humidity ?? 0
  const stops = buildGradientStops(history)

  return (
    <div className="bg-stone-900 rounded-xl border border-stone-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium text-stone-200">Umidade do solo</h2>
          {lastValue > 0 && (
            <p className="text-[10px] font-mono text-stone-500 mt-0.5">
              último valor:{' '}
              <span style={{ color: getColor(lastValue) }} className="font-bold">
                {lastValue.toFixed(1)}%
              </span>
              {' '}· {getStatus(lastValue)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
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
            HD-38
          </span>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="flex items-center justify-center h-[200px]">
          <p className="text-xs font-mono text-stone-600 animate-pulse">aguardando dados...</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={history} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                {stops.map((stop, i) => (
                  <stop key={i} offset={stop.offset} stopColor={stop.color} />
                ))}
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />

            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#57534e', fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
              minTickGap={timeRange === '7d' ? 20 : 50}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#57534e', fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `${v}%`}
              ticks={[0, 25, 50, 75, 100]}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#57534e', strokeWidth: 1, strokeDasharray: '4 4' }}
            />

            <Line
              type="monotone"
              dataKey="humidity"
              stroke="url(#lineGradient)"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={<CustomActiveDot />}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}