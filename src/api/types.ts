export interface ModelInfo {
  id: string
  display_name: string
  created_at: string
}

export interface TokenStats {
  openai: {
    json: number
    jsonCompact: number
    toon: number
    yaml: number
    xml: number
  }
  anthropic: {
    json: number
    jsonCompact: number
    toon: number
    yaml: number
    xml: number
  }
  google: {
    json: number
    jsonCompact: number
    toon: number
    yaml: number
    xml: number
  }
}
