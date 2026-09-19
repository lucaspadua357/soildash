import { NextResponse } from 'next/server'

// Coordenadas de Santa Rita do Sapucaí — MG (Inatel)
const LAT = -22.2519
const LON = -45.7044

const OPEN_METEO_URL =
  `https://api.open-meteo.com/v1/forecast` +
  `?latitude=${LAT}&longitude=${LON}` +
  `&current=wind_speed_10m,wind_direction_10m,temperature_2m,relative_humidity_2m` +
  `&wind_speed_unit=ms` +
  `&timezone=America%2FSao_Paulo`

export async function GET() {
  try {
    const res = await fetch(OPEN_METEO_URL, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    const current = data.current

    return NextResponse.json({
      wind_speed:      current.wind_speed_10m * 3.6,       // m/s
      wind_direction:  current.wind_direction_10m,   // graus
      temperature:     current.temperature_2m,       // °C
      humidity_air:    current.relative_humidity_2m, // % (ar, não solo)
      time:            current.time,
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Cannot reach Open-Meteo', detail: String(err) },
      { status: 503 }
    )
  }
}