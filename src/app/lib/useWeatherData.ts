'use client'

import { useState, useEffect, useCallback } from 'react'

export interface WeatherData {
  windSpeed: number
  windDirection: number
  temperature: number
  humidityAir: number
  time: string
}

const POLL_INTERVAL_MS = 60_000

const initialWeather: WeatherData = {
  windSpeed:     0,
  windDirection: 0,
  temperature:   0,
  humidityAir:   0,
  time:          '',
}


export function useWeatherData() {
  const [weather, setWeather]       = useState<WeatherData>(initialWeather)
  const [isLoaded, setIsLoaded]     = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchWeather = useCallback(async () => {
    try {
      const res = await fetch('/api/weather', {
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()

      if (json.error) throw new Error(json.error)

      setWeather({
        windSpeed:     json.wind_speed     ?? 0,
        windDirection: json.wind_direction ?? 0,
        temperature:   json.temperature    ?? 0,
        humidityAir:   json.humidity_air   ?? 0,
        time:          json.time           ?? '',
      })

      setIsLoaded(true)
      setLastUpdate(new Date())
    } catch (err) {
      console.warn('[Weather] Erro ao buscar dados:', err)
      // Não propaga o erro — dashboard continua funcionando
    }
  }, [])

  useEffect(() => {
    fetchWeather()
    const poll = setInterval(fetchWeather, POLL_INTERVAL_MS)
    return () => clearInterval(poll)
  }, [fetchWeather])

  return { weather, isLoaded, lastUpdate }
}