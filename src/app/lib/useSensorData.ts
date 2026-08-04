'use client'

import { useState, useEffect, useCallback } from 'react'
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

const API_URL = `${process.env.NEXT_PUBLIC_ESP32_URL ?? 'http://192.168.1.42'}/data`
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
    ip: '192.168.1.42',
  },
  alerts: [],
}

export function useSensorData() {
  const [data, setData]               = useState<SensorData>(initialData)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate]   = useState<Date | null>(null)

  const fetchFromESP32 = useCallback(async () => {
    try {
      const res = await fetch(API_URL, { signal: AbortSignal.timeout(4000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()

      setData(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          humidity: json.humidity,
        }
        const newHistory = [...prev.history.slice(-47), newPoint]

        const newAlerts = [...prev.alerts]
        if (json.humidity < 30 && prev.alerts[0]?.message !== 'Umidade crítica — abaixo de 30%') {
          newAlerts.unshift({
            id: Date.now().toString(),
            type: 'warn' as const,
            message: 'Umidade crítica — abaixo de 30%',
            timestamp: new Date(),
          })
        }

        return {
          ...prev,
          humidity:      json.humidity,
          temperature:   json.temperature  ?? null,
          conductivity:  json.conductivity ?? null,
          rssi:          json.rssi         ?? prev.rssi,
          humidityTrend: calcTrend(newHistory),
          history:       newHistory,
          device: {
            ...prev.device,
            firmware: json.firmware ? `v${json.firmware}` : prev.device.firmware,
            uptime:   formatUptime(json.uptime ?? 0),
          },
          alerts: newAlerts.slice(0, 10),
        }
      })

      setIsConnected(true)
      setLastUpdate(new Date())
    } catch {
      setIsConnected(false)
    }
  }, [])

  useEffect(() => {
    fetchFromESP32()
    const poll = setInterval(fetchFromESP32, POLL_INTERVAL_MS)
    return () => clearInterval(poll)
  }, [fetchFromESP32])

  return { data, isConnected, lastUpdate }
}