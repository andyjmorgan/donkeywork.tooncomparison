import { Button } from 'primereact/button'
import donkeyworkLogo from '../assets/donkeywork.png'

interface HeaderProps {
  darkMode: boolean
  onToggleTheme: () => void
  onShowAbout: () => void
}

export function Header({ darkMode, onToggleTheme, onShowAbout }: HeaderProps) {
  return (
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
          onClick={onToggleTheme}
          text
          aria-label="Toggle theme"
          tooltip="Theme"
          tooltipOptions={{ position: 'bottom' }}
        />
        <Button
          icon="pi pi-github"
          onClick={() => window.open('https://github.com/andyjmorgan/donkeywork.tooncomparison', '_blank')}
          text
          aria-label="GitHub"
          tooltip="GitHub"
          tooltipOptions={{ position: 'bottom' }}
        />
        <Button
          icon="pi pi-info-circle"
          onClick={onShowAbout}
          text
          aria-label="About"
          tooltip="About"
          tooltipOptions={{ position: 'bottom' }}
        />
      </div>
    </div>
  )
}
