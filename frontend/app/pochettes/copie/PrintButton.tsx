'use client'

import { Printer } from 'lucide-react'

export function PrintButton() {
  return <button type="button" className="ui-button-secondary" onClick={() => window.print()}>
    <Printer size={16} aria-hidden="true" /> Imprimer ou enregistrer en PDF
  </button>
}
