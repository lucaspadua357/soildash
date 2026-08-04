import { NextResponse } from 'next/server'

const ESP32_URL = process.env.ESP32_URL ?? 'http://192.168.1.42'

export async function GET() {
  try {
    const res = await fetch(`${ESP32_URL}/data`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: 'Cannot reach ESP32', detail: String(err) },
      { status: 503 }
    )
  }
}