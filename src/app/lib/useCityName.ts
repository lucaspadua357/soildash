'use client'

import { useState, useEffect } from 'react'

export function useCityName(latitude: number, longitude: number): string {
  const [cityName, setCityName] = useState('')

  useEffect(() => {
    if (!latitude || !longitude) return

    // Busca cidades próximas às coordenadas
    fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${latitude}&longitude=${longitude}&count=1&language=pt&format=json`
    )
      .then(res => res.json())
      .then(data => {
        if (data?.results?.[0]) {
          const r = data.results[0]
          const parts = [r.name, r.admin1].filter(Boolean)
          setCityName(parts.join(', '))
        } else {
          setCityName(`${latitude}, ${longitude}`)
        }
      })
      .catch(() => setCityName(`${latitude}, ${longitude}`))
  }, [latitude, longitude])

  return cityName
}