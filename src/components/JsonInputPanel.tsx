import { InputTextarea } from 'primereact/inputtextarea'
import { Button } from 'primereact/button'

interface JsonInputPanelProps {
  value: string
  onChange: (value: string) => void
  error: string
  onLoadSimple: () => void
  onLoadAdvanced: () => void
  onFormat: () => void
}

export function JsonInputPanel({
  value,
  onChange,
  error,
  onLoadSimple,
  onLoadAdvanced,
  onFormat
}: JsonInputPanelProps) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--border-radius)', padding: '1rem', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0 }}>JSON Input</h3>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <Button
            label="Simple"
            text
            size="small"
            onClick={onLoadSimple}
            tooltip="Load simple example"
            tooltipOptions={{ position: 'top' }}
          />
          <Button
            label="Advanced"
            text
            size="small"
            onClick={onLoadAdvanced}
            tooltip="Load advanced example"
            tooltipOptions={{ position: 'top' }}
          />
          <div style={{ borderLeft: '1px solid var(--surface-border)', height: '1.5rem', margin: '0 0.25rem' }} />
          <Button
            icon="pi pi-align-justify"
            text
            onClick={onFormat}
            disabled={!value.trim() || !!error}
            tooltip="Format"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>
      <InputTextarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
  )
}
