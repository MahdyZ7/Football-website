/**
 * Tests for /api/admin/users/verify route
 * @jest-environment node
 */

import { PATCH } from '@/app/api/admin/users/verify/route';
import { getAuthenticatedAdmin } from '@/lib/utils/adminAuth';
import { logAdminAction } from '@/lib/utils/adminLogger';
import pool from '@/lib/utils/db';

jest.mock('@/lib/utils/adminAuth', () => ({
  getAuthenticatedAdmin: jest.fn(),
}));

jest.mock('@/lib/utils/adminLogger', () => ({
  logAdminAction: jest.fn(),
}));

jest.mock('@/lib/utils/db', () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
  },
}));

describe('/api/admin/users/verify', () => {
  const mockedGetAuthenticatedAdmin = jest.mocked(getAuthenticatedAdmin);
  const mockedLogAdminAction = jest.mocked(logAdminAction);
  const mockedConnect = jest.mocked(pool.connect);

  beforeEach(() => {
    mockedGetAuthenticatedAdmin.mockResolvedValue({
      userId: 'admin-1',
      userName: 'Admin User',
    });
  });

  it('returns 404 when the target player does not exist', async () => {
    const query = jest.fn()
      .mockResolvedValueOnce({ rows: [] }) // BEGIN
      .mockResolvedValueOnce({ rows: [] }) // SELECT ... FOR UPDATE
      .mockResolvedValueOnce({ rows: [] }); // ROLLBACK
    const release = jest.fn();

    mockedConnect.mockResolvedValue({
      query,
      release,
    } as never);

    const response = await PATCH(
      new Request('http://localhost/api/admin/users/verify', {
        method: 'PATCH',
        body: JSON.stringify({ id: 'missing-user', verified: true }),
        headers: { 'Content-Type': 'application/json' },
      }) as never
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'User not found' });
    expect(query).toHaveBeenCalledTimes(3);
    expect(mockedLogAdminAction).not.toHaveBeenCalled();
    expect(release).toHaveBeenCalled();
  });

  it('rejects non-boolean verification values', async () => {
    const response = await PATCH(
      new Request('http://localhost/api/admin/users/verify', {
        method: 'PATCH',
        body: JSON.stringify({ id: 'user-1', verified: 'yes' }),
        headers: { 'Content-Type': 'application/json' },
      }) as never
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Verified must be a boolean' });
    expect(mockedConnect).not.toHaveBeenCalled();
    expect(mockedLogAdminAction).not.toHaveBeenCalled();
  });
});
