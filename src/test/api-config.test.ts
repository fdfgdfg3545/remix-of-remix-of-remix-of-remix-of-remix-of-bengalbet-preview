import { describe, expect, it } from 'vitest';
import { DEFAULT_SERVER_URL, normalizeServerConfig } from '../bengalbet/services/apiConfig';

describe('DBServer configuration', () => {
  it('supports an editable non-secret default URL with a custom directory', () => {
    expect(normalizeServerConfig('https://staging.example.com/private-api/'))
      .toEqual({ rootDomain: 'https://staging.example.com', path: '/private-api' });
  });
  it('uses the requested server by default', () => {
    const config = normalizeServerConfig();
    expect(`${config.rootDomain}${config.path}/`).toBe(DEFAULT_SERVER_URL);
    expect(DEFAULT_SERVER_URL).toBe('https://server.nexarofx.com/dbserver/');
  });
  it('does not duplicate the directory for a complete server URL', () => {
    expect(normalizeServerConfig('https://server.nexarofx.com/dbserver/', '/dbserver'))
      .toEqual({ rootDomain: 'https://server.nexarofx.com', path: '/dbserver' });
  });
  it('rejects an accidentally concatenated server URL', () => {
    expect(normalizeServerConfig('https://server.nexarofx.com/dbserver/https://server.nexarofx.com/dbserver/'))
      .toEqual({ rootDomain: 'https://server.nexarofx.com', path: '/dbserver' });
  });
});