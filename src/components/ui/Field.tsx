import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface FieldShellProps {
  label: string
  children: ReactNode
  hint?: string
}

function FieldShell({ label, children, hint }: FieldShellProps) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium text-[color:var(--pd-foreground)]">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-[color:var(--pd-muted-foreground)]">{hint}</span> : null}
    </label>
  )
}

export function TextField({
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <FieldShell label={label} hint={hint}>
      <input
        className="pd-input h-10 w-full px-3 text-sm"
        {...props}
      />
    </FieldShell>
  )
}

export function TextAreaField({
  label,
  hint,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string }) {
  return (
    <FieldShell label={label} hint={hint}>
      <textarea
        className="pd-input min-h-24 w-full px-3 py-2 text-sm"
        {...props}
      />
    </FieldShell>
  )
}

export function SelectField({
  label,
  hint,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string }) {
  return (
    <FieldShell label={label} hint={hint}>
      <select
        className="pd-input h-10 w-full px-3 text-sm"
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  )
}
