import { Dialog } from 'primereact/dialog'

interface AboutDialogProps {
  visible: boolean
  onHide: () => void
}

export function AboutDialog({ visible, onHide }: AboutDialogProps) {
  return (
    <Dialog
      header="About"
      visible={visible}
      style={{ width: '50vw', minWidth: '400px' }}
      onHide={() => { if (!visible) return; onHide(); }}
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
  )
}
