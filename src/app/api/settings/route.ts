import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../lib/supabase'

export async function GET() {
  const db = supabaseAdmin()
  const { data, error } = await db
    .from('settings')
    .select('latitude, longitude, humidity_min, humidity_max')
    .eq('id', 'default')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const db = supabaseAdmin()

  const { error } = await db
    .from('settings')
    .update({
      latitude:     body.latitude,
      longitude:    body.longitude,
      humidity_min: body.humidity_min,
      humidity_max: body.humidity_max,
      updated_at:   new Date().toISOString(),
    })
    .eq('id', 'default')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}