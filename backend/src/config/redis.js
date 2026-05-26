// In-memory cache fallback (no Redis required for local dev)
const cache = new Map();

const set = async (key, value, ttlSeconds) => {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  cache.set(key, { value: serialized, expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null });
};

const get = async (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt && Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  try { return JSON.parse(entry.value); } catch { return entry.value; }
};

const del = async (key) => { cache.delete(key); };

module.exports = { set, get, del };
