import type { ModelInfo } from './types'

const API_BASE_URL = '/api/v1'

export async function fetchModels(vendor: 'anthropic' | 'google'): Promise<ModelInfo[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/${vendor}/models`)
    if (response.ok) {
      const data = await response.json()
      return data.models
    }
    return []
  } catch (err) {
    console.error(`Failed to fetch ${vendor} models:`, err)
    return []
  }
}

export async function countTokensBatch(
  texts: { json: string; jsonCompact: string; toon: string; yaml: string; xml: string },
  vendor: 'anthropic' | 'google',
  model: string
): Promise<{ json: number; jsonCompact: number; toon: number; yaml: number; xml: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}/${vendor}/counttokens/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ texts, model }),
    })

    if (response.ok) {
      const data = await response.json()
      return data.token_counts
    }
  } catch (err) {
    console.error(`Failed to count tokens for ${vendor}:`, err)
  }
  return { json: 0, jsonCompact: 0, toon: 0, yaml: 0, xml: 0 }
}
