/** Map Mongo deployment.status to dashboard badge labels */
export function mapBackendStatusToUi(status) {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'running':
      return 'SUCCESS';
    case 'failed':
      return 'FAILED';
    case 'building':
      return 'BUILDING';
    case 'queued':
      return 'QUEUED';
    case 'rolling_back':
      return 'ROLLING_BACK';
    case 'stopped':
      return 'STOPPED';
    default:
      return 'QUEUED';
  }
}

export function formatTimeAgo(date) {
  if (!date) return '—';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return 'just now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`;
  return d.toLocaleDateString();
}

export function formatDurationMs(ms) {
  if (ms == null || Number.isNaN(ms)) return '—';
  if (ms < 1000) return `${ms}ms`;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rs = s % 60;
  return `${m}m ${rs}s`;
}
