const PREFIX = "imaginai:";
const API_PREFIX = `${PREFIX}api:`;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function isLocalStorageAvailable(): boolean {
  if (!isBrowser()) return false;
  try {
    const key = `${PREFIX}__test__`;
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function k(key: string): string {
  return `${PREFIX}${key}`;
}

export function getItem<T>(key: string): T | undefined {
  if (!isLocalStorageAvailable()) return undefined;
  try {
    const raw = window.localStorage.getItem(k(key));
    if (raw == null) return undefined;
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem(k(key), JSON.stringify(value));
  } catch {
    // ignore quota or serialization errors
  }
}

export function removeItem(key: string): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.removeItem(k(key));
  } catch {
    // ignore
  }
}

// Simple obfuscation (not secure encryption). Discourages casual inspection.
const sessionSalt: number = Math.floor(Math.random() * 256);

function xorString(input: string, salt: number): string {
  const bytes = new TextEncoder().encode(input);
  const xored = bytes.map((b) => b ^ salt);
  return btoa(String.fromCharCode(...xored));
}

function unxorString(input: string, salt: number): string | undefined {
  try {
    const bin = atob(input);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const restored = bytes.map((b) => b ^ salt);
    return new TextDecoder().decode(restored);
  } catch {
    return undefined;
  }
}

export function saveApiKey(service: string, key: string): void {
  if (!isLocalStorageAvailable()) return;
  try {
    const obf = xorString(key, sessionSalt);
    window.localStorage.setItem(`${API_PREFIX}${service}`, obf);
  } catch {
    // ignore
  }
}

export function getApiKey(service: string): string | undefined {
  if (!isLocalStorageAvailable()) return undefined;
  try {
    const obf = window.localStorage.getItem(`${API_PREFIX}${service}`);
    if (!obf) return undefined;
    const plain = unxorString(obf, sessionSalt);
    return plain ?? undefined;
  } catch {
    return undefined;
  }
}

export function removeApiKey(service: string): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.removeItem(`${API_PREFIX}${service}`);
  } catch {
    // ignore
  }
}


