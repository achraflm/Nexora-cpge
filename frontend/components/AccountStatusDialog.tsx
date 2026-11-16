'use client'

import { useEffect, useId, useRef } from 'react'

export function AccountStatusDialog({ name, activate, busy, error, onCancel, onConfirm }: {
  name?: string
  activate?: boolean
  busy: boolean
  error: string
  onCancel: () => void
  onConfirm: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  return (
    <dialog ref={ref} className="ui-confirm-dialog" aria-labelledby={titleId} aria-describedby={descriptionId}
      onCancel={event => { event.preventDefault(); if (!busy) onCancel() }}>
      <h2 id={titleId}>{activate ? 'Réactiver' : 'Désactiver'} {name ? `le compte de ${name}` : 'mon compte'} ?</h2>
      <p id={descriptionId}>{activate ? 'La personne pourra se connecter à nouveau.' : name
        ? 'Les sessions seront fermées immédiatement. Les données du compte seront conservées.'
        : 'Vous serez déconnecté de tous vos appareils. Vos données seront conservées et un administrateur pourra réactiver votre compte.'}</p>
      {error && <p role="alert" className="text-rose-600 dark:text-rose-300">{error}</p>}
      <div className="ui-form-actions">
        <button type="button" className="ui-button-secondary" disabled={busy} onClick={onCancel} autoFocus>Annuler</button>
        <button type="button" className={activate ? 'ui-button-primary' : 'ui-button-danger'} disabled={busy} onClick={onConfirm}>
          {activate ? 'Réactiver le compte' : 'Désactiver le compte'}
        </button>
      </div>
    </dialog>
  )
}
