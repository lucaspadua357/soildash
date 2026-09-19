interface WindCardProps {
  speed: number
  direction: number
  isLoaded: boolean
}

function directionLabel(deg: number): string {
  const dirs = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO']
  return dirs[Math.round(deg / 45) % 8]
}

function windStrength(speed: number): { label: string; color: string } {
  if (speed < 1)  return { label: 'calmaria',  color: '#78716c' }
  if (speed < 5)  return { label: 'brisa leve', color: '#22d3ee' }
  if (speed < 10) return { label: 'brisa',      color: '#3b82f6' }
  if (speed < 20) return { label: 'vento forte', color: '#f59e0b' }
  return               { label: 'vendaval',    color: '#ef4444' }
}

export default function WindCard({ speed, direction, isLoaded }: WindCardProps) {
  const { label, color } = windStrength(speed)

  return (
    <div className="bg-stone-900 rounded-xl border border-stone-800 p-4 flex flex-col items-center justify-center gap-2">
      <h2 className="text-sm font-medium text-stone-300 self-start">Velocidade do vento</h2>

      {/* Rosa dos ventos SVG com seta animada */}
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 120 120" className="w-full h-full">
          {/* Círculo externo */}
          <circle cx="60" cy="60" r="56" fill="none" stroke="#292524" strokeWidth="1"/>

          {/* Marcações dos 8 pontos cardeais */}
          {['N','NE','L','SE','S','SO','O','NO'].map((d, i) => {
            const angle = (i * 45 - 90) * (Math.PI / 180)
            const r1 = i % 2 === 0 ? 44 : 46  // cardeais mais longos
            const r2 = i % 2 === 0 ? 52 : 50
            const x1 = 60 + r1 * Math.cos(angle)
            const y1 = 60 + r1 * Math.sin(angle)
            const x2 = 60 + r2 * Math.cos(angle)
            const y2 = 60 + r2 * Math.sin(angle)
            const xt = 60 + 38 * Math.cos(angle)
            const yt = 60 + 38 * Math.sin(angle)
            return (
              <g key={d}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={i % 2 === 0 ? '#57534e' : '#3c3834'}
                  strokeWidth={i % 2 === 0 ? 1.5 : 1}
                />
                <text
                  x={xt} y={yt}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={i % 2 === 0 ? '8' : '6'}
                  fill={i % 2 === 0 ? '#78716c' : '#57534e'}
                  fontFamily="monospace"
                  fontWeight={i % 2 === 0 ? '600' : '400'}
                >
                  {d}
                </text>
              </g>
            )
          })}

          {/* Círculo interno */}
          <circle cx="60" cy="60" r="24" fill="#1c1917" stroke="#292524" strokeWidth="1"/>

          {/* Seta animada — rotaciona conforme direção do vento */}
          <g
            transform={`rotate(${direction}, 60, 60)`}
            style={{ transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            {/* Ponta da seta (direção do vento) */}
            <polygon
              points="60,18 55,42 60,38 65,42"
              fill={color}
              opacity="0.95"
            />
            {/* Cauda da seta */}
            <polygon
              points="60,102 55,78 60,82 65,78"
              fill="#44403c"
              opacity="0.6"
            />
            {/* Linha central */}
            <line
              x1="60" y1="22" x2="60" y2="98"
              stroke={color}
              strokeWidth="1"
              opacity="0.2"
            />
          </g>

          {/* Centro */}
          <circle cx="60" cy="60" r="4" fill={color}/>
          <circle cx="60" cy="60" r="2" fill="#1c1917"/>
        </svg>
      </div>

      {/* Valor */}
      <div className="text-center">
        <p
          className="text-3xl font-bold font-mono tabular-nums transition-colors duration-500"
          style={{ color }}
        >
          {isLoaded ? speed.toFixed(1) : '—'}
        </p>
        <p className="text-xs font-mono text-stone-500 mt-0.5">
          km/h · {directionLabel(direction)} · {direction}°
        </p>
      </div>

      {/* Badge de intensidade */}
      <span
        className="text-[10px] font-mono px-2 py-1 rounded-full border"
        style={{ color, borderColor: color, opacity: 0.8 }}
      >
        {isLoaded ? label : 'aguardando...'}
      </span>

      <span className="text-[10px] font-mono text-stone-600">
        Open-Meteo · Santa Rita do Sapucaí
      </span>
    </div>
  )
}