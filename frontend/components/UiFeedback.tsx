'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { CheckCircle2, Info, X } from 'lucide-react'

export function useUiFeedback() {
  const [message, setMessage] = useState<{ text: string; kind: 'success' | 'info'; id: number } | null>(null)
  const notify = useCallback((text: string, kind: 'success' | 'info' = 'success') => {
    setMessage({ text, kind, id: Date.now() })
  }, [])
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(null), 6000)
    return () => window.clearTimeout(timer)
  }, [message])

  const feedback = (
    <div className="ui-feedback-region" role="status" aria-live="polite" aria-atomic="true">
      {message && (
        <div className={`ui-feedback ui-feedback-${message.kind}`} key={message.id}>
          {message.kind === 'success' ? <CheckCircle2 size={20} aria-hidden="true" /> : <Info size={20} aria-hidden="true" />}
          <p>{message.text}</p>
          <button type="button" aria-label="Fermer la notification" onClick={() => setMessage(null)}><X size={18} /></button>
        </div>
      )}
    </div>
  )
  return { notify, feedback }
}

export function ConfirmRemoval({ title, onCancel, onConfirm }: { title: string; onCancel: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const headingId = useId()
  const descriptionId = useId()
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  return (
    <dialog ref={ref} className="ui-confirm-dialog" aria-labelledby={headingId} aria-describedby={descriptionId} onCancel={onCancel}>
      <p className="ui-eyebrow">Suppression</p>
      <h2 id={headingId}>Supprimer ce contenu ?</h2>
      <p id={descriptionId}>« {title} » sera retiré de la liste.</p>
      <div className="ui-form-actions">
        <button type="button" className="ui-button-secondary" onClick={onCancel} autoFocus>Conserver</button>
        <button type="button" className="ui-button-danger" onClick={onConfirm}>Supprimer</button>
      </div>
    </dialog>
  )
}
