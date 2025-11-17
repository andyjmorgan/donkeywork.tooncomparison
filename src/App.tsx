import { useState, useEffect, useRef } from 'react'
import { encode } from '@toon-format/toon'
import { Messages } from 'primereact/messages'
import { encode as encodeGPT } from 'gpt-tokenizer'
import yaml from 'js-yaml'
import * as js2xml from 'js2xmlparser'
import { Header } from './components/Header'
import { JsonInputPanel } from './components/JsonInputPanel'
import { OutputPanel } from './components/OutputPanel'
import { AboutDialog } from './components/AboutDialog'
import { TokenChart } from './components/TokenChart'
import type { ModelInfo, TokenStats } from './api'
import { fetchModels, countTokensBatch } from './api'
import './App.css'

const SIMPLE_EXAMPLE = `{
  "users": [
    { "id": 1, "name": "Alice", "role": "admin" },
    { "id": 2, "name": "Bob", "role": "user" }
  ]
}`

const ADVANCED_EXAMPLE = `{
  "glossary": {
    "title": "example glossary",
    "GlossDiv": {
      "title": "S",
      "GlossList": {
        "GlossEntry": {
          "ID": "SGML",
          "SortAs": "SGML",
          "GlossTerm": "Standard Generalized Markup Language",
          "Acronym": "SGML",
          "Abbrev": "ISO 8879:1986",
          "GlossDef": {
            "para": "A meta-markup language, used to create markup languages such as DocBook.",
            "GlossSeeAlso": [
              "GML",
              "XML"
            ]
          },
          "GlossSee": "markup"
        }
      }
    }
  }
}`

function App() {
  const messages = useRef<Messages>(null)
  const [jsonInput, setJsonInput] = useState(ADVANCED_EXAMPLE)
  const [toonOutput, setToonOutput] = useState('')
  const [yamlOutput, setYamlOutput] = useState('')
  const [xmlOutput, setXmlOutput] = useState('')
  const [error, setError] = useState('')
  const [aboutVisible, setAboutVisible] = useState(false)
  const [tokenStats, setTokenStats] = useState<TokenStats>({
    openai: {
      json: 0,
      jsonCompact: 0,
      toon: 0,
      yaml: 0,
      xml: 0
    },
    anthropic: {
      json: 0,
      jsonCompact: 0,
      toon: 0,
      yaml: 0,
      xml: 0
    },
    google: {
      json: 0,
      jsonCompact: 0,
      toon: 0,
      yaml: 0,
      xml: 0
    }
  })
  const [darkMode, setDarkMode] = useState(true)
  const [isCompact, setIsCompact] = useState(true)
  const [isCountingTokens, setIsCountingTokens] = useState(false)

  // API Integration State
  const [anthropicModels, setAnthropicModels] = useState<ModelInfo[]>([])
  const [googleModels, setGoogleModels] = useState<ModelInfo[]>([])
  const [selectedAnthropicModel, setSelectedAnthropicModel] = useState<string>('')
  const [selectedGoogleModel, setSelectedGoogleModel] = useState<string>('')
  const [loadingModels, setLoadingModels] = useState(true)

  // Fetch models from backend
  useEffect(() => {
    const loadModels = async () => {
      try {
        const [anthropicModels, googleModels] = await Promise.all([
          fetchModels('anthropic'),
          fetchModels('google')
        ])

        setAnthropicModels(anthropicModels)
        setGoogleModels(googleModels)

        // Select first model by default
        if (anthropicModels.length > 0) {
          setSelectedAnthropicModel(anthropicModels[0].id)
        }
        if (googleModels.length > 0) {
          setSelectedGoogleModel(googleModels[0].id)
        }
      } catch (err) {
        console.error('Failed to fetch models:', err)
      } finally {
        setLoadingModels(false)
      }
    }

    loadModels()
  }, [])


  const toggleTheme = () => {
    const newTheme = !darkMode
    setDarkMode(newTheme)

    // Update the theme link
    const themeLink = document.getElementById('app-theme') as HTMLLinkElement
    if (themeLink) {
      themeLink.href = newTheme
        ? 'https://unpkg.com/primereact/resources/themes/md-dark-indigo/theme.css'
        : 'https://unpkg.com/primereact/resources/themes/md-light-indigo/theme.css'
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here if desired
    })
  }

  const handleJsonChange = async (value: string) => {
    setJsonInput(value)

    try {
      if (!value.trim()) {
        setToonOutput('')
        setYamlOutput('')
        setXmlOutput('')
        setError('')
        messages.current?.clear()
        setIsCountingTokens(false)
        setTokenStats({
          openai: { json: 0, jsonCompact: 0, toon: 0, yaml: 0, xml: 0 },
          anthropic: { json: 0, jsonCompact: 0, toon: 0, yaml: 0, xml: 0 },
          google: { json: 0, jsonCompact: 0, toon: 0, yaml: 0, xml: 0 }
        })
        return
      }

      const parsed = JSON.parse(value)
      const toon = encode(parsed)
      const yamlStr = yaml.dump(parsed, { indent: 2, lineWidth: -1 })
      const xmlStr = js2xml.parse('root', parsed, { declaration: { include: false } })

      setToonOutput(toon)
      setYamlOutput(yamlStr)
      setXmlOutput(xmlStr)
      setError('')
      messages.current?.clear()

      // Prepare format texts
      const jsonPretty = JSON.stringify(parsed, null, 2)
      const jsonCompact = JSON.stringify(parsed)

      // Calculate OpenAI token counts (using gpt-tokenizer)
      const openaiTokens = {
        json: encodeGPT(jsonPretty).length,
        jsonCompact: encodeGPT(jsonCompact).length,
        toon: encodeGPT(toon).length,
        yaml: encodeGPT(yamlStr).length,
        xml: encodeGPT(xmlStr).length
      }

      // Prepare texts for batch API
      const texts = {
        json: jsonPretty,
        jsonCompact: jsonCompact,
        toon: toon,
        yaml: yamlStr,
        xml: xmlStr
      }

      // Set loading state before API calls
      setIsCountingTokens(true)

      // Fetch backend token counts for all formats using batch API
      const [anthropicTokens, googleTokens] = await Promise.all([
        selectedAnthropicModel
          ? countTokensBatch(texts, 'anthropic', selectedAnthropicModel)
          : Promise.resolve({ json: 0, jsonCompact: 0, toon: 0, yaml: 0, xml: 0 }),
        selectedGoogleModel
          ? countTokensBatch(texts, 'google', selectedGoogleModel)
          : Promise.resolve({ json: 0, jsonCompact: 0, toon: 0, yaml: 0, xml: 0 })
      ])

      setTokenStats({
        openai: openaiTokens,
        anthropic: anthropicTokens,
        google: googleTokens
      })
      setIsCountingTokens(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JSON'
      setError(errorMessage)
      setIsCountingTokens(false)
      messages.current?.show({
        severity: 'error',
        summary: 'JSON Parse Error',
        detail: errorMessage,
        sticky: true
      })
      setToonOutput('')
      setYamlOutput('')
      setXmlOutput('')
    }
  }

  // Initial conversion on mount
  useEffect(() => {
    if (!loadingModels) {
      handleJsonChange(jsonInput)
    }
  }, [loadingModels]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-count tokens when models change
  useEffect(() => {
    if (!loadingModels && jsonInput.trim() && (selectedAnthropicModel || selectedGoogleModel)) {
      handleJsonChange(jsonInput)
    }
  }, [selectedAnthropicModel, selectedGoogleModel]) // eslint-disable-line react-hooks/exhaustive-deps


  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        onShowAbout={() => setAboutVisible(true)}
      />

      {/* Error Display */}
      <Messages ref={messages} />

      {/* Main Content - Simple Flex Layout */}
      <div className="main-content" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '1rem', gap: '1rem' }}>
        {/* Top Row: JSON Input (50%) | Chart (50%) */}
        <div style={{ flex: 1, display: 'flex', gap: '1rem', minHeight: 0 }}>
          <JsonInputPanel
            value={jsonInput}
            onChange={handleJsonChange}
            error={error}
            onLoadSimple={() => handleJsonChange(SIMPLE_EXAMPLE)}
            onLoadAdvanced={() => handleJsonChange(ADVANCED_EXAMPLE)}
            onFormat={() => {
              try {
                const parsed = JSON.parse(jsonInput)
                const formatted = JSON.stringify(parsed, null, 2)
                handleJsonChange(formatted)
              } catch (err) {
                // ignore
              }
            }}
          />

          {/* Chart - Right 50% */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--border-radius)', padding: '1rem', overflow: 'hidden' }}>
            <TokenChart
              tokenStats={tokenStats}
              anthropicModels={anthropicModels}
              googleModels={googleModels}
              selectedAnthropicModel={selectedAnthropicModel}
              selectedGoogleModel={selectedGoogleModel}
              onAnthropicModelChange={setSelectedAnthropicModel}
              onGoogleModelChange={setSelectedGoogleModel}
              loadingModels={loadingModels}
              isCountingTokens={isCountingTokens}
              darkMode={darkMode}
            />
          </div>
        </div>

        {/* Bottom Row: 4 Output Panels */}
        <div style={{ flex: 1, display: 'flex', gap: '1rem', minHeight: 0 }}>
          <OutputPanel
            title="JSON Output"
            output={jsonInput.trim() && !error ? (() => {
              try {
                const parsed = JSON.parse(jsonInput)
                return isCompact ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2)
              } catch {
                return jsonInput
              }
            })() : ''}
            darkMode={darkMode}
            onCopy={() => copyToClipboard(isCompact ? JSON.stringify(JSON.parse(jsonInput)) : jsonInput)}
            severity="secondary"
            showCompactToggle={true}
            isCompact={isCompact}
            onToggleCompact={setIsCompact}
            disabled={!jsonInput.trim() || !!error}
          />

          <OutputPanel
            title="TOON Output"
            titleColor="var(--green-600)"
            output={toonOutput}
            darkMode={darkMode}
            onCopy={() => copyToClipboard(toonOutput)}
            severity="success"
          />

          <OutputPanel
            title="YAML Output"
            titleColor="var(--blue-600)"
            output={yamlOutput}
            darkMode={darkMode}
            onCopy={() => copyToClipboard(yamlOutput)}
            severity="info"
          />

          <OutputPanel
            title="XML Output"
            titleColor="var(--orange-600)"
            output={xmlOutput}
            darkMode={darkMode}
            onCopy={() => copyToClipboard(xmlOutput)}
            severity="warning"
          />
        </div>
      </div>

      <AboutDialog
        visible={aboutVisible}
        onHide={() => setAboutVisible(false)}
      />
    </div>
  )
}

export default App
