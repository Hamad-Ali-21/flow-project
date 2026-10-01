export const KARACHI_TIME_ZONE = 'Asia/Karachi';

export function getKarachiTodayISO(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: KARACHI_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function formatKarachiDate(now = new Date(), options = {}) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: KARACHI_TIME_ZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(now);
}
