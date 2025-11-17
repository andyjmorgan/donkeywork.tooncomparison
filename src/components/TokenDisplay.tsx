import { encode as encodeGPT, decode as decodeGPT } from 'gpt-tokenizer'

interface TokenDisplayProps {
  text: string
  darkMode: boolean
}

const COLORS_LIGHT = [
  'var(--cyan-100)', 'var(--blue-100)', 'var(--indigo-100)',
  'var(--purple-100)', 'var(--pink-100)', 'var(--red-100)',
  'var(--orange-100)', 'var(--yellow-100)', 'var(--green-100)',
  'var(--teal-100)', 'var(--cyan-200)', 'var(--purple-200)'
]

const COLORS_DARK = [
  'var(--cyan-700)', 'var(--blue-700)', 'var(--indigo-700)',
  'var(--purple-700)', 'var(--pink-700)', 'var(--red-700)',
  'var(--orange-700)', 'var(--yellow-700)', 'var(--green-700)',
  'var(--teal-700)', 'var(--cyan-600)', 'var(--purple-600)'
]

export function TokenDisplay({ text, darkMode }: TokenDisplayProps) {
  const tokens = encodeGPT(text)
  const colors = darkMode ? COLORS_DARK : COLORS_LIGHT

  return (
    <pre style={{
      margin: 0,
      fontFamily: 'monospace',
      fontSize: '12px',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      lineHeight: '1.8'
    }}>
      {tokens.map((tokenId, index) => {
        const tokenText = decodeGPT([tokenId])
        const bgColor = colors[index % colors.length]

        return (
          <span
            key={index}
            style={{
              backgroundColor: bgColor,
              borderRadius: '3px',
              padding: '2px 1px'
            }}
            title={`Token #${index}\nID: ${tokenId}\nText: ${JSON.stringify(tokenText)}`}
          >
            {tokenText}
          </span>
        )
      })}
    </pre>
  )
}
