import { Chart } from 'primereact/chart'
import { Dropdown } from 'primereact/dropdown'
import { Skeleton } from 'primereact/skeleton'
import type { ModelInfo, TokenStats } from '../api'

interface TokenChartProps {
  tokenStats: TokenStats
  anthropicModels: ModelInfo[]
  googleModels: ModelInfo[]
  selectedAnthropicModel: string
  selectedGoogleModel: string
  onAnthropicModelChange: (modelId: string) => void
  onGoogleModelChange: (modelId: string) => void
  loadingModels: boolean
  isCountingTokens: boolean
  darkMode: boolean
}

export function TokenChart({
  tokenStats,
  anthropicModels,
  googleModels,
  selectedAnthropicModel,
  selectedGoogleModel,
  onAnthropicModelChange,
  onGoogleModelChange,
  loadingModels,
  isCountingTokens,
  darkMode
}: TokenChartProps) {
  // Calculate averages for each format and sort by average (smallest to largest)
  const formats = [
    { name: 'JSON Pretty', key: 'json' as const },
    { name: 'JSON Compact', key: 'jsonCompact' as const },
    { name: 'TOON', key: 'toon' as const },
    { name: 'YAML', key: 'yaml' as const },
    { name: 'XML', key: 'xml' as const }
  ]

  const formatAverages = formats.map(format => {
    const values = [
      tokenStats.openai[format.key],
      tokenStats.anthropic[format.key],
      tokenStats.google[format.key]
    ].filter(v => v > 0)

    const average = values.length > 0
      ? values.reduce((sum, val) => sum + val, 0) / values.length
      : 0

    return {
      name: format.name,
      key: format.key,
      average
    }
  })

  // Sort by average (smallest to largest)
  const sortedFormats = [...formatAverages].sort((a, b) => a.average - b.average)

  const chartData = {
    labels: sortedFormats.map(f => f.name),
    datasets: [
      {
        label: 'OpenAI (o200k)',
        data: sortedFormats.map(f => tokenStats.openai[f.key]),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      },
      {
        label: selectedAnthropicModel ? `Anthropic (${selectedAnthropicModel})` : 'Anthropic',
        data: sortedFormats.map(f => tokenStats.anthropic[f.key]),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
      },
      {
        label: selectedGoogleModel ? `Google (${selectedGoogleModel})` : 'Google',
        data: sortedFormats.map(f => tokenStats.google[f.key]),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
      }
    ]
  }

  const textColor = darkMode ? '#e0e0e0' : '#495057'
  const gridColor = darkMode ? '#3f3f46' : '#dee2e6'

  const chartOptions = {
    indexAxis: 'y' as const,
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: textColor
        }
      },
      title: {
        display: true,
        text: 'Token Count Comparison',
        color: textColor
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: textColor
        },
        grid: {
          color: gridColor
        }
      },
      y: {
        ticks: {
          color: textColor
        },
        grid: {
          color: gridColor
        }
      }
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: 0, marginBottom: '0.75rem' }}>Token Count Comparison</h3>

      {/* Model Pickers */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label htmlFor="anthropic-model" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
            Anthropic Model
          </label>
          {loadingModels ? (
            <Skeleton height="2.5rem" />
          ) : (
            <Dropdown
              inputId="anthropic-model"
              value={selectedAnthropicModel}
              options={anthropicModels}
              onChange={(e) => onAnthropicModelChange(e.value)}
              optionLabel="display_name"
              optionValue="id"
              placeholder="Select a model"
              style={{ width: '100%' }}
              disabled={anthropicModels.length === 0}
            />
          )}
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label htmlFor="google-model" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
            Google Model
          </label>
          {loadingModels ? (
            <Skeleton height="2.5rem" />
          ) : (
            <Dropdown
              inputId="google-model"
              value={selectedGoogleModel}
              options={googleModels}
              onChange={(e) => onGoogleModelChange(e.value)}
              optionLabel="display_name"
              optionValue="id"
              placeholder="Select a model"
              style={{ width: '100%' }}
              disabled={googleModels.length === 0}
            />
          )}
        </div>
      </div>

      {/* Chart */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {isCountingTokens ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'center' }}>
            <Skeleton height="2rem" />
            <Skeleton height="2rem" />
            <Skeleton height="2rem" />
            <Skeleton height="2rem" />
            <Skeleton height="2rem" />
          </div>
        ) : (
          <Chart type="bar" data={chartData} options={chartOptions} style={{ height: '100%' }} />
        )}
      </div>
    </div>
  )
}
