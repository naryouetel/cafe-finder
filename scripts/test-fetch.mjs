import fs from 'fs'

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

const url = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function query(path) {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    cache: 'no-store',
  })
  const text = await res.text()
  return { status: res.status, headers: Object.fromEntries(res.headers.entries()), body: text }
}

const results = {
  basic: await query('cafes?select=*'),
  nested: await query('cafes?select=*,cafe_work_scores(*)&order=created_at.asc'),
}

fs.writeFileSync('scripts/query-result.json', JSON.stringify(results, null, 2))
