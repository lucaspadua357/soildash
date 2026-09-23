'use client'

import { useState, useEffect } from 'react'

export function useCityName(latitude: number, longitude: number): string {
  const [cityName, setCityName] = useState('')

  useEffect(() => {
    if (!latitude || !longitude) return

    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pt`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SoilDash/1.0 (lucas@inatel.br)',
        }
      }
    )
      .then(res => res.json())
      .then(data => {
        const a = data?.address
        if (!a) { setCityName(`${latitude}, ${longitude}`); return }
        const city  = a.city || a.town || a.village || a.municipality || a.county || ''
        const state = a.state || ''
        setCityName([city, state].filter(Boolean).join(' · '))
      })
      .catch(() => setCityName(`${latitude}, ${longitude}`))
  }, [latitude, longitude])

  return cityName || `${latitude}, ${longitude}`
}