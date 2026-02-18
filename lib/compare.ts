const KEY = 'goldenlooms_compare';
const MAX = 4;

export function getCompareIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    return list.slice(0, MAX);
  } catch {
    return [];
  }
}

export function addToCompare(productId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getCompareIds().filter((id) => id !== productId);
    if (list.length >= MAX) list.pop();
    list.unshift(productId);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function removeFromCompare(productId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getCompareIds().filter((id) => id !== productId);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function isInCompare(productId: string): boolean {
  return getCompareIds().includes(productId);
}
