import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'border-[color:var(--pd-primary)] bg-[color:var(--pd-primary)] text-[color:var(--pd-primary-foreground)] hover:border-[color:var(--pd-primary-hover)] hover:bg-[color:var(--pd-primary-hover)]',
  secondary:
    'border-[color:var(--pd-border)] bg-[color:var(--pd-card)] text-[color:var(--pd-foreground)] hover:border-[color:var(--pd-border-strong)] hover:bg-[color:var(--pd-card-hover)]',
  ghost:
    'border-transparent bg-transparent text-[color:var(--pd-muted-foreground)] hover:bg-[color:var(--pd-muted)] hover:text-[color:var(--pd-foreground-strong)]',
  danger:
    'border-[color:var(--pd-destructive)] bg-[color:var(--pd-destructive)] text-[color:var(--pd-destructive-button-foreground)] hover:border-[color:var(--pd-destructive-hover)] hover:bg-[color:var(--pd-destructive-hover)]',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-2.5 text-xs',
  md: 'h-9 px-3 text-sm',
}

export function Button({
  className,
  variant = 'secondary',
  size = 'md',
  icon,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md border font-medium shadow-sm transition active:translate-y-px disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
