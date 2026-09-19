import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../lib/supabase'

export async function GET() {
  try {
    const db = supabaseAdmin()
    const { data, error } = await db
      .from('readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Sem dados no banco' },
        { status: 503 }
      )
    }

    // Verifica se a última leitura tem menos de 30 segundos
    const lastReadingAge = Date.now() - new Date(data.created_at).getTime()
    const isOnline = lastReadingAge < 30_000

    return NextResponse.json({ ...data, offline: !isOnline })
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 503 }
    )
  }
}