import { describe, expect, it } from 'vitest'
import { getAIStatus } from './ai'

describe('getAIStatus', () => {
  it('prefers Kimi when both providers are configured', () => {
    expect(getAIStatus({
      KIMI_API_KEY: 'demo-kimi-key',
      KIMI_MODEL: 'kimi-k2.6',
      OPENAI_API_KEY: 'demo-openai-key',
    })).toEqual({ configured: true, provider: 'kimi', model: 'kimi-k2.6' })
  })

  it('accepts the official MOONSHOT_API_KEY name', () => {
    expect(getAIStatus({ MOONSHOT_API_KEY: 'demo-kimi-key' })).toEqual({
      configured: true,
      provider: 'kimi',
      model: 'kimi-k2.6',
    })
  })

  it('falls back to OpenAI', () => {
    expect(getAIStatus({ OPENAI_API_KEY: 'demo-openai-key' })).toEqual({
      configured: true,
      provider: 'openai',
      model: 'gpt-5.4-mini',
    })
  })

  it('reports missing configuration without exposing a key', () => {
    expect(getAIStatus({})).toEqual({ configured: false, provider: null, model: null })
  })
})
