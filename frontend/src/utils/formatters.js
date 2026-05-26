export const fmtNumber = (n) => (n ?? 0).toLocaleString();

export const fmtDuration = (ms) => {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const fmtMinutes = (min) => {
  if (!min) return '0h';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}`.trim() : `${m}m`;
};

export const fmtHours = (h) => {
  if (!h) return '0h';
  return h >= 1000 ? `${(h / 1000).toFixed(1)}k h` : `${Math.round(h)}h`;
};

export const fmtDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const fmtRelative = (d) => {
  if (!d) return '';
  // SQLite datetime('now') returns UTC without 'Z'; append it so JS parses correctly
  const ts   = typeof d === 'string' && !d.endsWith('Z') && !d.includes('+') ? d + 'Z' : d;
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60000)          return 'just now';
  if (diff < 3600000)        return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000)       return `${Math.floor(diff / 3600000)}h ago`;
  const days = Math.floor(diff / 86400000);
  if (days === 1) return 'yesterday';
  if (days < 7)  return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

export const fmtRating = (r) => {
  if (!r) return '—';
  return '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));
};

export const truncate = (str, len = 24) =>
  str?.length > len ? str.slice(0, len) + '…' : (str ?? '');
