const KEY = 'goldenlooms_recently_viewed';
const MAX = 10;

export function addRecentlyViewed(productId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const next = [productId, ...list.filter((id) => id !== productId)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function getRecentlyViewedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    return list;
  } catch {
    return [];
  }
}
