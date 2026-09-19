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

export type TimeRange = '1h' | '6h' | '24h' | '7d'

const API_URL = '/api/sensor'
const POLL_INTERVAL_MS = 5_000

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

function timeRangeToMinutes(range: TimeRange): number {
  switch (range) {
    case '1h':  return 60
    case '6h':  return 360
    case '24h': return 1440
    case '7d':  return 10080
  }
}

function formatTime(dateStr: string, range: TimeRange): string {
  const date = new Date(dateStr)
  if (range === '7d') {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
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

export function useSensorData() {
  const [data, setData]               = useState<SensorData>(initialData)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate]   = useState<Date | null>(null)
  const [timeRange, setTimeRange]     = useState<TimeRange>('1h')

  // Busca histórico do Supabase conforme o período selecionado
  const fetchHistory = useCallback(async (range: TimeRange) => {
    const minutes = timeRangeToMinutes(range)
    const since = new Date(Date.now() - minutes * 60 * 1000).toISOString()

    const { data: rows, error } = await supabase
      .from('readings')
      .select('created_at, humidity')
      .gte('created_at', since)
      .order('created_at', { ascending: true })
      .limit(500)

    if (error) {
      console.error('[Supabase] Erro ao buscar histórico:', error.message)
      return []
    }

    return (rows ?? []).map(r => ({
      time:     formatTime(r.created_at, range),
      humidity: r.humidity,
    }))
  }, [])

  // Polling da leitura atual
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

        if (json.humidity < 30 && prev.alerts[0]?.message !== 'Umidade crítica — abaixo de 30%') {
          newAlerts.unshift({
            id: Date.now().toString(),
            type: 'warn' as const,
            message: 'Umidade crítica — abaixo de 30%',
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
          humidity:      json.humidity,
          temperature:   json.temperature  ?? null,
          conductivity:  json.conductivity ?? null,
          rssi:          json.rssi         ?? prev.rssi,
          humidityTrend: calcTrend(history),
          history,
          device: {
            ...prev.device,
            firmware: json.firmware ? `v${json.firmware}` : prev.device.firmware,
            uptime:   formatUptime(json.uptime ?? 0),
          },
          alerts: newAlerts.slice(0, 10),
        }
      })

      setLastUpdate(new Date())
    } catch {
      setIsConnected(false)
    }
  }, [timeRange, fetchHistory])

  // Recarrega histórico quando muda o período
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