'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'

interface Reading {
  id: number
  created_at: string
  humidity: number
  rssi: number
}

function humidityColor(v: number) {
  if (v < 25) return { text: 'text-red-400', bg: '#ef4444', label: 'Seco' }
  if (v < 45) return { text: 'text-amber-400', bg: '#f59e0b', label: 'Atenção' }
  if (v <= 75) return { text: 'text-green-400', bg: '#22c55e', label: 'Ideal' }
  return { text: 'text-blue-400', bg: '#3b82f6', label: 'Saturado' }
}

function rssiQuality(rssi: number) {
  if (rssi >= -60) return { label: 'Ótimo', color: 'text-green-400' }
  if (rssi >= -70) return { label: 'Bom', color: 'text-cyan-400' }
  if (rssi >= -80) return { label: 'Fraco', color: 'text-amber-400' }
  return { label: 'ruim', color: 'text-red-400' }
}

function filterByMinute(data: Reading[]): Reading[] {
  const seen = new Set<string>()
  return data.filter(r => {
    const key = r.created_at.slice(0, 16) // "2026-09-21T23:06"
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-stone-800 border border-stone-700 rounded px-2 py-1 text-[10px] font-mono">
        <p className="text-green-400">{payload[0].value.toFixed(1)}%</p>
      </div>
    )
  }
  return null
}

export default function HistoryPage() {
  const [readings, setReadings] = useState<Reading[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 50

  const fetchReadings = useCallback(async (pageNum: number) => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('readings')
      .select('id, created_at, humidity, rssi')
      .order('created_at', { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)

    if (!error && data) {
      setReadings(prev => pageNum === 0 ? data : [...prev, ...data])
      setHasMore(data.length === PAGE_SIZE)
    }
    setIsLoading(false)
    if (!error && data) {
      setReadings(prev => {
        const combined = pageNum === 0 ? data : [...prev, ...data]
        return filterByMinute(combined)
      })
      setHasMore(data.length === PAGE_SIZE)
    }
  }, [])

  useEffect(() => { fetchReadings(0) }, [fetchReadings])

  // Estatísticas
  const avg = readings.length
    ? readings.reduce((s, r) => s + r.humidity, 0) / readings.length
    : 0
  const max = readings.length ? Math.max(...readings.map(r => r.humidity)) : 0
  const min = readings.length ? Math.min(...readings.map(r => r.humidity)) : 0

  // Mini gráfico — últimas 20 leituras em ordem cronológica
  const chartData = [...readings].reverse().slice(-20).map(r => ({
    humidity: r.humidity
  }))

  const exportCSV = () => {
    const csv = [
      'horario,umidade,status,rssi',
      ...readings.map(r => {
        const { label } = humidityColor(r.humidity)
        return `${r.created_at},${r.humidity},${label},${r.rssi}`
      })
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `soilwatch-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-stone-950 p-4 md:p-6 pb-20">
      <div className="max-w-3xl mx-auto pt-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-lg font-semibold text-stone-100">Histórico</h1>
            <p className="text-[10px] font-mono text-stone-500 mt-0.5">
              {readings.length} leituras · HD-38
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="text-[10px] font-mono text-stone-500 hover:text-green-400
              border border-stone-800 hover:border-green-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            ↓ CSV
          </button>
        </div>

        {/* Estatísticas + mini gráfico */}
        {readings.length > 0 && (
          <div className="bg-stone-900 rounded-xl border border-stone-800 p-4 mb-4">
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center">
                <p className="text-[10px] font-mono text-stone-500 mb-1">Média</p>
                <p className={`text-xl font-bold font-mono ${humidityColor(avg).text}`}>
                  {avg.toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-mono text-stone-500 mb-1">Máximo</p>
                <p className={`text-xl font-bold font-mono ${humidityColor(max).text}`}>
                  {max.toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-mono text-stone-500 mb-1">Mínimo</p>
                <p className={`text-xl font-bold font-mono ${humidityColor(min).text}`}>
                  {min.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Mini gráfico */}
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="miniGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="humidity"
                    stroke="#22c55e"
                    strokeWidth={1.5}
                    fill="url(#miniGrad)"
                    dot={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[9px] font-mono text-stone-600 text-right mt-1">
              Últimas 20 leituras
            </p>
          </div>
        )}

        {/* Lista compacta */}
        {isLoading && readings.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-xs font-mono text-stone-600 animate-pulse">Carregando...</p>
          </div>
        ) : (
          <div className="bg-stone-900 rounded-xl border border-stone-800 overflow-hidden mb-4">

            {/* Cabeçalho */}
            <div className="grid grid-cols-12 px-4 py-2 border-b border-stone-800 bg-stone-950">
              <span className="col-span-5 text-[10px] font-mono text-stone-500">Horário</span>
              <span className="col-span-3 text-[10px] font-mono text-stone-500 text-center">Umidade</span>
              <span className="col-span-2 text-[10px] font-mono text-stone-500 text-center">Status</span>
              <span className="col-span-2 text-[10px] font-mono text-stone-500 text-right">Wi-Fi</span>
            </div>

            {readings.map((r, i) => {
              const hc = humidityColor(r.humidity)
              const wq = rssiQuality(r.rssi)
              return (
                <div
                  key={r.id}
                  className={`grid grid-cols-12 px-4 py-2.5 items-center ${i % 2 === 0 ? 'bg-stone-900' : 'bg-stone-950'
                    } ${i < readings.length - 1 ? 'border-b border-stone-800/50' : ''}`}
                >
                  <div className="col-span-5">
                    <p className="text-xs font-mono text-stone-300">
                      {new Date(r.created_at).toLocaleString('pt-BR', {
                        day: '2-digit', month: '2-digit',
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </p>
                    <p className="text-[9px] font-mono text-stone-600">
                      {formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>

                  <div className="col-span-3 flex items-center justify-center gap-2">
                    <div
                      className="w-1 h-6 rounded-full"
                      style={{ backgroundColor: hc.bg }}
                    />
                    <span className={`text-sm font-bold font-mono ${hc.text}`}>
                      {r.humidity.toFixed(1)}%
                    </span>
                  </div>

                  <div className="col-span-2 text-center">
                    <span className={`text-[10px] font-mono ${hc.text}`}>
                      {hc.label}
                    </span>
                  </div>

                  <div className="col-span-2 text-right">
                    <span className={`text-[10px] font-mono ${wq.color}`}>
                      {wq.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {hasMore && (
          <button
            onClick={() => { const n = page + 1; setPage(n); fetchReadings(n) }}
            disabled={isLoading}
            className="w-full py-3 text-xs font-mono text-stone-500 hover:text-stone-300
              border border-stone-800 hover:border-stone-600 rounded-xl transition-colors
              disabled:opacity-50"
          >
            {isLoading ? 'carregando...' : 'carregar mais'}
          </button>
        )}

      </div>
    </div>
  )
}