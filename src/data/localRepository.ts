import type { AppData } from '../types/models'
import { appDataSchema } from './schema'
import { createEmptyData } from './initialData'

const databaseName = 'plandesk-local'
const storeName = 'snapshots'
const snapshotKey = 'current'
const databaseVersion = 1

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName)
      }
    }

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
) {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(storeName, mode)
        const store = transaction.objectStore(storeName)
        const request = operation(store)

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)
        transaction.oncomplete = () => db.close()
        transaction.onerror = () => {
          db.close()
          reject(transaction.error)
        }
      }),
  )
}

export async function readAppData() {
  if (!('indexedDB' in window)) {
    return createEmptyData()
  }

  const stored = await runTransaction<AppData | undefined>('readonly', (store) =>
    store.get(snapshotKey),
  )

  if (!stored) {
    const empty = createEmptyData()
    await saveAppData(empty)
    return empty
  }

  return appDataSchema.parse(stored)
}

export async function saveAppData(data: AppData) {
  if (!('indexedDB' in window)) {
    return
  }

  const normalized = appDataSchema.parse(data)
  await runTransaction<IDBValidKey>('readwrite', (store) => store.put(normalized, snapshotKey))
}

export function validateImportedData(input: unknown) {
  return appDataSchema.parse(input)
}
