import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Primary action label. Defaults to "Confirm" */
  confirmLabel?: string
  /** Whether the confirm action is destructive (red styling) */
  destructive?: boolean
  /** Whether the confirm action is loading */
  loading?: boolean
  /** Whether the confirm button is disabled */
  disabled?: boolean
  onConfirm?: () => void
  /** Hide the cancel button */
  hideCancel?: boolean
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  confirmLabel = 'Confirm',
  destructive = false,
  loading = false,
  disabled = false,
  onConfirm,
  hideCancel = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)

  // Focus trap + auto-focus confirm button
  useEffect(() => {
    if (open) {
      // Small delay so the animation starts before focus moves
      const id = setTimeout(() => confirmRef.current?.focus(), 50)
      return () => clearTimeout(id)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Lock body scroll
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-modal)] animate-scale-in p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost p-1.5 -mr-1.5 rounded-md"
            aria-label="Close dialog"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="text-sm text-text-secondary leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        {(onConfirm || !hideCancel) && (
          <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border">
            {!hideCancel && (
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            )}
            {onConfirm && (
              <button
                ref={confirmRef}
                type="button"
                onClick={onConfirm}
                disabled={disabled || loading}
                className={destructive ? 'btn-danger text-sm' : 'btn-primary text-sm'}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                    </svg>
                    {confirmLabel}…
                  </span>
                ) : (
                  confirmLabel
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
