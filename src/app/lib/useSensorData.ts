'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import { Alert } from '../components/AlertsPanel'

export interface SensorData {
  humidity: number
  temperature: number | null
  conductivity: number | null
  rssi: number
  humidityTrend: string
  history: { time: string; humidity: number }[]
  device: {
    firmware: string
    chip: string
    sensorPin: string
    interval: number
    uptime: string
    ip: string
  }
  alerts: Alert[]
}

export type TimeRange = '1h' | '12h' | '7d'

const API_URL = '/api/sensor'
const POLL_INTERVAL_MS = 5_000
const TZ = 'America/Sao_Paulo'

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`
}

function calcTrend(history: { humidity: number }[]): string {
  if (history.length < 2) return '→ aguardando dados'
  const last = history[history.length - 1].humidity
  const prev = history[history.length - 2].humidity
  const diff = last - prev
  if (Math.abs(diff) < 1) return '→ estável'
  return diff > 0 ? `▲ +${diff.toFixed(1)}%` : `▼ ${diff.toFixed(1)}%`
}

function timeRangeToConfig(range: TimeRange): { minutes: number; bucketMin: number; maxPoints: number } {
  switch (range) {
    case '1h': return { minutes: 60, bucketMin: 10, maxPoints: 6 }
    case '12h': return { minutes: 720, bucketMin: 60, maxPoints: 12 }
    case '7d': return { minutes: 10080, bucketMin: 1440, maxPoints: 7 }
  }
}

function toLabel(utcStr: string, range: TimeRange): string {
  const d = new Date(utcStr)
  if (range === '7d') {
    return d.toLocaleDateString('pt-BR', { timeZone: TZ, weekday: 'short', day: '2-digit' })
  }
  return d.toLocaleTimeString('pt-BR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })
}

function aggregate(
  rows: { created_at: string; humidity: number }[],
  bucketMin: number,
  range: TimeRange
): { time: string; humidity: number }[] {
  if (!rows.length) return []

  const bucketMs = bucketMin * 60 * 1000
  const map = new Map<number, { sum: number; count: number; created_at: string }>()

  for (const row of rows) {
    const ms = new Date(row.created_at).getTime()
    const key = Math.floor(ms / bucketMs) * bucketMs
    const cur = map.get(key)
    if (cur) {
      cur.sum += row.humidity
      cur.count++
    } else {
      map.set(key, { sum: row.humidity, count: 1, created_at: row.created_at })
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([, { sum, count, created_at }]) => ({
      time: toLabel(created_at, range),
      humidity: Math.round((sum / count) * 10) / 10,
    }))
}

const initialData: SensorData = {
  humidity: 0,
  temperature: null,
  conductivity: null,
  rssi: 0,
  humidityTrend: '→ aguardando ESP32...',
  history: [],
  device: {
    firmware: '—',
    chip: 'ESP32-WROOM',
    sensorPin: 'HD-38 · GPIO34',
    interval: 5,
    uptime: '00h 00m',
    ip: '192.168.2.42',
  },
  alerts: [],
}

export function useSensorData(settings: { humidity_min: number; humidity_max: number }) {
  const [data, setData] = useState<SensorData>(initialData)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('1h')

  const fetchHistory = useCallback(async (range: TimeRange) => {
    const { minutes, bucketMin } = timeRangeToConfig(range)

    const { data: rows, error } = await supabase
      .rpc('get_humidity_history', {
        range_minutes: minutes,
        bucket_minutes: bucketMin,
      })

    if (error) {
      console.error('[Supabase] Erro RPC:', error.message)
      return []
    }

    if (!rows || rows.length === 0) return []

    // Converte o resultado da RPC para o formato do gráfico
    return rows.map((row: { bucket_time: string; avg_humidity: number }) => {
      const date = new Date(row.bucket_time)
      const isDay = range === '7d'
      const time = isDay
        ? date.toLocaleDateString('pt-BR', {
          timeZone: TZ,
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
        })
        : date.toLocaleTimeString('pt-BR', {
          timeZone: TZ,
          hour: '2-digit',
          minute: '2-digit',
        })
      return { time, humidity: row.avg_humidity }
    })
  }, [])

  const fetchFromESP32 = useCallback(async () => {
    try {
      const res = await fetch(API_URL, { signal: AbortSignal.timeout(6000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()

      const isOffline = json.offline === true
      setIsConnected(!isOffline)

      const history = await fetchHistory(timeRange)

      setData(prev => {
        const newAlerts = [...prev.alerts]

        if (json.humidity < settings.humidity_min &&
          prev.alerts[0]?.message !== `Umidade baixa — abaixo de ${settings.humidity_min}%`) {
          newAlerts.unshift({
            id: Date.now().toString(),
            type: 'warn' as const,
            message: `Umidade baixa — abaixo de ${settings.humidity_min}%`,
            timestamp: new Date(),
          })
        }

        if (json.humidity > settings.humidity_max &&
          prev.alerts[0]?.message !== `Umidade alta — acima de ${settings.humidity_max}%`) {
          newAlerts.unshift({
            id: Date.now().toString(),
            type: 'warn' as const,
            message: `Umidade alta — acima de ${settings.humidity_max}%`,
            timestamp: new Date(),
          })
        }

        if (isOffline && prev.alerts[0]?.message !== 'ESP32 offline — exibindo última leitura') {
          newAlerts.unshift({
            id: Date.now().toString(),
            type: 'warn' as const,
            message: 'ESP32 offline — exibindo última leitura',
            timestamp: new Date(),
          })
        }

        return {
          ...prev,
          humidity: json.humidity,
          temperature: json.temperature ?? null,
          conductivity: json.conductivity ?? null,
          rssi: json.rssi ?? prev.rssi,
          humidityTrend: calcTrend(history),
          history,
          device: {
            ...prev.device,
            firmware: json.firmware ? `v${json.firmware}` : prev.device.firmware,
            uptime: formatUptime(json.uptime ?? 0),
          },
          alerts: newAlerts.slice(0, 10),
        }
      })

      setLastUpdate(new Date())
    } catch {
      setIsConnected(false)
    }
  }, [timeRange, fetchHistory])

  useEffect(() => {
    fetchHistory(timeRange).then(history => {
      setData(prev => ({ ...prev, history }))
    })
  }, [timeRange, fetchHistory])

  useEffect(() => {
    fetchFromESP32()
    const poll = setInterval(fetchFromESP32, POLL_INTERVAL_MS)
    return () => clearInterval(poll)
  }, [fetchFromESP32])

  return { data, isConnected, lastUpdate, timeRange, setTimeRange }
}