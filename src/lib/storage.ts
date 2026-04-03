const STORAGE_VERSION = 1;

interface StorageEnvelope<T> {
  version: number;
  data: T;
}

export function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const envelope = JSON.parse(raw) as StorageEnvelope<T>;
    if (envelope.version !== STORAGE_VERSION) {
      console.warn(`Storage version mismatch for "${key}": expected ${STORAGE_VERSION}, got ${envelope.version}. Resetting.`);
      return fallback;
    }
    return envelope.data;
  } catch (e) {
    console.warn(`Storage parse failed for "${key}"`, e);
    return fallback;
  }
}

export function safeSave<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, data }));
  } catch (e) {
    console.warn(`Storage save failed for "${key}"`, {
      error: e,
      size: JSON.stringify(data).length,
    });
  }
}
