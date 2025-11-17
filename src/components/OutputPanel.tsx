import { Button } from 'primereact/button'
import { InputSwitch } from 'primereact/inputswitch'
import { TokenDisplay } from './TokenDisplay'

interface OutputPanelProps {
  title: string
  titleColor?: string
  output: string
  darkMode: boolean
  onCopy: () => void
  severity?: 'secondary' | 'success' | 'info' | 'warning'
  showCompactToggle?: boolean
  isCompact?: boolean
  onToggleCompact?: (value: boolean) => void
  disabled?: boolean
}

export function OutputPanel({
  title,
  titleColor,
  output,
  darkMode,
  onCopy,
  severity = 'secondary',
  showCompactToggle = false,
  isCompact = false,
  onToggleCompact,
  disabled = false
}: OutputPanelProps) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--border-radius)', padding: '1rem', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, color: titleColor }}>
          {title}
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {showCompactToggle && onToggleCompact && (
            <>
              <label htmlFor="format-switch" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                {isCompact ? 'Compact' : 'Pretty'}
              </label>
              <InputSwitch
                inputId="format-switch"
                checked={isCompact}
                onChange={(e) => onToggleCompact(e.value)}
                disabled={disabled}
              />
              <div style={{ borderLeft: '1px solid var(--surface-border)', height: '1.5rem', marginLeft: '0.25rem', marginRight: '0.25rem' }} />
            </>
          )}
          <Button
            icon="pi pi-copy"
            severity={severity}
            text
            onClick={onCopy}
            disabled={!output}
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
        backgroundColor: 'var(--surface-ground)',
        padding: '1rem'
      }}>
        {output ? (
          <TokenDisplay text={output} darkMode={darkMode} />
        ) : (
          <pre style={{
            margin: 0,
            fontFamily: 'monospace',
            fontSize: '12px',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            color: 'var(--text-color-secondary)'
          }}>
            Enter valid JSON to see {title.toLowerCase()} output
          </pre>
        )}
      </div>
    </div>
  )
}
