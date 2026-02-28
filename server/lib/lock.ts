const locks = new Map<string, number>();

export function acquireLock(key: string, ttlMs = 30000): boolean {
  const now = Date.now();
  const expiry = locks.get(key);
  if (expiry && expiry > now) {
    return false;
  }
  locks.set(key, now + ttlMs);
  return true;
}

export function releaseLock(key: string) {
  locks.delete(key);
}
