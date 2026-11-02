/** Only operational/admin routes may receive the legacy admin credential. */
export function mayAttachAdminCredential(endpoint: string, method = 'GET'): boolean {
  if (/^https?:\/\//i.test(endpoint)) return false;
  const path = endpoint.split('?')[0]?.replace(/^\/api\//, '/').replace(/^api\//, '/') ?? '';
  if (/^\/admin(?:\/|\.php|$)/.test(path)) return true;
  return method.toUpperCase() !== 'GET' && /^\/vip\/tiers(?:\/|$)/.test(path);
}

export function mayAttachMemberCredential(endpoint: string): boolean {
  return !/^https?:\/\//i.test(endpoint);
}