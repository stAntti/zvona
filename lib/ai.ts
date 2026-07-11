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

export async function researchWithOpenAI(sourceText: string): Promise<ResearchOutput> {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured')
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL ?? 'gpt-5.4-mini',
    instructions: 'Извлеки только факты, явно подтверждённые предоставленным текстом. Не придумывай контакты, цены или claims.',
    input: sourceText.slice(0, 40_000),
    text: { format: { type: 'json_schema', name: 'company_research', strict: true, schema: {
      type: 'object', additionalProperties: false,
      properties: {
        valueProposition: { type: 'string' }, icpHints: { type: 'array', items: { type: 'string' } }, socialProof: { type: 'array', items: { type: 'string' } }, pricingHints: { type: 'array', items: { type: 'string' } }, triggers: { type: 'array', items: { type: 'string' } }, region: { type: 'string' }, language: { type: 'string' }, confidence: { type: 'number', minimum: 0, maximum: 1 },
      }, required: ['valueProposition','icpHints','socialProof','pricingHints','triggers','region','language','confidence'],
    } } },
  })
  return researchSchema.parse(JSON.parse(response.output_text))
}
