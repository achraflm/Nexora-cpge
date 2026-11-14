'use client'

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-xl px-6 py-24 text-slate-900 dark:text-white">
    <h1 className="text-2xl font-bold">Connexion au service interrompue</h1>
    <p className="my-5">La page n’a pas pu charger vos données. Vérifiez que les services locaux sont démarrés, puis réessayez.</p>
    <button onClick={reset} className="ui-button-primary">Réessayer</button>
  </main>
}
