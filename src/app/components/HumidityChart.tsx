'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
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
  humidityMin:   number
  humidityMax:   number
}

const RANGES: { value: TimeRange; label: string }[] = [
  { value: '1h',  label: '1h'  },
  { value: '12h', label: '12h' },
  { value: '7d',  label: '7d'  },
]

function getColor(v: number, min: number, max: number) {
  if (v >= 85)       return '#3b82f6'  // azul — encharcado
  if (v >= min)      return '#22c55e'  // verde — ideal
  return '#ef4444'                      // vermelho — seco
}

function getStatus(v: number, min: number, max: number) {
  if (v >= 85)  return 'Solo Encharcado'
  if (v >= min) return 'Solo Ideal'
  return 'Solo Seco'
}

export default function HumidityChart({ history, timeRange, onRangeChange, humidityMin, humidityMax }: HumidityChartProps) {
  const lastValid = [...history].reverse().find(h => h.humidity > 0)
  const lastValue = lastValid?.humidity ?? 0
  const lastColor = getColor(lastValue, humidityMin, humidityMax)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const v = payload[0]?.value
    if (v == null) return null
    const color = getColor(v, humidityMin, humidityMax)
    return (
      <div className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
        <p className="text-stone-400 mb-1">{label}</p>
        <p style={{ color }} className="font-bold text-base">{v.toFixed(1)}%</p>
        <p style={{ color }} className="text-[10px] opacity-70">{getStatus(v, humidityMin, humidityMax)}</p>
      </div>
    )
  }

  return (
    <div className="bg-stone-900 rounded-xl border border-stone-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium text-stone-200">Umidade do solo</h2>
          {lastValue > 0 && (
            <p className="text-[10px] font-mono text-stone-500 mt-0.5">
              último valor:{' '}
              <span style={{ color: lastColor }} className="font-bold">
                {lastValue.toFixed(1)}%
              </span>
              {' '}· {getStatus(lastValue, humidityMin, humidityMax)}
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
        <div className="flex items-center justify-center h-50">
          <p className="text-xs font-mono text-stone-600 animate-pulse">Aguardando dados...</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={history}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            barCategoryGap="20%"
          >
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
              cursor={{ fill: '#292524' }}
            />

            <Bar dataKey="humidity" radius={[3, 3, 0, 0]}>
              {history.map((entry, i) => (
                <Cell
                  key={i}
                  fill={getColor(entry.humidity, humidityMin, humidityMax)}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}