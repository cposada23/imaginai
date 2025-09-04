import {
  DB_NAME,
  DB_VERSION,
  OBJECT_STORES,
  STORE_PROMPT_JOBS,
  STORE_GENERATED_IMAGES,
  INDEX_STATUS,
  INDEX_CREATED_AT,
  INDEX_UPDATED_AT,
  INDEX_JOB_ID,
} from "@/lib/storage/types";
import type {
  PromptJob,
  GeneratedImage,
  JobStatus,
} from "@/lib/storage/types";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function getIndexedDB(): IDBFactory | undefined {
  if (!isBrowser()) return undefined;
  const w = window as unknown as {
    indexedDB?: IDBFactory;
    mozIndexedDB?: IDBFactory;
    webkitIndexedDB?: IDBFactory;
    msIndexedDB?: IDBFactory;
  };
  return (
    w.indexedDB || w.mozIndexedDB || w.webkitIndexedDB || w.msIndexedDB || undefined
  );
}

// NOTE: Store/index creation is handled in openDatabase onupgradeneeded

export async function openDatabase(): Promise<IDBDatabase> {
  const idb = getIndexedDB();
  if (!idb) throw new Error("IndexedDB is not available in this environment");

  return new Promise((resolve, reject) => {
    const request = idb.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      // During upgrade, a versionchange transaction is available via request.transaction
      // We must create stores and indexes here.
      for (const def of OBJECT_STORES) {
        if (!db.objectStoreNames.contains(def.name)) {
          const store = db.createObjectStore(def.name, { keyPath: def.keyPath });
          for (const indexName of def.indexes) {
            store.createIndex(indexName, indexName, { unique: false });
          }
        } else {
          const tx = request.transaction;
          if (tx) {
            const store = tx.objectStore(def.name);
            for (const indexName of def.indexes) {
              if (!store.indexNames.contains(indexName)) {
                store.createIndex(indexName, indexName, { unique: false });
              }
            }
          }
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => {
      reject(new Error("IndexedDB upgrade is blocked. Please close other tabs."));
    };
  });
}

export async function withDatabase<T>(
  fn: (db: IDBDatabase) => Promise<T> | T
): Promise<T> {
  const db = await openDatabase();
  try {
    const result = await fn(db);
    return result;
  } finally {
    // Ensure the database is closed after operation to free resources
    db.close();
  }
}

export async function deleteDatabase(): Promise<void> {
  const idb = getIndexedDB();
  if (!idb) return;
  await new Promise<void>((resolve, reject) => {
    const request = idb.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(new Error("Delete blocked. Close other tabs using this site."));
  });
}

export async function getDatabaseInfo(): Promise<{
  stores: Array<{ name: string; indexes: string[] }>;
}> {
  return withDatabase(async (db) => {
    const stores: Array<{ name: string; indexes: string[] }> = [];
    for (let i = 0; i < db.objectStoreNames.length; i++) {
      const name = db.objectStoreNames.item(i)!;
      const tx = db.transaction(name, "readonly");
      const store = tx.objectStore(name);
      const indexNames: string[] = [];
      for (let j = 0; j < store.indexNames.length; j++) {
        const idx = store.indexNames.item(j)!;
        indexNames.push(idx);
      }
      stores.push({ name, indexes: indexNames });
      tx.commit?.();
    }
    return { stores };
  });
}

// ------------------------------
// Generic helpers
// ------------------------------

function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getObjectStore(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode
): Promise<IDBObjectStore> {
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

export async function getById<T = unknown>(
  storeName: string,
  id: IDBValidKey
): Promise<T | undefined> {
  return withDatabase(async (db) => {
    const store = await getObjectStore(db, storeName, "readonly");
    const req = store.get(id);
    const result = await promisifyRequest<T | undefined>(req);
    return result ?? undefined;
  });
}

export async function putValue<T = unknown>(
  storeName: string,
  value: T
): Promise<IDBValidKey> {
  return withDatabase(async (db) => {
    const store = await getObjectStore(db, storeName, "readwrite");
    const req = store.put(value as unknown as Record<string, unknown>);
    const key = await promisifyRequest<IDBValidKey>(req);
    return key;
  });
}

export async function deleteById(
  storeName: string,
  id: IDBValidKey
): Promise<void> {
  return withDatabase(async (db) => {
    const store = await getObjectStore(db, storeName, "readwrite");
    const req = store.delete(id);
    await promisifyRequest(req);
  });
}

export async function getAll<T = unknown>(storeName: string): Promise<T[]> {
  return withDatabase(async (db) => {
    const store = await getObjectStore(db, storeName, "readonly");
    const req = store.getAll();
    const result = await promisifyRequest<T[]>(req);
    return result ?? [];
  });
}

export async function getAllByIndex<T = unknown>(
  storeName: string,
  indexName: string,
  value: IDBValidKey | IDBKeyRange
): Promise<T[]> {
  return withDatabase(async (db) => {
    const store = await getObjectStore(db, storeName, "readonly");
    const index = store.index(indexName);
    const req = index.getAll(value);
    const result = await promisifyRequest<T[]>(req);
    return result ?? [];
  });
}

// ------------------------------
// Typed model wrappers: PromptJob
// ------------------------------

export async function savePromptJob(job: PromptJob): Promise<string> {
  const key = await putValue<PromptJob>(STORE_PROMPT_JOBS, job);
  return String(key);
}

export function getPromptJob(id: string): Promise<PromptJob | undefined> {
  return getById<PromptJob>(STORE_PROMPT_JOBS, id);
}

export function deletePromptJob(id: string): Promise<void> {
  return deleteById(STORE_PROMPT_JOBS, id);
}

export function getPromptJobsByStatus(
  status: JobStatus
): Promise<PromptJob[]> {
  const keyRange = IDBKeyRange.only(status);
  return getAllByIndex<PromptJob>(STORE_PROMPT_JOBS, INDEX_STATUS, keyRange);
}

export function getAllPromptJobs(): Promise<PromptJob[]> {
  return getAll<PromptJob>(STORE_PROMPT_JOBS);
}

// ------------------------------
// Typed model wrappers: GeneratedImage
// ------------------------------

export async function saveGeneratedImage(
  image: GeneratedImage
): Promise<string> {
  const key = await putValue<GeneratedImage>(STORE_GENERATED_IMAGES, image);
  return String(key);
}

export function getGeneratedImage(
  id: string
): Promise<GeneratedImage | undefined> {
  return getById<GeneratedImage>(STORE_GENERATED_IMAGES, id);
}

export function deleteGeneratedImage(id: string): Promise<void> {
  return deleteById(STORE_GENERATED_IMAGES, id);
}

export function getGeneratedImagesByJobId(jobId: string): Promise<GeneratedImage[]> {
  const keyRange = IDBKeyRange.only(jobId);
  return getAllByIndex<GeneratedImage>(
    STORE_GENERATED_IMAGES,
    INDEX_JOB_ID,
    keyRange
  );
}

// ------------------------------
// Image retrieval and storage monitoring helpers
// ------------------------------

export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
  ratio: number;
}> {
  if (!isBrowser() || !("storage" in navigator) || !navigator.storage.estimate) {
    return { usage: 0, quota: 0, ratio: 0 };
  }
  const { usage = 0, quota = 0 } = await navigator.storage.estimate();
  const ratio = quota ? usage / quota : 0;
  return { usage, quota, ratio };
}

export async function isNearQuota(threshold = 0.9): Promise<boolean> {
  const { ratio } = await getStorageEstimate();
  return ratio >= threshold;
}

export async function getRecentGeneratedImages(
  limit = 50
): Promise<GeneratedImage[]> {
  return withDatabase(async (db) => {
    const tx = db.transaction(STORE_GENERATED_IMAGES, "readonly");
    const store = tx.objectStore(STORE_GENERATED_IMAGES);
    const index = store.index(INDEX_CREATED_AT);

    const results: GeneratedImage[] = [];
    return await new Promise<GeneratedImage[]>((resolve, reject) => {
      // Open cursor in descending order by createdAt
      const cursorRequest = index.openCursor(null, "prev");

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (!cursor || results.length >= limit) {
          tx.commit?.();
          resolve(results);
          return;
        }
        results.push(cursor.value as GeneratedImage);
        cursor.continue();
      };
      cursorRequest.onerror = () => reject(cursorRequest.error);
    });
  });
}

export { isBrowser, getIndexedDB };

// ------------------------------
// Export / Import utilities
// ------------------------------

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function base64ToBlob(dataUrl: string): Promise<Blob> {
  // data URL expected (from readAsDataURL): "data:mime;base64,...."
  const [meta, b64] = dataUrl.split(",");
  const mimeMatch = /^data:(.*?);base64$/.exec(meta || "");
  const mime = mimeMatch?.[1] || "application/octet-stream";
  const binary = atob(b64 || "");
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function exportAllData(): Promise<{
  promptJobs: PromptJob[];
  generatedImages: Array<Omit<GeneratedImage, "blob"> & { blobBase64: string }>;
}> {
  const [jobs, images] = await Promise.all([
    getAll<PromptJob>(STORE_PROMPT_JOBS),
    getAll<GeneratedImage>(STORE_GENERATED_IMAGES),
  ]);

  const transformed = await Promise.all(
    images.map(async (img) => {
      const { blob, ...rest } = img;
      const blobBase64 = await blobToBase64(blob);
      return { ...rest, blobBase64 };
    })
  );

  return { promptJobs: jobs, generatedImages: transformed };
}

export async function importAllData(payload: {
  promptJobs?: PromptJob[];
  generatedImages?: Array<Omit<GeneratedImage, "blob"> & { blobBase64: string }>;
}): Promise<{ importedJobs: number; importedImages: number }> {
  const imported = { importedJobs: 0, importedImages: 0 };

  const jobs = payload.promptJobs || [];
  for (const job of jobs) {
    try {
      await putValue<PromptJob>(STORE_PROMPT_JOBS, job);
      imported.importedJobs++;
    } catch {
      // quota or other error; skip
    }
  }

  const images = payload.generatedImages || [];
  for (const img of images) {
    try {
      const { blobBase64, ...rest } = img;
      const blob = await base64ToBlob(blobBase64);
      await putValue<GeneratedImage>(STORE_GENERATED_IMAGES, {
        ...(rest as unknown as Omit<GeneratedImage, "blob">),
        blob,
      } as GeneratedImage);
      imported.importedImages++;
    } catch {
      // quota or other error; skip
    }
  }

  return imported;
}


