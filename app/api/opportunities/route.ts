import { NextRequest, NextResponse } from 'next/server'
import { generateOpportunities } from '@/lib/llm'

export const runtime = 'nodejs'

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(req: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  try {
    const { markFile, repoName, stack } = await req.json()
    const ideas = await generateOpportunities(markFile, repoName, stack)
    return NextResponse.json({ ideas }, { headers: corsHeaders })
  } catch (err: any) {
    return NextResponse.json(
      { ideas: [], error: err.message },
      { status: 500, headers: corsHeaders }
    )
  }
}
