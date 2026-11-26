/**
 * Saved screenings in IndexedDB (S-70), so a screening survives having no network.
 * Later the offline queue sends these to the server; for now they can be listed and
 * exported as JSON.
 */
import type { ScreeningRecord } from "./types";

const DB_NAME = "readerops";
const STORE = "screenings";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveScreening(record: ScreeningRecord): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function listScreenings(): Promise<ScreeningRecord[]> {
  const db = await openDb();
  const records = await new Promise<ScreeningRecord[]>((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result as ScreeningRecord[]);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return records.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

/** Start a download of the given records as a JSON file. */
export function downloadJson(records: ScreeningRecord[], filename: string): void {
  const url = URL.createObjectURL(new Blob([JSON.stringify(records, null, 2)], { type: "application/json" }));
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  link.click();
  URL.revokeObjectURL(url);
}
