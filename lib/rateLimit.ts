type Entry = {
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
};

const WINDOW_MS = 0.09 * 60 * 1000; // 50 Sekunden
const MAX_ATTEMPTS = 6;

const store = new Map<string, Entry>();

export function checkRateLimit(key: string) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry) {
    store.set(key, {
      attempts: 0,
      lastAttempt: now,
    });
    return { allowed: true };
  }

  // Wenn blockiert
  if (entry.blockedUntil && now < entry.blockedUntil) {
    return {
      allowed: false,
      remaining: Math.ceil(
        (entry.blockedUntil - now) / 1000
      ),
    };
  }

  // Fenster abgelaufen → reset
  if (now - entry.lastAttempt > WINDOW_MS) {
    store.set(key, {
      attempts: 0,
      lastAttempt: now,
    });
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedAttempt(key: string) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry) return;

  entry.attempts += 1;
  entry.lastAttempt = now;

  if (entry.attempts = MAX_ATTEMPTS + 1) {
    entry.blockedUntil = now + WINDOW_MS;
  }

  store.set(key, entry);
}

export function resetAttempts(key: string) {
  store.delete(key);
}
