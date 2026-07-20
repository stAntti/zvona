import OpenAI from 'openai'
import { z } from 'zod'

export const researchSchema = z.object({
  valueProposition: z.string(),
  icpHints: z.array(z.string()),
  socialProof: z.array(z.string()),
  pricingHints: z.array(z.string()),
  triggers: z.array(z.string()),
  region: z.string(),
  language: z.string(),
  confidence: z.number().min(0).max(1),
})

export type ResearchOutput = z.infer<typeof researchSchema>
export type AIProvider = 'kimi' | 'openai'

type ProviderConfig = {
  provider: AIProvider
  apiKey: string
  model: string
  baseURL?: string
}

const researchJsonSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    valueProposition: { type: 'string' },
    icpHints: { type: 'array', items: { type: 'string' } },
    socialProof: { type: 'array', items: { type: 'string' } },
    pricingHints: { type: 'array', items: { type: 'string' } },
    triggers: { type: 'array', items: { type: 'string' } },
    region: { type: 'string' },
    language: { type: 'string' },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
  },
  required: ['valueProposition', 'icpHints', 'socialProof', 'pricingHints', 'triggers', 'region', 'language', 'confidence'],
} as const

const instructions = [
  'Извлеки только факты, явно подтверждённые предоставленным текстом.',
  'Не придумывай контакты, цены или claims.',
  'Верни данные строго по заданной JSON Schema.',
].join(' ')

function resolveProvider(env: NodeJS.ProcessEnv = process.env): ProviderConfig {
  const kimiKey = env.KIMI_API_KEY ?? env.MOONSHOT_API_KEY
  if (kimiKey) {
    return {
      provider: 'kimi',
      apiKey: kimiKey,
      model: env.KIMI_MODEL ?? 'kimi-k2.6',
      baseURL: env.KIMI_BASE_URL ?? 'https://api.moonshot.ai/v1',
    }
  }
  if (env.OPENAI_API_KEY) {
    return {
      provider: 'openai',
      apiKey: env.OPENAI_API_KEY,
      model: env.OPENAI_MODEL ?? 'gpt-5.4-mini',
    }
  }
  throw new Error('KIMI_API_KEY or OPENAI_API_KEY is not configured')
}

export function getAIStatus(env: NodeJS.ProcessEnv = process.env) {
  try {
    const config = resolveProvider(env)
    return { configured: true, provider: config.provider, model: config.model }
  } catch {
    return { configured: false, provider: null, model: null }
  }
}

function parseResearchOutput(content: string): ResearchOutput {
  return researchSchema.parse(JSON.parse(content))
}

async function researchWithKimi(sourceText: string, config: ProviderConfig): Promise<ResearchOutput> {
  const client = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseURL })
  const request: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming & {
    thinking: { type: 'disabled' }
  } = {
    model: config.model,
    thinking: { type: 'disabled' },
    max_completion_tokens: 1_000,
    messages: [
      { role: 'system', content: instructions },
      { role: 'user', content: sourceText.slice(0, 40_000) },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'company_research',
        strict: true,
        schema: researchJsonSchema,
      },
    },
  }
  const response = await client.chat.completions.create(request)
  const choice = response.choices[0]
  if (!choice || choice.finish_reason === 'length') throw new Error('Kimi response was incomplete')
  if (typeof choice.message.content !== 'string') throw new Error('Kimi returned an empty response')
  return parseResearchOutput(choice.message.content)
}

async function researchWithOpenAI(sourceText: string, config: ProviderConfig): Promise<ResearchOutput> {
  const client = new OpenAI({ apiKey: config.apiKey })
  const response = await client.responses.create({
    model: config.model,
    instructions,
    input: sourceText.slice(0, 40_000),
    text: {
      format: {
        type: 'json_schema',
        name: 'company_research',
        strict: true,
        schema: researchJsonSchema,
      },
    },
  })
  return parseResearchOutput(response.output_text)
}

export async function researchWithAI(sourceText: string): Promise<ResearchOutput> {
  const config = resolveProvider()
  return config.provider === 'kimi'
    ? researchWithKimi(sourceText, config)
    : researchWithOpenAI(sourceText, config)
}
