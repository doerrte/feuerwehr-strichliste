type AttemptData = {
  attempts: number;
  lastAttempt: number;
};

const attempts = new Map<string, AttemptData>();

const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 60 * 1000; // 60 Sekunden

export function checkLoginAttempt(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry) {
    return {
      allowed: true,
      attempts: 0,
      requireCaptcha: false,
      remaining: 0,
    };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    const diff = now - entry.lastAttempt;

    if (diff < BLOCK_TIME) {
      return {
        allowed: false,
        attempts: entry.attempts,
        requireCaptcha: true,
        remaining: Math.ceil((BLOCK_TIME - diff) / 1000),
      };
    }

    attempts.delete(key);
    return {
      allowed: true,
      attempts: 0,
      requireCaptcha: false,
      remaining: 0,
    };
  }

  return {
    allowed: true,
    attempts: entry.attempts,
    requireCaptcha: entry.attempts >= 3,
    remaining: 0,
  };
}

export function addLoginAttempt(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry) {
    attempts.set(key, {
      attempts: 1,
      lastAttempt: now,
    });
    return;
  }

  entry.attempts += 1;
  entry.lastAttempt = now;
  attempts.set(key, entry);
}

export function resetLoginAttempts(key: string) {
  attempts.delete(key);
}
