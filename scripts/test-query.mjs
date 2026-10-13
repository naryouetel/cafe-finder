import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const envText = fs.readFileSync('.env.local', 'utf8')
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const i = line.indexOf('=')
      return [line.slice(0, i), line.slice(i + 1)]
    }),
)

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { global: { fetch: (...args) => fetch(...args, { cache: 'no-store' }) } },
)

const basic = await supabase.from('cafes').select('*')
console.log('basic select:', JSON.stringify(basic, null, 2))

const nested = await supabase
  .from('cafes')
  .select('*, cafe_work_scores(*)')
  .order('created_at', { ascending: true })
console.log('nested select:', JSON.stringify(nested, null, 2))
