'use client'

interface GaugeCardProps {
  value: number
}
interface GaugeCardProps {
  value: number
  humidityMin: number
  humidityMax: number
}

function getStatus(v: number, min: number, max: number) {
  if (v < min) return { label: 'Solo seco', color: '#ef4444', bg: 'bg-red-950 text-red-400' }
  if (v <= max) return { label: 'Ideal ✓', color: '#22c55e', bg: 'bg-green-950 text-green-400' }
  return { label: 'Saturado', color: '#3b82f6', bg: 'bg-blue-950 text-blue-400' }
}

export default function GaugeCard({ value, humidityMin, humidityMax }: GaugeCardProps) {
  const { label, color, bg } = getStatus(value, humidityMin, humidityMax)
  const clamp = Math.min(Math.max(value, 0), 100)

  // SVG arc math: semicircle radius 55, circumference of half = π * 55 ≈ 172.8
  const circumference = Math.PI * 55
  const offset = circumference * (1 - clamp / 100)

  return (
    <div className="bg-stone-900 rounded-xl border border-stone-800 p-5 flex flex-col items-center justify-center">
      <h2 className="text-sm font-medium text-stone-300 self-start mb-2">Umidade atual</h2>

      <svg viewBox="0 0 130 75" className="w-36 h-20 overflow-visible">
        {/* Background arc */}
        <path
          d="M 10,70 A 55,55 0 0,1 120,70"
          fill="none"
          stroke="#292524"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d="M 10,70 A 55,55 0 0,1 120,70"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
        />
      </svg>

      <p className="text-4xl font-bold font-mono tabular-nums mt-1" style={{ color }}>
        {clamp.toFixed(0)}%
      </p>
      <p className="text-xs font-mono text-stone-500 mt-1">Umidade volumétrica</p>

      <span className={`mt-3 px-3 py-1 rounded-full text-xs font-mono ${bg}`}>
        {label}
      </span>
    </div>
  )
}
