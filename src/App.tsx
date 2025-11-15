import { useState, useEffect } from 'react'
import { encode } from '@toon-format/toon'
import { Splitter, SplitterPanel } from 'primereact/splitter'
import { InputTextarea } from 'primereact/inputtextarea'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputSwitch } from 'primereact/inputswitch'
import { encode as encodeGPT, decode as decodeGPT } from 'gpt-tokenizer'
import yaml from 'js-yaml'
import donkeyworkLogo from './assets/donkeywork.png'
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
  const [jsonInput, setJsonInput] = useState(ADVANCED_EXAMPLE)
  const [toonOutput, setToonOutput] = useState('')
  const [yamlOutput, setYamlOutput] = useState('')
  const [error, setError] = useState('')
  const [aboutVisible, setAboutVisible] = useState(false)
  const [summaryVisible, setSummaryVisible] = useState(false)
  const [tokenStats, setTokenStats] = useState({ json: 0, jsonCompact: 0, toon: 0, yaml: 0 })
  const [showTokens, setShowTokens] = useState<{json: boolean, toon: boolean, yaml: boolean}>({
    json: true,
    toon: true,
    yaml: true
  })
  const [darkMode, setDarkMode] = useState(false)
  const [isCompact, setIsCompact] = useState(true)

  const toggleTheme = () => {
    const newTheme = !darkMode
    setDarkMode(newTheme)

    // Update the theme link
    const themeLink = document.getElementById('app-theme') as HTMLLinkElement
    if (themeLink) {
      themeLink.href = newTheme
        ? 'https://unpkg.com/primereact/resources/themes/lara-dark-cyan/theme.css'
        : 'https://unpkg.com/primereact/resources/themes/lara-light-cyan/theme.css'
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here if desired
    })
  }

  const handleJsonChange = (value: string) => {
    setJsonInput(value)

    try {
      if (!value.trim()) {
        setToonOutput('')
        setYamlOutput('')
        setError('')
        setTokenStats({ json: 0, jsonCompact: 0, toon: 0, yaml: 0 })
        return
      }

      const parsed = JSON.parse(value)
      const toon = encode(parsed)
      const yamlStr = yaml.dump(parsed, { indent: 2, lineWidth: -1 })

      setToonOutput(toon)
      setYamlOutput(yamlStr)
      setError('')

      // Calculate token counts
      const jsonPrettyTokens = encodeGPT(JSON.stringify(parsed, null, 2)).length
      const jsonCompactTokens = encodeGPT(JSON.stringify(parsed)).length
      const toonTokens = encodeGPT(toon).length
      const yamlTokens = encodeGPT(yamlStr).length

      setTokenStats({
        json: jsonPrettyTokens,
        jsonCompact: jsonCompactTokens,
        toon: toonTokens,
        yaml: yamlTokens
      })
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Invalid JSON')
      }
      setToonOutput('')
      setYamlOutput('')
    }
  }

  // Initial conversion on mount
  useEffect(() => {
    handleJsonChange(jsonInput)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // This effect is no longer needed since we calculate both in handleJsonChange

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

  const renderColoredText = (text: string) => {
    const tokens = encodeGPT(text)
    const colors = darkMode ? COLORS_DARK : COLORS_LIGHT

    return (
      <pre style={{
        margin: 0,
        fontFamily: 'monospace',
        fontSize: '14px',
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div className="app-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--surface-border)',
        backgroundColor: 'var(--surface-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src={donkeyworkLogo} alt="DonkeyWork" style={{ height: '40px' }} />
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Format Tokenizer</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Button
            icon={darkMode ? "pi pi-sun" : "pi pi-moon"}
            onClick={toggleTheme}
            text
            severity="help"
            aria-label="Toggle theme"
            tooltip="Theme"
            tooltipOptions={{ position: 'bottom' }}
          />
          <Button
            icon="pi pi-github"
            onClick={() => window.open('https://github.com/andyjmorgan/donkeywork.tooncomparison', '_blank')}
            text
            severity="help"
            aria-label="GitHub"
            tooltip="GitHub"
            tooltipOptions={{ position: 'bottom' }}
          />
          <Button
            icon="pi pi-info-circle"
            onClick={() => setAboutVisible(true)}
            text
            severity="help"
            aria-label="About"
            tooltip="About"
            tooltipOptions={{ position: 'bottom' }}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '1rem 2rem',
          backgroundColor: 'var(--red-50)',
          color: 'var(--red-900)',
          borderBottom: '1px solid var(--red-200)'
        }}>
          <i className="pi pi-exclamation-triangle" style={{ marginRight: '0.5rem' }} />
          {error}
        </div>
      )}

      {/* Main Content - Split Screen */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Splitter className="main-content-splitter" style={{ height: '100%' }}>
          {/* Left Panel - JSON Input and Output */}
          <SplitterPanel size={50} minSize={30} style={{ overflow: 'hidden', width: '100%' }}>
            <Splitter layout="vertical" style={{ height: '100%' }}>
              {/* JSON Input */}
              <SplitterPanel size={50} minSize={20} style={{ overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
                  <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 style={{ margin: 0 }}>JSON Input</h3>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <Button
                        label="Simple"
                        severity="secondary"
                        text
                        size="small"
                        onClick={() => handleJsonChange(SIMPLE_EXAMPLE)}
                        tooltip="Load simple example"
                        tooltipOptions={{ position: 'top' }}
                      />
                      <Button
                        label="Advanced"
                        severity="secondary"
                        text
                        size="small"
                        onClick={() => handleJsonChange(ADVANCED_EXAMPLE)}
                        tooltip="Load advanced example"
                        tooltipOptions={{ position: 'top' }}
                      />
                      <div style={{ borderLeft: '1px solid var(--surface-border)', height: '1.5rem', margin: '0 0.25rem' }} />
                      <Button
                        icon="pi pi-align-justify"
                        severity="secondary"
                        text
                        onClick={() => {
                          try {
                            const parsed = JSON.parse(jsonInput)
                            const formatted = JSON.stringify(parsed, null, 2)
                            handleJsonChange(formatted)
                          } catch (err) {
                            // If it fails, just keep the current value
                          }
                        }}
                        disabled={!jsonInput.trim() || !!error}
                        tooltip="Format"
                        tooltipOptions={{ position: 'top' }}
                      />
                    </div>
                  </div>
                  <InputTextarea
                    value={jsonInput}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    style={{
                      flex: 1,
                      width: '100%',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      resize: 'none',
                      minHeight: 0
                    }}
                    autoResize={false}
                  />
                </div>
              </SplitterPanel>

              {/* JSON Output */}
              <SplitterPanel size={50} minSize={20} style={{ overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
                  <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 style={{ margin: 0 }}>JSON Output</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <label htmlFor="format-switch" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        {isCompact ? 'Compact' : 'Pretty'}
                      </label>
                      <InputSwitch
                        inputId="format-switch"
                        checked={isCompact}
                        onChange={(e) => setIsCompact(e.value)}
                        disabled={!jsonInput.trim() || !!error}
                      />
                      <div style={{ borderLeft: '1px solid var(--surface-border)', height: '1.5rem', marginLeft: '0.25rem', marginRight: '0.25rem' }} />
                      <Button
                        icon={showTokens.json ? "pi pi-eye-slash" : "pi pi-eye"}
                        severity="secondary"
                        text
                        onClick={() => setShowTokens(prev => ({ ...prev, json: !prev.json }))}
                        disabled={!jsonInput.trim() || !!error}
                        tooltip={showTokens.json ? "Hide Tokens" : "Show Tokens"}
                        tooltipOptions={{ position: 'top' }}
                      />
                      <Button
                        icon="pi pi-copy"
                        severity="secondary"
                        text
                        onClick={() => copyToClipboard(isCompact ? JSON.stringify(JSON.parse(jsonInput)) : jsonInput)}
                        disabled={!jsonInput.trim() || !!error}
                        tooltip="Copy"
                        tooltipOptions={{ position: 'top' }}
                      />
                    </div>
                  </div>
                  <div style={{
                    flex: 1,
                    overflow: 'auto',
                    border: '1px solid var(--surface-border)',
                    borderRadius: 'var(--border-radius)',
                    backgroundColor: 'var(--surface-card)',
                    padding: '1rem'
                  }}>
                    {jsonInput.trim() && !error ? (
                      (() => {
                        try {
                          const parsed = JSON.parse(jsonInput)
                          const formatted = isCompact ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2)
                          return showTokens.json ? renderColoredText(formatted) : (
                            <pre style={{
                              margin: 0,
                              fontFamily: 'monospace',
                              fontSize: '14px',
                              whiteSpace: 'pre',
                              wordWrap: 'break-word'
                            }}>
                              {formatted}
                            </pre>
                          )
                        } catch {
                          return (
                            <pre style={{
                              margin: 0,
                              fontFamily: 'monospace',
                              fontSize: '14px',
                              whiteSpace: 'pre',
                              wordWrap: 'break-word'
                            }}>
                              {jsonInput}
                            </pre>
                          )
                        }
                      })()
                    ) : (
                      <pre style={{
                        margin: 0,
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        whiteSpace: 'pre',
                        wordWrap: 'break-word',
                        color: 'var(--text-color-secondary)'
                      }}>
                        Enter valid JSON to see output
                      </pre>
                    )}
                  </div>
                </div>
              </SplitterPanel>
            </Splitter>
          </SplitterPanel>

          {/* Right Panel - TOON and YAML */}
          <SplitterPanel size={50} minSize={30} style={{ overflow: 'hidden', width: '100%' }}>
            <Splitter layout="vertical" style={{ height: '100%' }}>
              {/* Top Right - TOON Output */}
              <SplitterPanel size={50} minSize={20} style={{ overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
                  <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, color: 'var(--green-600)' }}>TOON Output</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button
                        icon={showTokens.toon ? "pi pi-eye-slash" : "pi pi-eye"}
                        severity="success"
                        text
                        onClick={() => setShowTokens(prev => ({ ...prev, toon: !prev.toon }))}
                        disabled={!toonOutput}
                        tooltip={showTokens.toon ? "Hide Tokens" : "Show Tokens"}
                        tooltipOptions={{ position: 'top' }}
                      />
                      <Button
                        icon="pi pi-copy"
                        severity="success"
                        text
                        onClick={() => copyToClipboard(toonOutput)}
                        disabled={!toonOutput}
                        tooltip="Copy"
                        tooltipOptions={{ position: 'top' }}
                      />
                    </div>
                  </div>
                  <div style={{
                    flex: 1,
                    overflow: 'auto',
                    border: '1px solid var(--surface-border)',
                    borderRadius: 'var(--border-radius)',
                    backgroundColor: 'var(--surface-card)',
                    padding: '1rem'
                  }}>
                    {toonOutput ? (
                      showTokens.toon ? renderColoredText(toonOutput) : (
                        <pre style={{
                          margin: 0,
                          fontFamily: 'monospace',
                          fontSize: '14px',
                          whiteSpace: 'pre',
                          wordWrap: 'break-word'
                        }}>
                          {toonOutput}
                        </pre>
                      )
                    ) : (
                      <pre style={{
                        margin: 0,
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        whiteSpace: 'pre',
                        wordWrap: 'break-word',
                        color: 'var(--text-color-secondary)'
                      }}>
                        Enter valid JSON to see TOON output
                      </pre>
                    )}
                  </div>
                </div>
              </SplitterPanel>

              {/* Bottom Right - YAML Output */}
              <SplitterPanel size={50} minSize={20} style={{ overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
                  <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, color: 'var(--blue-600)' }}>YAML Output</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button
                        icon={showTokens.yaml ? "pi pi-eye-slash" : "pi pi-eye"}
                        severity="info"
                        text
                        onClick={() => setShowTokens(prev => ({ ...prev, yaml: !prev.yaml }))}
                        disabled={!yamlOutput}
                        tooltip={showTokens.yaml ? "Hide Tokens" : "Show Tokens"}
                        tooltipOptions={{ position: 'top' }}
                      />
                      <Button
                        icon="pi pi-copy"
                        severity="info"
                        text
                        onClick={() => copyToClipboard(yamlOutput)}
                        disabled={!yamlOutput}
                        tooltip="Copy"
                        tooltipOptions={{ position: 'top' }}
                      />
                    </div>
                  </div>
                  <div style={{
                    flex: 1,
                    overflow: 'auto',
                    border: '1px solid var(--surface-border)',
                    borderRadius: 'var(--border-radius)',
                    backgroundColor: 'var(--surface-card)',
                    padding: '1rem'
                  }}>
                    {yamlOutput ? (
                      showTokens.yaml ? renderColoredText(yamlOutput) : (
                        <pre style={{
                          margin: 0,
                          fontFamily: 'monospace',
                          fontSize: '14px',
                          whiteSpace: 'pre',
                          wordWrap: 'break-word'
                        }}>
                          {yamlOutput}
                        </pre>
                      )
                    ) : (
                      <pre style={{
                        margin: 0,
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        whiteSpace: 'pre',
                        wordWrap: 'break-word',
                        color: 'var(--text-color-secondary)'
                      }}>
                        Enter valid JSON to see YAML output
                      </pre>
                    )}
                  </div>
                </div>
              </SplitterPanel>
            </Splitter>
          </SplitterPanel>
        </Splitter>

        {/* Mobile Grid Layout */}
        <div className="mobile-grid-layout">
          {/* JSON Input */}
          <div className="mobile-panel" style={{ backgroundColor: 'var(--surface-card)', borderRadius: '4px', padding: '1rem' }}>
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ margin: 0 }}>JSON Input</h3>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <Button
                  label="Simple"
                  severity="secondary"
                  text
                  size="small"
                  onClick={() => handleJsonChange(SIMPLE_EXAMPLE)}
                />
                <Button
                  label="Advanced"
                  severity="secondary"
                  text
                  size="small"
                  onClick={() => handleJsonChange(ADVANCED_EXAMPLE)}
                />
                <Button
                  icon="pi pi-align-justify"
                  severity="secondary"
                  text
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(jsonInput)
                      const formatted = JSON.stringify(parsed, null, 2)
                      handleJsonChange(formatted)
                    } catch (err) {
                      // ignore
                    }
                  }}
                  disabled={!jsonInput.trim() || !!error}
                />
              </div>
            </div>
            <InputTextarea
              value={jsonInput}
              onChange={(e) => handleJsonChange(e.target.value)}
              style={{
                width: '100%',
                fontFamily: 'monospace',
                fontSize: '14px',
                resize: 'none'
              }}
            />
          </div>

          {/* JSON Output */}
          <div className="mobile-panel" style={{ backgroundColor: 'var(--surface-card)', borderRadius: '4px', padding: '1rem' }}>
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ margin: 0 }}>JSON Output</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <label htmlFor="format-switch-mobile" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  {isCompact ? 'Compact' : 'Pretty'}
                </label>
                <InputSwitch
                  inputId="format-switch-mobile"
                  checked={isCompact}
                  onChange={(e) => setIsCompact(e.value)}
                  disabled={!jsonInput.trim() || !!error}
                />
                <Button
                  icon="pi pi-copy"
                  severity="secondary"
                  text
                  onClick={() => copyToClipboard(isCompact ? JSON.stringify(JSON.parse(jsonInput)) : jsonInput)}
                  disabled={!jsonInput.trim() || !!error}
                />
                <Button
                  icon={showTokens.json ? 'pi pi-eye-slash' : 'pi pi-eye'}
                  severity="secondary"
                  text
                  onClick={() => setShowTokens(prev => ({ ...prev, json: !prev.json }))}
                  disabled={!jsonInput.trim() || !!error}
                />
              </div>
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowY: 'auto',
              flex: 1,
              padding: '0.75rem',
              backgroundColor: 'var(--surface-ground)',
              borderRadius: '4px'
            }}>
              {showTokens.json ? renderColoredText(isCompact ? JSON.stringify(JSON.parse(jsonInput)) : JSON.stringify(JSON.parse(jsonInput), null, 2)) : (isCompact ? JSON.stringify(JSON.parse(jsonInput)) : JSON.stringify(JSON.parse(jsonInput), null, 2))}
            </div>
          </div>

          {/* TOON Output */}
          <div className="mobile-panel" style={{ backgroundColor: 'var(--surface-card)', borderRadius: '4px', padding: '1rem' }}>
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ margin: 0 }}>TOON Output</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  icon="pi pi-copy"
                  severity="success"
                  text
                  onClick={() => copyToClipboard(toonOutput)}
                  disabled={!toonOutput}
                />
                <Button
                  icon={showTokens.toon ? 'pi pi-eye-slash' : 'pi pi-eye'}
                  severity="success"
                  text
                  onClick={() => setShowTokens(prev => ({ ...prev, toon: !prev.toon }))}
                  disabled={!toonOutput}
                />
              </div>
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowY: 'auto',
              flex: 1,
              padding: '0.75rem',
              backgroundColor: 'var(--surface-ground)',
              borderRadius: '4px'
            }}>
              {showTokens.toon ? renderColoredText(toonOutput) : toonOutput}
            </div>
          </div>

          {/* YAML Output */}
          <div className="mobile-panel" style={{ backgroundColor: 'var(--surface-card)', borderRadius: '4px', padding: '1rem' }}>
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ margin: 0 }}>YAML Output</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  icon="pi pi-copy"
                  severity="info"
                  text
                  onClick={() => copyToClipboard(yamlOutput)}
                  disabled={!yamlOutput}
                />
                <Button
                  icon={showTokens.yaml ? 'pi pi-eye-slash' : 'pi pi-eye'}
                  severity="info"
                  text
                  onClick={() => setShowTokens(prev => ({ ...prev, yaml: !prev.yaml }))}
                  disabled={!yamlOutput}
                />
              </div>
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowY: 'auto',
              flex: 1,
              padding: '0.75rem',
              backgroundColor: 'var(--surface-ground)',
              borderRadius: '4px'
            }}>
              {showTokens.yaml ? renderColoredText(yamlOutput) : yamlOutput}
            </div>
          </div>
        </div>
      </div>

      {/* Token Stats */}
      {jsonInput.trim() && !error && (
        <div className="token-stats-wrapper" style={{
          padding: '1rem 2rem',
          backgroundColor: 'var(--surface-ground)',
          borderTop: '1px solid var(--surface-border)'
        }}>
          <div className="token-stats" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
            <div>
              <strong>JSON:</strong> {isCompact ? tokenStats.jsonCompact : tokenStats.json} tokens
            </div>
            <div style={{ color: 'var(--green-600)' }}>
              <strong>TOON:</strong> {tokenStats.toon} tokens
              <span style={{ marginLeft: '0.5rem', fontSize: '0.9em' }}>
                {(() => {
                  const currentJson = isCompact ? tokenStats.jsonCompact : tokenStats.json
                  const percent = ((currentJson - tokenStats.toon) / currentJson * 100)
                  return percent >= 0
                    ? `(${percent.toFixed(1)}% saved)`
                    : `(${Math.abs(percent).toFixed(1)}% more expensive)`
                })()}
              </span>
            </div>
            <div style={{ color: 'var(--blue-600)' }}>
              <strong>YAML:</strong> {tokenStats.yaml} tokens
              <span style={{ marginLeft: '0.5rem', fontSize: '0.9em' }}>
                {(() => {
                  const currentJson = isCompact ? tokenStats.jsonCompact : tokenStats.json
                  const percent = ((currentJson - tokenStats.yaml) / currentJson * 100)
                  return percent >= 0
                    ? `(${percent.toFixed(1)}% saved)`
                    : `(${Math.abs(percent).toFixed(1)}% more expensive)`
                })()}
              </span>
            </div>
            <div style={{ borderLeft: '1px solid var(--surface-border)', height: '1.5rem' }} />
            <div>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setSummaryVisible(true)
                }}
                style={{
                  color: 'var(--primary-color)',
                  textDecoration: 'none',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                <i className="pi pi-chart-bar" style={{ marginRight: '0.5rem', fontSize: '0.9rem' }} />
                View Summary
              </a>
            </div>
          </div>
        </div>
      )}

      <Dialog
        header="About"
        visible={aboutVisible}
        style={{ width: '50vw', minWidth: '400px' }}
        onHide={() => { if (!aboutVisible) return; setAboutVisible(false); }}
      >
        <p className="m-0">
          This playground compares token efficiency across JSON (pretty and compact), YAML, and{' '}
          <a
            href="https://toonformat.dev"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500 }}
          >
            TOON
          </a>
          {' '}formats.
        </p>

        <p>
          Real talk: <strong>Compact JSON</strong> brings nearly the same token savings as TOON,
          and it's a format LLMs are already trained to understand. TOON is a fad.
        </p>

        <p>
          If social media "experts" are hyping exotic formats while ignoring the simplicity
          of JSON compact, they're talking out their ass. Test it yourself—the data doesn't lie.
        </p>

        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1rem',
          fontSize: '0.875rem',
          color: 'var(--text-color-secondary)'
        }}>
          <p style={{ marginBottom: '0.75rem' }}>
            <strong>Built with:</strong>{' '}
            <a
              href="https://primereact.org/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--primary-color)', textDecoration: 'none' }}
            >
              PrimeReact
            </a>
            ,{' '}
            <a
              href="https://www.npmjs.com/package/@toon-format/toon"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--primary-color)', textDecoration: 'none' }}
            >
              @toon-format/toon
            </a>
            ,{' '}
            <a
              href="https://www.npmjs.com/package/gpt-tokenizer"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--primary-color)', textDecoration: 'none' }}
            >
              gpt-tokenizer
            </a>
            , and{' '}
            <a
              href="https://www.npmjs.com/package/js-yaml"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--primary-color)', textDecoration: 'none' }}
            >
              js-yaml
            </a>
          </p>
          <p className="m-0">
            Built by{' '}
            <a
              href="https://www.linkedin.com/in/andrewjmorgan/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500 }}
            >
              Andrew Morgan
            </a>
            , AI Engineer at{' '}
            <a
              href="https://airia.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500 }}
            >
              Airia
            </a>
            {' '}— Enterprise AI
          </p>
        </div>
      </Dialog>

      {/* Summary Modal with Bar Chart */}
      <Dialog
        header="Token Count Comparison"
        visible={summaryVisible}
        style={{ width: '60vw', minWidth: '400px' }}
        onHide={() => { if (!summaryVisible) return; setSummaryVisible(false); }}
      >
        <div style={{ padding: '1rem 0' }}>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-color-secondary)' }}>
            Comparison of token counts across different serialization formats. Lower token counts mean lower API costs and faster processing.
          </p>

          {(() => {
            const maxTokens = Math.max(tokenStats.json, tokenStats.jsonCompact, tokenStats.toon, tokenStats.yaml)
            const barHeight = 40
            const gap = 20

            const formats = [
              { name: 'JSON (Pretty)', count: tokenStats.json, color: 'var(--gray-500)', baseline: true },
              { name: 'JSON (Compact)', count: tokenStats.jsonCompact, color: 'var(--orange-500)' },
              { name: 'TOON', count: tokenStats.toon, color: 'var(--green-500)' },
              { name: 'YAML', count: tokenStats.yaml, color: 'var(--blue-500)' }
            ].sort((a, b) => b.count - a.count)

            return (
              <div style={{ width: '100%' }}>
                {formats.map((format) => {
                  const percentage = (format.count / maxTokens) * 100
                  const saved = format.baseline ? 0 : ((tokenStats.json - format.count) / tokenStats.json * 100)

                  return (
                    <div key={format.name} style={{ marginBottom: gap + 'px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{format.name}</span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-color-secondary)' }}>
                          {format.count} tokens
                          {!format.baseline && (
                            <span style={{
                              marginLeft: '0.5rem',
                              color: saved >= 0 ? 'var(--green-600)' : 'var(--red-600)',
                              fontWeight: 500
                            }}>
                              {saved >= 0 ? `−${saved.toFixed(1)}%` : `+${Math.abs(saved).toFixed(1)}%`}
                            </span>
                          )}
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: barHeight + 'px',
                        backgroundColor: 'var(--surface-ground)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <div style={{
                          width: percentage + '%',
                          height: '100%',
                          backgroundColor: format.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          paddingRight: '0.75rem',
                          transition: 'width 0.3s ease',
                          minWidth: format.count > 0 ? '40px' : '0'
                        }}>
                          <span style={{
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                          }}>
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </div>
      </Dialog>
    </div>
  )
}

export default App
