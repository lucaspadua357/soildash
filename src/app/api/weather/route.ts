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
      `&current=wind_speed_10m,wind_direction_10m,temperature_2m,relative_humidity_2m` +
      `&wind_speed_unit=ms` +
      `&timezone=America%2FSao_Paulo`

    const res = await fetch(URL, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const current = data.current

    return NextResponse.json({
      wind_speed:     current.wind_speed_10m,
      wind_direction: current.wind_direction_10m,
      temperature:    current.temperature_2m,
      humidity_air:   current.relative_humidity_2m,
      time:           current.time,
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Cannot reach Open-Meteo', detail: String(err) },
      { status: 503 }
    )
  }
}