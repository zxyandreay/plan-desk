import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'
import { colorLabels, colorTokens, type ColorToken } from '../../types/colors'
import { colorClass, resolveColorToken } from '../../utils/colors'

interface ColorSelectorProps {
  label?: string
  value?: ColorToken
  onChange: (color: ColorToken) => void
  hint?: string
}

export function ColorSelector({
  label = 'Color',
  value,
  onChange,
  hint,
}: ColorSelectorProps) {
  const selected = resolveColorToken(value)

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-[color:var(--pd-foreground)]">{label}</legend>
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
        {colorTokens.map((color) => {
          const active = selected === color
          return (
            <button
              key={color}
              type="button"
              aria-label={`${colorLabels[color]} color`}
              aria-pressed={active}
              title={colorLabels[color]}
              onClick={() => onChange(color)}
              className={cn(
                'pd-color-swatch',
                colorClass(color),
                active ? 'pd-color-swatch-active' : '',
              )}
            >
              <span className="pd-color-swatch-dot" />
              {active ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
            </button>
          )
        })}
      </div>
      {hint ? <p className="text-xs text-[color:var(--pd-muted-foreground)]">{hint}</p> : null}
    </fieldset>
  )
}
