import { NextRequest, NextResponse } from 'next/server'
import https from 'https'

function httpsGet(url: string): Promise<{ ok: boolean; status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const agent = new https.Agent({ rejectUnauthorized: false })
    https.get(url, { agent }, res => {
      let body = ''
      res.on('data', chunk => { body += chunk })
      res.on('end', () => resolve({ ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300, status: res.statusCode ?? 0, body }))
    }).on('error', reject)
  })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search_term = searchParams.get('search_term') ?? ''
  const location    = searchParams.get('location') ?? ''
  const country     = searchParams.get('country') ?? 'us'
  const page        = searchParams.get('page') ?? '1'

  if (!search_term) {
    return NextResponse.json({ error: 'search_term is required' }, { status: 400 })
  }

  const appId  = process.env.JOBS_APP_ID
  const appKey = process.env.JOBS_API_KEY

  if (!appId || !appKey || appId === 'your-app-id') {
    return NextResponse.json({ error: 'Adzuna API keys not configured. Add JOBS_APP_ID and JOBS_API_KEY to .env.local' }, { status: 500 })
  }

  const validCountries = ['us', 'gb', 'in', 'au', 'ca', 'de', 'fr', 'sg', 'nz', 'za']
  const safeCountry = validCountries.includes(country) ? country : 'us'

  const url = new URL(`https://api.adzuna.com/v1/api/jobs/${safeCountry}/search/${page}`)
  url.searchParams.set('app_id', appId)
  url.searchParams.set('app_key', appKey)
  url.searchParams.set('what', search_term)
  if (location && location.toLowerCase() !== 'remote') url.searchParams.set('where', location)
  url.searchParams.set('results_per_page', '15')
  url.searchParams.set('content-type', 'application/json')
  if (location.toLowerCase() === 'remote') url.searchParams.set('what_and', 'remote')

  try {
    const { ok, status, body } = await httpsGet(url.toString())

    let data: any
    try { data = JSON.parse(body) } catch {
      return NextResponse.json({ error: `Adzuna returned invalid response` }, { status: 502 })
    }

    if (!ok) {
      const msg = data?.exception ?? data?.error ?? `HTTP ${status}`
      return NextResponse.json({ error: `Adzuna error: ${msg}` }, { status: 502 })
    }

    const jobs = (data.results ?? []).map((job: any) => ({
      id:          String(job.id),
      title:       job.title ?? '',
      company:     job.company?.display_name ?? 'Unknown',
      location:    job.location?.display_name ?? '',
      description: job.description ?? '',
      url:         job.redirect_url ?? '',
      salary_min:  job.salary_min ?? null,
      salary_max:  job.salary_max ?? null,
    }))

    return NextResponse.json({ jobs, total: data.count ?? jobs.length })
  } catch (err: any) {
    return NextResponse.json({ error: `Request failed: ${err.message}` }, { status: 502 })
  }
}
