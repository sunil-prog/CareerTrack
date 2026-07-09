'use client'

import Link from 'next/link'
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

const NAVY   = '#1C3A6B'
const BLUE   = '#2B79C2'
const ORANGE = '#E8681E'

/* ─── Feature data ───────────────────────────────────── */
const FEATURES = [
  { key: 'resume',    short: 'Resume AI',     label: 'AI Resume Builder',   desc: 'ATS-optimized templates with real-time Gemini AI scoring. Know your resume will get past the bots before you even apply.', accent: BLUE,   bg: '#EBF3FA', stat: '94% ATS pass rate' },
  { key: 'kanban',    short: 'Job Board',      label: 'Kanban Job Tracker',  desc: 'Visual drag-and-drop board. Move cards from Saved → Applied → Interview → Offer. Never lose track of an opportunity.', accent: NAVY,   bg: '#EEF3FA', stat: '6 status columns' },
  { key: 'search',    short: 'Job Search',     label: 'Smart Job Search',    desc: 'Search millions of live roles filtered by salary, location, and company. Save any listing with a single click.', accent: ORANGE, bg: '#FEF0E7', stat: '10k+ jobs daily' },
  { key: 'analytics', short: 'Analytics',      label: 'Analytics Dashboard', desc: 'Beautiful charts showing response rates, interview conversion, and weekly momentum. Know what is and is not working.', accent: BLUE,   bg: '#EBF3FA', stat: 'Real-time insights' },
  { key: 'cover',     short: 'Cover Letters',  label: 'Cover Letter AI',     desc: 'Generate a tailored, compelling cover letter for any role in under 10 seconds. Personalised to the job description.', accent: ORANGE, bg: '#FEF0E7', stat: '< 10 sec generation' },
  { key: 'alerts',    short: 'Reminders',      label: 'Smart Reminders',     desc: 'Automated follow-up nudges and weekly email digests so no opportunity slips through the cracks.', accent: NAVY,   bg: '#EEF3FA', stat: 'Zero missed follow-ups' },
]

const ICON_PATHS: Record<string, string> = {
  resume:    'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z',
  kanban:    'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2',
  search:    'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  analytics: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  cover:     'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
  alerts:    'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
}

function FIcon({ k, color, size = 22 }: { k: string; color: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={size} height={size}
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={ICON_PATHS[k]} />
    </svg>
  )
}

/* ─── Animated counter ───────────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref    = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const mv     = useMotionValue(0)
  const spring = useSpring(mv, { stiffness: 70, damping: 18 })
  useEffect(() => { if (inView) mv.set(to) }, [inView, mv, to])
  useEffect(() => spring.on('change', v => {
    if (ref.current) ref.current.textContent = Math.round(v) + suffix
  }), [spring, suffix])
  return <span ref={ref}>0{suffix}</span>
}

/* ─── Steps ──────────────────────────────────────────── */
const STEPS = [
  { n: '01', title: 'Create your profile',  desc: 'Sign up in 2 minutes. Add your resume, skills, and target roles.' },
  { n: '02', title: 'Search & save jobs',    desc: 'Discover matched openings across millions of listings and save them to your board.' },
  { n: '03', title: 'Track & get hired',     desc: 'Move cards through your pipeline, follow up on time, and land your dream role.' },
]

const FOOTER_LINKS = {
  Product: ['Resume Builder', 'Job Search', 'Kanban Board', 'Analytics', 'Cover Letters'],
  Company: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
  Legal:   ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
}

/* ═══════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0)

  /* auto-advance feature spotlight every 4 s */
  useEffect(() => {
    const id = setInterval(() => setActiveFeature(i => (i + 1) % FEATURES.length), 4000)
    return () => clearInterval(id)
  }, [])

  const feat = FEATURES[activeFeature]

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#F5F9FE', color: NAVY }}>

      {/* ── inline keyframes for marquees ─────────────── */}
      <style>{`
        @keyframes ml { from { transform: translateX(0) }    to { transform: translateX(-50%) } }
        @keyframes mr { from { transform: translateX(-50%) } to { transform: translateX(0) } }
        .aml { animation: ml 32s linear infinite; display:flex; gap:1rem; }
        .amr { animation: mr 28s linear infinite; display:flex; gap:1rem; }
        .aml:hover,.amr:hover { animation-play-state:paused; }
        @keyframes float1 { 0%,100%{transform:translateY(0px) rotate(-2deg)} 50%{transform:translateY(-14px) rotate(2deg)} }
        @keyframes float2 { 0%,100%{transform:translateY(0px) rotate(1deg)}  50%{transform:translateY(-10px) rotate(-2deg)} }
        @keyframes float3 { 0%,100%{transform:translateY(0px)}               50%{transform:translateY(-18px)} }
        .f1 { animation: float1 5s ease-in-out infinite; }
        .f2 { animation: float2 6.5s ease-in-out infinite; }
        .f3 { animation: float3 4.5s ease-in-out infinite; }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .shimmer-text {
          background: linear-gradient(90deg, #1C3A6B 0%, #2B79C2 40%, #E8681E 60%, #1C3A6B 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      {/* ── ambient background orbs ───────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <motion.div animate={{ x:[0,40,0], y:[0,-25,0] }} transition={{ duration:20, repeat:Infinity, ease:'easeInOut' }}
          className="absolute -top-48 -right-48 w-[700px] h-[700px] rounded-full"
          style={{ background:`radial-gradient(circle, ${BLUE}28 0%, transparent 70%)` }} />
        <motion.div animate={{ x:[0,-30,0], y:[0,35,0] }} transition={{ duration:24, repeat:Infinity, ease:'easeInOut' }}
          className="absolute -bottom-56 -left-48 w-[600px] h-[600px] rounded-full"
          style={{ background:`radial-gradient(circle, ${NAVY}22 0%, transparent 70%)` }} />
        <motion.div animate={{ x:[0,20,-20,0], y:[0,-30,15,0] }} transition={{ duration:30, repeat:Infinity, ease:'easeInOut' }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[450px] h-[450px] rounded-full"
          style={{ background:`radial-gradient(circle, ${ORANGE}12 0%, transparent 70%)` }} />
      </div>

      {/* ══════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════ */}
      <motion.nav
        initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
        className="sticky top-4 z-50 max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between px-5 py-3 rounded-2xl border shadow-lg backdrop-blur-xl"
          style={{ background:'rgba(255,255,255,0.88)', borderColor:'rgba(43,121,194,0.18)', boxShadow:'0 8px 32px rgba(28,58,107,0.1)' }}>
          <img src="/careertrack.png" alt="CareerTrack" className="h-8 w-auto" />
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-xl transition hover:bg-blue-50" style={{ color: NAVY }}>
              Sign in
            </Link>
            <Link href="/register"
              className="text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all hover:scale-105"
              style={{ background:`linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)`, boxShadow:`0 4px 14px rgba(43,121,194,0.35)` }}>
              Get Started Free
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: text */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.5, delay:0.1 }}
              className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-8 border"
              style={{ background:'#EBF3FA', borderColor:'#C7DEEE', color:BLUE }}>
              <motion.span animate={{ scale:[1,1.5,1] }} transition={{ duration:1.6, repeat:Infinity }}
                className="w-1.5 h-1.5 rounded-full" style={{ background:ORANGE }} />
              AI-Powered Career Management
            </motion.div>

            {/* Headline — word stagger */}
            <div className="mb-6">
              {['Land', 'your', 'dream', 'job', 'faster.'].map((word, i) => (
                <motion.span key={i}
                  initial={{ opacity:0, y:32, rotateX:40 }}
                  animate={{ opacity:1, y:0, rotateX:0 }}
                  transition={{ duration:0.55, delay:0.15 + i * 0.09, ease:[0.22,1,0.36,1] }}
                  className={`inline-block mr-4 text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight
                    ${word === 'faster.' ? 'shimmer-text' : ''}`}
                  style={{ color: word === 'faster.' ? undefined : NAVY }}>
                  {word}
                </motion.span>
              ))}
            </div>

            <motion.p
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.5, delay:0.62 }}
              className="text-lg leading-relaxed mb-8 max-w-lg" style={{ color:'#4A6FA8' }}>
              The all-in-one platform to organise applications, build AI-powered resumes,
              and track every step of your job search — beautifully.
            </motion.p>

            <motion.div
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.5, delay:0.72 }}
              className="flex flex-col sm:flex-row gap-4">
              <Link href="/register"
                className="group relative overflow-hidden text-white font-bold px-7 py-4 rounded-2xl text-base flex items-center gap-2 justify-center transition-all hover:scale-105"
                style={{ background:`linear-gradient(135deg, ${NAVY}, ${BLUE})`, boxShadow:`0 8px 24px rgba(43,121,194,0.4)` }}>
                Start for free
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </Link>
              <Link href="/login"
                className="font-semibold px-7 py-4 rounded-2xl text-base border-2 transition-all hover:shadow-md text-center"
                style={{ color:NAVY, borderColor:'#C7DEEE', background:'rgba(255,255,255,0.8)' }}>
                Sign in →
              </Link>
            </motion.div>

            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.9 }}
              className="mt-5 text-sm" style={{ color:'#9BBAD8' }}>
              Free forever · No credit card · 2 min setup
            </motion.p>
          </div>

          {/* Right: floating cards */}
          <div className="relative hidden lg:flex items-center justify-center h-[420px]">

            {/* Centre mock card */}
            <motion.div
              initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }}
              transition={{ duration:0.6, delay:0.4 }}
              className="relative z-10 rounded-2xl border p-5 w-72 shadow-2xl"
              style={{ background:'white', borderColor:'#D5E6F5', boxShadow:`0 24px 60px rgba(28,58,107,0.18)` }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color:'#9BBAD8' }}>Applications board</p>
              {[
                { title:'Senior Engineer', co:'Stripe',  status:'Interview', dot:ORANGE },
                { title:'Full Stack Dev',  co:'Notion',  status:'Applied',   dot:BLUE },
                { title:'Product Eng',     co:'Linear',  status:'Offer',     dot:'#22c55e' },
              ].map((r,i) => (
                <motion.div key={i}
                  initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay:0.55 + i*0.1 }}
                  className="flex items-center justify-between py-2.5 border-b last:border-0"
                  style={{ borderColor:'#F0F6FC' }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color:NAVY }}>{r.title}</p>
                    <p className="text-xs" style={{ color:BLUE }}>{r.co}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background:`${r.dot}18`, color:r.dot }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background:r.dot }} />
                    {r.status}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Floating badge 1 – top right */}
            <div className="f1 absolute top-4 right-4 rounded-2xl border px-4 py-3 shadow-lg"
              style={{ background:'white', borderColor:'#D5E6F5' }}>
              <p className="text-xs font-bold" style={{ color:NAVY }}>Resume Score</p>
              <p className="text-2xl font-extrabold" style={{ color:BLUE }}>94<span className="text-sm">%</span></p>
              <p className="text-xs" style={{ color:'#9BBAD8' }}>ATS ready</p>
            </div>

            {/* Floating badge 2 – bottom left */}
            <div className="f2 absolute bottom-8 left-0 rounded-2xl border px-4 py-3 shadow-lg"
              style={{ background:'white', borderColor:'#D5E6F5' }}>
              <p className="text-xs font-bold" style={{ color:NAVY }}>This week</p>
              <p className="text-2xl font-extrabold" style={{ color:ORANGE }}>3</p>
              <p className="text-xs" style={{ color:'#9BBAD8' }}>Interviews</p>
            </div>

            {/* Floating badge 3 – top left */}
            <div className="f3 absolute top-12 left-2 rounded-2xl border px-4 py-3 shadow-lg"
              style={{ background:'white', borderColor:'#D5E6F5' }}>
              <p className="text-xs font-bold" style={{ color:NAVY }}>Jobs saved</p>
              <p className="text-2xl font-extrabold" style={{ color:NAVY }}>12</p>
              <p className="text-xs" style={{ color:'#9BBAD8' }}>Today</p>
            </div>

            {/* decorative ring */}
            <motion.div
              animate={{ rotate:360 }} transition={{ duration:30, repeat:Infinity, ease:'linear' }}
              className="absolute w-80 h-80 rounded-full border-2 border-dashed pointer-events-none"
              style={{ borderColor:`${BLUE}25` }} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
        viewport={{ once:true }} transition={{ duration:0.5 }}
        className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 overflow-hidden rounded-2xl border"
          style={{ borderColor:'#D5E6F5', background:'white', boxShadow:'0 4px 20px rgba(28,58,107,0.07)' }}>
          {[
            { to:10, suffix:'k+', label:'Jobs Tracked' },
            { to:3,  suffix:'x',  label:'More Interviews' },
            { to:94, suffix:'%',  label:'Satisfaction' },
            { to:2,  suffix:'min',label:'Setup Time' },
          ].map((s, i) => (
            <div key={i} className="text-center px-6 py-6" style={{ borderColor:'#D5E6F5' }}>
              <p className="text-3xl font-extrabold" style={{ color: i%2===0 ? NAVY : BLUE }}>
                <Counter to={s.to} suffix={s.suffix} />
              </p>
              <p className="text-xs font-semibold mt-1 uppercase tracking-wide" style={{ color:'#9BBAD8' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ══════════════════════════════════════════════
          FEATURES — dual marquee + spotlight
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 pb-24">

        {/* Section header */}
        <motion.div
          initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:0.5 }}
          className="text-center mb-10 px-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:ORANGE }}>Features</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3" style={{ color:NAVY }}>Everything you need to get hired</h2>
          <p className="text-base max-w-lg mx-auto" style={{ color:'#4A6FA8' }}>
            Click any feature below to explore what it does.
          </p>
        </motion.div>

        {/* ── Dual infinite marquee ──────────────────── */}
        <div className="overflow-hidden mb-10 space-y-4">

          {/* Row 1 → left */}
          <div className="overflow-hidden">
            <div className="aml flex-nowrap">
              {[...FEATURES, ...FEATURES].map((f, i) => (
                <button key={i} onClick={() => setActiveFeature(FEATURES.indexOf(f) % FEATURES.length)}
                  className="shrink-0 inline-flex items-center gap-3 px-5 py-3.5 rounded-2xl border cursor-pointer transition-all hover:scale-105"
                  style={{
                    background: activeFeature === FEATURES.indexOf(f) % FEATURES.length ? f.bg : 'white',
                    borderColor: activeFeature === FEATURES.indexOf(f) % FEATURES.length ? f.accent : '#D5E6F5',
                    boxShadow: activeFeature === FEATURES.indexOf(f) % FEATURES.length ? `0 4px 16px ${f.accent}30` : '0 2px 8px rgba(28,58,107,0.06)',
                  }}>
                  <FIcon k={f.key} color={f.accent} size={18} />
                  <span className="text-sm font-bold whitespace-nowrap" style={{ color: f.accent }}>{f.short}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Row 2 → right (offset start) */}
          <div className="overflow-hidden">
            <div className="amr flex-nowrap">
              {[...FEATURES.slice(3), ...FEATURES.slice(0, 3), ...FEATURES.slice(3), ...FEATURES.slice(0, 3)].map((f, i) => (
                <button key={i} onClick={() => setActiveFeature(FEATURES.findIndex(x => x.key === f.key))}
                  className="shrink-0 inline-flex items-center gap-3 px-5 py-3.5 rounded-2xl border cursor-pointer transition-all hover:scale-105"
                  style={{
                    background: activeFeature === FEATURES.findIndex(x => x.key === f.key) ? f.bg : 'white',
                    borderColor: activeFeature === FEATURES.findIndex(x => x.key === f.key) ? f.accent : '#D5E6F5',
                    boxShadow: activeFeature === FEATURES.findIndex(x => x.key === f.key) ? `0 4px 16px ${f.accent}30` : '0 2px 8px rgba(28,58,107,0.06)',
                  }}>
                  <FIcon k={f.key} color={f.accent} size={18} />
                  <span className="text-sm font-bold whitespace-nowrap" style={{ color: f.accent }}>{f.short}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Feature spotlight ──────────────────────── */}
        <div className="max-w-4xl mx-auto px-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeFeature}
              initial={{ opacity:0, y:24, scale:0.97 }}
              animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:-20, scale:0.97 }}
              transition={{ duration:0.4, ease:[0.22,1,0.36,1] }}
              className="rounded-3xl border overflow-hidden"
              style={{ background:'white', borderColor:`${feat.accent}30`, boxShadow:`0 16px 48px ${feat.accent}18` }}>

              <div className="grid sm:grid-cols-2 gap-0">
                {/* Left: info */}
                <div className="p-8 sm:p-10 flex flex-col justify-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: feat.bg }}>
                    <FIcon k={feat.key} color={feat.accent} size={26} />
                  </div>
                  <h3 className="text-2xl font-extrabold mb-3" style={{ color:NAVY }}>{feat.label}</h3>
                  <p className="leading-relaxed mb-6" style={{ color:'#4A6FA8' }}>{feat.desc}</p>
                  <div className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full w-fit"
                    style={{ background: feat.bg, color: feat.accent }}>
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: feat.accent }} />
                    {feat.stat}
                  </div>

                  {/* Dot nav */}
                  <div className="flex gap-2 mt-8">
                    {FEATURES.map((_, i) => (
                      <button key={i} onClick={() => setActiveFeature(i)}
                        className="rounded-full transition-all cursor-pointer"
                        style={{
                          width: activeFeature === i ? 24 : 8,
                          height: 8,
                          background: activeFeature === i ? feat.accent : '#D5E6F5',
                        }} />
                    ))}
                  </div>
                </div>

                {/* Right: animated visual */}
                <div className="relative flex items-center justify-center p-8 overflow-hidden"
                  style={{ background: feat.bg }}>

                  {/* Rotating ring decoration */}
                  <motion.div
                    animate={{ rotate:360 }} transition={{ duration:20, repeat:Infinity, ease:'linear' }}
                    className="absolute w-64 h-64 rounded-full border-2 border-dashed pointer-events-none"
                    style={{ borderColor:`${feat.accent}30` }} />

                  {/* Central icon glow */}
                  <motion.div
                    animate={{ scale:[1, 1.08, 1] }}
                    transition={{ duration:2.5, repeat:Infinity, ease:'easeInOut' }}
                    className="relative z-10 w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl"
                    style={{ background:`linear-gradient(135deg, ${feat.accent}22, ${feat.accent}44)`, boxShadow:`0 20px 50px ${feat.accent}35` }}>
                    <FIcon k={feat.key} color={feat.accent} size={52} />
                  </motion.div>

                  {/* Floating mini bubbles */}
                  {[0,1,2].map(i => (
                    <motion.div key={i}
                      animate={{ y:[0, -12, 0], x:[0, i%2===0?6:-6, 0] }}
                      transition={{ duration:2 + i*0.8, repeat:Infinity, ease:'easeInOut', delay:i*0.4 }}
                      className="absolute w-3 h-3 rounded-full pointer-events-none"
                      style={{
                        background: feat.accent,
                        opacity: 0.3 - i*0.05,
                        top: `${25 + i*20}%`,
                        left: i===0 ? '15%' : i===1 ? '80%' : '12%',
                      }} />
                  ))}

                  {/* Arrow nav buttons */}
                  <button onClick={() => setActiveFeature(i => (i - 1 + FEATURES.length) % FEATURES.length)}
                    className="absolute left-3 bottom-3 w-8 h-8 rounded-xl flex items-center justify-center border cursor-pointer transition hover:scale-110"
                    style={{ background:'white', borderColor:`${feat.accent}30`, color:feat.accent }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <button onClick={() => setActiveFeature(i => (i + 1) % FEATURES.length)}
                    className="absolute right-3 bottom-3 w-8 h-8 rounded-xl flex items-center justify-center border cursor-pointer transition hover:scale-110"
                    style={{ background:'white', borderColor:`${feat.accent}30`, color:feat.accent }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-28">
        <motion.div
          initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }} transition={{ duration:0.5 }}
          className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:ORANGE }}>How it works</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color:NAVY }}>Up and running in minutes</h2>
        </motion.div>

        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-10">
          {/* connector */}
          <div className="absolute top-8 left-[16.6%] right-[16.6%] h-0.5 hidden sm:block"
            style={{ background:`linear-gradient(90deg, ${BLUE}50, ${ORANGE}50)` }} />

          {STEPS.map((s, i) => (
            <motion.div key={i} className="text-center relative z-10"
              initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ duration:0.5, delay:i*0.15 }}>
              <motion.div
                whileHover={{ scale:1.08, rotate:3 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-xl font-extrabold text-white"
                style={{
                  background: i===2 ? `linear-gradient(135deg, ${ORANGE}, #C4541A)` : `linear-gradient(135deg, ${NAVY}, ${BLUE})`,
                  boxShadow: i===2 ? `0 8px 24px ${ORANGE}45` : `0 8px 24px ${BLUE}45`,
                }}>
                {s.n}
              </motion.div>
              <h3 className="font-bold mb-2" style={{ color:NAVY }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color:'#4A6FA8' }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
        viewport={{ once:true }} transition={{ duration:0.6 }}
        className="relative z-10 max-w-4xl mx-auto px-6 pb-28">
        <div className="relative overflow-hidden rounded-3xl p-12 text-center"
          style={{ background:`linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 65%, #3A8FD4 100%)` }}>

          <motion.div
            animate={{ x:[0,60,0], y:[0,-30,0] }} transition={{ duration:18, repeat:Infinity, ease:'easeInOut' }}
            className="absolute -top-16 -right-16 w-52 h-52 rounded-full pointer-events-none"
            style={{ background:'rgba(255,255,255,0.08)' }} />
          <motion.div
            animate={{ x:[0,-40,0], y:[0,25,0] }} transition={{ duration:22, repeat:Infinity, ease:'easeInOut' }}
            className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full pointer-events-none"
            style={{ background:`${ORANGE}25` }} />

          <p className="relative text-xs font-bold uppercase tracking-widest mb-4 text-white opacity-60">Get started today</p>
          <h2 className="relative text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to take control<br className="hidden sm:block" /> of your career?
          </h2>
          <p className="relative text-blue-100 mb-8 text-lg max-w-xl mx-auto">
            Join thousands of job seekers who landed their dream roles with CareerTrack.
          </p>
          <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"
              className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-2xl text-lg transition-all hover:scale-105 shadow-xl"
              style={{ background:'white', color:NAVY, boxShadow:'0 8px 28px rgba(0,0,0,0.2)' }}>
              Create free account
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </Link>
            <Link href="/login"
              className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-2xl text-lg border-2 border-white/30 text-white hover:bg-white/10 transition-all">
              Sign in
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer style={{ background: NAVY }}>
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">

          {/* Top grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">

            {/* Brand */}
            <div className="lg:col-span-2">
              {/* Logo on dark bg — wrap in white pill so the colored logo reads clearly */}
              <div className="inline-block bg-white rounded-xl px-4 py-2.5 mb-5 shadow-lg">
                <img src="/careertrack.png" alt="CareerTrack" className="h-7 w-auto" />
              </div>
              <p className="text-sm leading-relaxed mb-6" style={{ color:'#7BA8D4' }}>
                The all-in-one platform for serious job seekers. AI-powered tools to help you apply smarter and land faster.
              </p>
              {/* Social */}
              <div className="flex gap-3">
                {[
                  { label:'X (Twitter)', d:'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.745l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                  { label:'LinkedIn',    d:'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z' },
                  { label:'GitHub',      d:'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22' },
                ].map(s => (
                  <button key={s.label} aria-label={s.label}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                    style={{ background:'rgba(255,255,255,0.1)' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.2)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round">
                      <path d={s.d} />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
              <div key={heading}>
                <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color:'#4A6FA8' }}>{heading}</p>
                <ul className="space-y-3">
                  {links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-sm transition-colors" style={{ color:'#7BA8D4' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'white')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#7BA8D4')}>
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t"
            style={{ borderColor:'rgba(255,255,255,0.08)' }}>
            <p className="text-xs" style={{ color:'#4A6FA8' }}>© 2026 CareerTrack. All rights reserved.</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full animate-pulse bg-emerald-400" />
              <span className="text-xs" style={{ color:'#4A6FA8' }}>All systems operational</span>
            </div>
            <p className="text-xs" style={{ color:'#4A6FA8' }}>Built with Next.js · Supabase · Gemini AI</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
