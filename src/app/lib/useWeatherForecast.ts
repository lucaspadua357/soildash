'use client'

import { useState, useEffect, useCallback } from 'react'

export interface ForecastDay {
  date:          string
  tempMax:       number
  tempMin:       number
  precipitation: number
  windSpeed:     number
  rainChance:    number
  humidity:      number
  weatherCode:   number
}

const POLL_INTERVAL_MS = 60 * 60 * 1000  // 1 hora

export function useWeatherForecast() {
  const [forecast, setForecast]   = useState<ForecastDay[]>([])
  const [isLoaded, setIsLoaded]   = useState(false)

  const fetchForecast = useCallback(async () => {
    try {
      const res = await fetch('/api/forecast', { signal: AbortSignal.timeout(6000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setForecast(json)
      setIsLoaded(true)
    } catch (err) {
      console.error('[Forecast] Erro:', err)
    }
  }, [])

  useEffect(() => {
    fetchForecast()
    const poll = setInterval(fetchForecast, POLL_INTERVAL_MS)
    return () => clearInterval(poll)
  }, [fetchForecast])

  return { forecast, isLoaded }
}