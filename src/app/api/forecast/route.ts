import { NextResponse } from 'next/server'

const LAT = -22.2519
const LON = -45.7044

const URL =
  `https://api.open-meteo.com/v1/forecast` +
  `?latitude=${LAT}&longitude=${LON}` +
  `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,` +
  `precipitation_probability_max,wind_speed_10m_max,relative_humidity_2m_mean,weather_code` +
  `&timezone=America%2FSao_Paulo` +
  `&forecast_days=7`

export async function GET() {
  try {
    const res = await fetch(URL, {
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const d = data.daily

    const forecast = d.time.map((date: string, i: number) => ({
      date,
      tempMax:       d.temperature_2m_max[i],
      tempMin:       d.temperature_2m_min[i],
      precipitation: d.precipitation_sum[i],
      rainChance:    d.precipitation_probability_max[i],  // % chance de chuva
      humidity:      d.relative_humidity_2m_mean[i],
      weatherCode:   d.weather_code[i],
      windSpeed: d.wind_speed_10m_max[i],
    }))

    return NextResponse.json(forecast)
  } catch (err) {
    return NextResponse.json(
      { error: 'Cannot reach Open-Meteo', detail: String(err) },
      { status: 503 }
    )
  }
}