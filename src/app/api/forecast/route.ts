import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

async function getCoords() {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
  const { data } = await db
    .from('settings')
    .select('latitude, longitude')
    .eq('id', 'default')
    .single()
  return {
    lat: data?.latitude  ?? -22.2519,
    lon: data?.longitude ?? -45.7044,
  }
}

export async function GET() {
  try {
    const { lat, lon } = await getCoords()

    const URL =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,` +
      `precipitation_probability_max,wind_speed_10m_max,relative_humidity_2m_mean,weather_code` +
      `&timezone=America%2FSao_Paulo` +
      `&forecast_days=7`

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
      rainChance:    d.precipitation_probability_max[i],
      windSpeed:     d.wind_speed_10m_max[i],
      humidity:      d.relative_humidity_2m_mean[i],
      weatherCode:   d.weather_code[i],
    }))

    return NextResponse.json(forecast)
  } catch (err) {
    return NextResponse.json(
      { error: 'Cannot reach Open-Meteo', detail: String(err) },
      { status: 503 }
    )
  }
}