export const DEFAULT_SERVER_URL = 'https://server.nexarofx.com/dbserver/';

export function normalizeServerConfig(root?: unknown, path?: unknown) {
  const fallback = new URL(DEFAULT_SERVER_URL);
  try {
    const raw = typeof root === 'string' ? root.trim() : '';
    const url = new URL(raw || fallback.origin);
    if (url.protocol !== 'https:' || url.hostname.includes('neexthub')) {
      return { rootDomain: fallback.origin, path: '/dbserver' };
    }
    const embeddedPath = url.pathname.replace(/\/+$/, '');
    const candidate = typeof path === 'string' ? path.trim() : '';
    // A pasted complete server URL already includes its directory.
    const directory = embeddedPath || candidate || '/dbserver';
    if (directory.includes('://') || directory.includes('..')) {
      return { rootDomain: fallback.origin, path: '/dbserver' };
    }
    return {
      rootDomain: url.origin,
      path: `/${directory.replace(/^\/+|\/+$/g, '')}`,
    };
  } catch {
    return { rootDomain: fallback.origin, path: '/dbserver' };
  }
}