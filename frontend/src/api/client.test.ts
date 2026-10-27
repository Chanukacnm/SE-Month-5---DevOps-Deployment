import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, configureClient, request } from './client';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('request', () => {
  const fetchMock = vi.fn<typeof fetch>();
  const onUnauthorized = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    configureClient({ getToken: () => 'tok', onUnauthorized });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
    onUnauthorized.mockReset();
  });

  it('prefixes /api, sends the bearer token and drops empty query values', async () => {
    fetchMock.mockResolvedValue(json(200, { ok: true }));
    await expect(request('/users', { query: { page: 2, search: '', role: 'all' } })).resolves.toEqual({ ok: true });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(`${window.location.origin}/api/users?page=2&role=all`);
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer tok');
  });

  it('serialises JSON bodies', async () => {
    fetchMock.mockResolvedValue(json(201, { id: 'usr_1' }));
    await request('/users', { method: 'POST', body: { name: 'A' } });

    const init = fetchMock.mock.calls[0][1]!;
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"name":"A"}');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('surfaces the server error message as an ApiError', async () => {
    fetchMock.mockResolvedValue(json(409, { error: { message: 'A user with this email already exists' } }));
    const err = await request('/users', { method: 'POST', body: {} }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 409, message: 'A user with this email already exists' });
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('signs out when a signed-in request gets a 401', async () => {
    fetchMock.mockResolvedValue(json(401, { error: { message: 'Session expired' } }));
    await expect(request('/users')).rejects.toMatchObject({ status: 401 });
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it('does not sign out on a failed login (no token yet)', async () => {
    configureClient({ getToken: () => null });
    fetchMock.mockResolvedValue(json(401, { error: { message: 'Invalid email or password' } }));
    await expect(request('/auth/login', { method: 'POST', body: {} })).rejects.toThrow('Invalid email or password');
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('maps network failures to a friendly error', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(request('/dashboard')).rejects.toMatchObject({ status: 0, message: expect.stringMatching(/Cannot reach the server/) });
  });
});
