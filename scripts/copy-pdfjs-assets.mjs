// Copie les ressources statiques de pdfjs-dist (worker, polices standard, cMaps, wasm)
// dans public/pdfjs afin que le lecteur Document Studio puisse les charger.
// Exécuté automatiquement après chaque installation (script "postinstall").
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'node_modules', 'pdfjs-dist')
const DEST = path.join(ROOT, 'public', 'pdfjs')

try {
  await fs.access(SRC)
} catch {
  console.warn('[pdfjs] pdfjs-dist introuvable, copie ignorée')
  process.exit(0)
}

await fs.rm(DEST, { recursive: true, force: true })
await fs.mkdir(DEST, { recursive: true })
await fs.copyFile(path.join(SRC, 'build', 'pdf.worker.min.mjs'), path.join(DEST, 'pdf.worker.min.mjs'))
for (const dir of ['cmaps', 'standard_fonts', 'wasm', 'iccs']) {
  try {
    await fs.cp(path.join(SRC, dir), path.join(DEST, dir), { recursive: true })
  } catch {
    /* dossier optionnel selon la version */
  }
}
const { version } = JSON.parse(await fs.readFile(path.join(SRC, 'package.json'), 'utf8'))
await fs.writeFile(path.join(DEST, 'VERSION'), version + '\n')
console.log(`[pdfjs] ressources v${version} copiées dans public/pdfjs`)
