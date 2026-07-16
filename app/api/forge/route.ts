import { NextRequest } from 'next/server'
import { checkRateLimit } from '@/lib/rateLimit'
import { packRepo } from '@/lib/github'
import { detectStack } from '@/lib/detectStack'
import { selectSkills } from '@/lib/selectSkills'
import { streamMarkFile } from '@/lib/llm'
import { buildZip } from '@/lib/buildZip'

export const runtime = 'nodejs'

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin') || ''
  const isExtension = origin.startsWith('chrome-extension://')
  const isSelf = origin === process.env.NEXT_PUBLIC_APP_URL

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': isExtension || isSelf ? origin : 'null',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin') || ''
  const isExtension = origin.startsWith('chrome-extension://')
  const isSelf = origin === process.env.NEXT_PUBLIC_APP_URL

  const corsHeaders = {
    'Access-Control-Allow-Origin': isExtension || isSelf ? origin : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }


  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  const { success, remaining } = await checkRateLimit(ip)

  if (!success) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded', message: 'You\'ve used 5/5 scans today. Come back tomorrow.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }

  const { owner, repo } = await req.json()
  if (!owner || !repo) {
    return new Response(JSON.stringify({ error: 'Missing owner or repo' }), {
      status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {}
      }

      try {
        send({ type: 'status', message: 'Reading manifest files...', remaining })
        const context = await packRepo(owner, repo)

        const tags = detectStack(context)
        send({ type: 'stack', tags })

        const skills = selectSkills(tags)
        send({ type: 'skills', skills, count: skills.length })

        send({ type: 'status', message: 'Generating MARK File...' })
        const claudeStream = await streamMarkFile(context, tags, skills)

        let fullContent = ''
        for await (const chunk of claudeStream) {
          const text = chunk.choices[0]?.delta?.content ?? ''
          fullContent += text
          if (text) send({ type: 'content', text })
        }

        const zipBase64 = await buildZip(fullContent, skills, owner, repo)
        send({
          type: 'done',
          zipBase64,
          markFile: fullContent,
          tags,
          skills,
          repoName: `${owner}/${repo}`,
        })

      } catch (err: any) {
        send({ type: 'error', message: err.message ?? 'Scan failed. Please try again.' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      ...corsHeaders,
    },
  })
}
