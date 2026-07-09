import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: NextRequest) {
  const { resumeText, jobDescription } = await req.json()

  if (!resumeText || resumeText.trim().length < 50) {
    return NextResponse.json({ error: 'Resume text is too short. Paste more content.' }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
  }

  const prompt = `You are an expert ATS (Applicant Tracking System) resume analyst. Analyze the resume below and return a JSON response.

${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription.slice(0, 800)}\n\n` : ''}RESUME TEXT:
${resumeText.slice(0, 4000)}

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "score": <number 0-100>,
  "summary": "<2 sentence overall assessment>",
  "strengths": [
    { "title": "<strength title>", "detail": "<what they did well>" }
  ],
  "improvements": [
    {
      "priority": "high|medium|low",
      "title": "<issue title>",
      "description": "<what is wrong or missing>",
      "suggestion": "<specific fix or example>"
    }
  ],
  "keywords_missing": ["<keyword>", "<keyword>"],
  "keywords_found": ["<keyword>", "<keyword>"],
  "sections_check": {
    "contact": true|false,
    "summary": true|false,
    "experience": true|false,
    "education": true|false,
    "skills": true|false,
    "projects": true|false
  }
}

Score rubric:
- 90-100: Excellent, ATS-ready with strong keywords and formatting
- 75-89: Good, minor improvements needed
- 60-74: Decent, several ATS issues to fix
- 40-59: Needs significant work
- 0-39: Major issues, unlikely to pass ATS

Give 2-3 strengths and 3-5 improvements. Be specific and actionable.`

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    // Strip markdown code fences if present
    const json = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')

    let parsed: any
    try { parsed = JSON.parse(json) }
    catch {
      return NextResponse.json({ error: 'AI returned invalid format. Try again.' }, { status: 500 })
    }

    return NextResponse.json(parsed)
  } catch (err: any) {
    const msg = err?.message ?? String(err)
    if (msg.includes('API key')) return NextResponse.json({ error: 'Invalid Gemini API key. Get a free key from aistudio.google.com' }, { status: 401 })
    return NextResponse.json({ error: `AI error: ${msg}` }, { status: 500 })
  }
}
