const STORAGE_KEY = 'configuratorParams';

export function saveParam(key: string, value: string | number | boolean) {
  const existing = loadAllParams();
  const updated = { ...existing, [key]: value };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function loadParam<T extends string | number | boolean>(key: string, fallback: T): T {
  const all = loadAllParams();
  return (key in all ? all[key] : fallback) as T;
}

export function loadAllParams(): Record<string, string | number | boolean> {
  const raw = localStorage.getItem(STORAGE_KEY);
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function initStorageOnReload() {
  const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  const isReload = performance.navigation.type === 1 || navEntries[0]?.type === 'reload';
  if (isReload) {
    localStorage.removeItem(STORAGE_KEY);
    window.location.replace('/');
  }
}

export function clearAllParams() {
  localStorage.removeItem(STORAGE_KEY);
}
