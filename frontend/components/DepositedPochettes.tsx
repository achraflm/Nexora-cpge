'use client'

import { FolderClosed } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { studyWorkKinds, workFolderUrl, workTitle, type StudyWorkFolder } from '@/lib/study-work'

export function DepositedPochettes({ search }: { search: string }) {
  const [folders, setFolders] = useState<StudyWorkFolder[]>([])
  const [error, setError] = useState(false)
  useEffect(() => {
    const request = new AbortController()
    fetch('/api/study-work', { signal: request.signal, cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error()
        setFolders(await response.json() as StudyWorkFolder[])
      })
      .catch(() => { if (!request.signal.aborted) setError(true) })
    return () => request.abort()
  }, [])
  const query = search.trim().toLocaleLowerCase('fr')
  const visible = folders.filter(folder => workTitle(folder).toLocaleLowerCase('fr').includes(query))

  if (error) return <p role="status" className="mb-6 text-sm text-slate-600 dark:text-slate-300">Les copies déposées sont momentanément indisponibles.</p>
  if (!visible.length) return null
  return <section className="mb-8 space-y-3" aria-label="Copies déposées">
    <h2 className="text-lg font-bold">Copies déposées</h2>
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map(folder => <li key={folder.kind + ':' + folder.resourceId}>
        <Link href={workFolderUrl(folder)} className="flex h-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-500 dark:border-white/15 dark:bg-slate-900 dark:hover:border-indigo-400">
          <FolderClosed size={22} className="shrink-0 text-indigo-600 dark:text-indigo-300" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block font-semibold">{workTitle(folder)}</span>
            <span className="text-sm text-slate-600 dark:text-slate-400">{studyWorkKinds[folder.kind]} · {folder.hasLatex ? 'Transcription disponible' : 'Photo enregistrée'}</span>
          </span>
        </Link>
      </li>)}
    </ul>
  </section>
}
