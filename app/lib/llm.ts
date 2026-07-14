'use server'

import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

export async function chat() {
  try {
    const res = await client.chat.completions.create({
      model: 'poolside/laguna-m.1:free',
      max_tokens: 400,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Apa nama ibukota Indonesia' },
      ],
    })
    console.log('res', res)
    if (res.choices) {
      console.log('content', res.choices[0]?.message?.content)
    }
  } catch (err) {
    console.error('handleClick:::ERROR', err)
  }
}
