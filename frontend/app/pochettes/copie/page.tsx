import Link from 'next/link'
import { notFound } from 'next/navigation'
import { StudyWorkRender } from '@/components/StudyWorkRender'
import { StudyWorkDeposit } from '@/components/StudyWorkDeposit'
import { gateway, requireSession } from '@/lib/server-auth'
import { studyWorkKinds, workApiUrl, workImageName, workTitle, type StudyWork } from '@/lib/study-work'
import { compileStudyWork, isCompleteStudyWork } from '@/lib/study-work-latex'
import { PrintButton } from './PrintButton'

export default async function Page({ searchParams }: {
  searchParams: Promise<{ kind?: string; resourceId?: string }>
}) {
  const session = await requireSession()
  const { kind, resourceId } = await searchParams
  if (!kind || !Object.hasOwn(studyWorkKinds, kind) || typeof resourceId !== 'string' || !resourceId.trim() || resourceId.length > 500) notFound()
  const query = new URLSearchParams({ kind, resourceId }).toString()
  const response = await gateway('/exams/study-work?' + query, { headers: { Authorization: `Bearer ${session.accessToken}` } }).catch(() => null)
  if (!response?.ok) return <main className="mx-auto max-w-4xl space-y-4 p-6">
    <Link href="/pochettes" className="ui-button-secondary">Mes pochettes</Link>
    <p role="status">La copie est momentanément indisponible.</p>
  </main>
  const work = await response.json() as StudyWork | null
  if (!work) notFound()
  const url = workApiUrl(work)
  const imageName = workImageName(work)
  const photo = url + '&file=photo'
  const latex = work.latex
  const rendering = latex ? compileStudyWork(latex) : undefined
  const complete = rendering ? isCompleteStudyWork(latex, work.transcriptionStatus, rendering) : false

  return <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-8 print:max-w-none print:p-0 print:text-black">
    <Link href="/pochettes" className="ui-button-secondary print:hidden">Toutes mes pochettes</Link>
    <header>
      <p className="mb-1 text-sm font-semibold text-indigo-600 dark:text-indigo-300 print:text-black">{workTitle({ ...work, title: null })}</p>
      <h1 className="text-2xl font-bold sm:text-3xl">{workTitle(work)}</h1>
    </header>
    <nav aria-label="Fichiers de la pochette" className="flex flex-wrap gap-2 print:hidden">
      {imageName && !complete && <a href={photo} download={imageName} className="ui-button-secondary">Photo de la copie</a>}
      {imageName && !complete && <StudyWorkDeposit kind={work.kind} resourceId={work.resourceId} title={workTitle(work)} inFolder
        actionLabel={latex ? 'Corriger la transcription' : 'Transcrire la photo'} />}
      {latex && <a href={url + '&file=latex'} className="ui-button-secondary">Source LaTeX (.tex)</a>}
      {rendering?.valid && <PrintButton />}
    </nav>
    <article className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/15 dark:bg-slate-900 sm:p-6 print:border-0 print:bg-white print:p-0 [&_*]:print:text-black">
      {rendering && <>
        <h2 className="text-lg font-semibold">Copie mise en page</h2>
        {!complete && <p role="status" className="text-sm text-amber-800 dark:text-amber-200 print:hidden">
          {rendering.valid ? 'Vérifiez les passages incertains avant de valider la transcription.' : 'Certaines formules n’ont pas pu être mises en page. Corrigez le LaTeX ou relancez la lecture.'}
        </p>}
        <StudyWorkRender rendering={rendering} />
      </>}
      {imageName && !complete && <figure className={latex ? 'space-y-2 border-t border-slate-200 pt-4 print:hidden' : 'space-y-2 print:hidden'}>
        <figcaption className="text-sm font-semibold">Photo de la copie</figcaption>
        {/* The image is private and goes through an authenticated route. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="Photo déposée, avec les schémas dessinés sur la copie" className="max-h-[75vh] max-w-full object-contain print:max-h-[90vh]" />
      </figure>}
    </article>
  </main>
}
