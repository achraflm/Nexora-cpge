import type { LatexTranscription } from './image-to-latex'

export type PochetteAttachment = {
  id: string
  userId: string
  pageId: string
  file: File
  kind: 'pdf' | 'image'
  transcription?: LatexTranscription
}

let opening: Promise<IDBDatabase> | undefined

function database() {
  if (!opening) opening = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('nexora-pochettes', 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore('workspaces')
      request.result.createObjectStore('attachments', { keyPath: 'id' })
        .createIndex('page', ['userId', 'pageId'])
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  }).catch(error => {
    opening = undefined
    throw error
  })
  return opening
}

function read<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function write(store: 'workspaces' | 'attachments', value: unknown, key?: IDBValidKey) {
  const db = await database()
  const transaction = db.transaction(store, 'readwrite')
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onabort = () => reject(transaction.error)
    transaction.objectStore(store).put(value, key)
  })
}

export async function loadPochetteWorkspace<T>(userId: string): Promise<T | undefined> {
  const db = await database()
  return read(db.transaction('workspaces').objectStore('workspaces').get(userId))
}

export function savePochetteWorkspace(userId: string, workspace: unknown) {
  return write('workspaces', workspace, userId)
}

export async function loadPochetteAttachments(userId: string, pageId: string): Promise<PochetteAttachment[]> {
  const db = await database()
  return read(db.transaction('attachments').objectStore('attachments').index('page').getAll([userId, pageId]))
}

export function savePochetteAttachment(attachment: PochetteAttachment) {
  return write('attachments', attachment)
}
