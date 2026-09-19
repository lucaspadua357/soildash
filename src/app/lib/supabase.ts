import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(url, anon)

// Cliente com permissão total — usado só em API routes (servidor)
export function supabaseAdmin() {
  return createClient(url, process.env.SUPABASE_SERVICE_KEY!)
}