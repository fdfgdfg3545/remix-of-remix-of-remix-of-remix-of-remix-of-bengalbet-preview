import { describe, expect, it, vi } from 'vitest';
import { createVerifiedMessage, deleteVerifiedMessage } from '../bengalbet/services/messagePersistence';

const draft = { userId: 'isolated-test', title: 'test', headline: 'test', sender: 'audit', category: 'notice', claimableBonus: 0, description: 'test', steps: [], rules: [] };
const row = { id: 'new', user_id: draft.userId, title: draft.title, sender: draft.sender, category: draft.category, claimable_bonus: 0, content_json: JSON.stringify({ headline: draft.headline, description: draft.description, howToGetSteps: [], rules: [] }) };
const makeApi = () => ({ getMessages: vi.fn(), createBroadcastMessage: vi.fn().mockResolvedValue({ success: true }), deleteMessage: vi.fn().mockResolvedValue({ success: true }) });
describe('Message persistence confirmation', () => {
  it('confirms a newly stored targeted zero-bonus message', async () => {
    const api = makeApi(); api.getMessages.mockResolvedValueOnce({ success: true, messages: [] }).mockResolvedValueOnce({ success: true, messages: [row] });
    expect((await createVerifiedMessage(draft, api))[0]?.userId).toBe('isolated-test');
  });
  it('does not mistake an old identical message for a new save', async () => {
    const api = makeApi(); api.getMessages.mockResolvedValue({ success: true, messages: [row] });
    await expect(createVerifiedMessage(draft, api)).rejects.toThrow();
  });
  it('rejects an incorrectly stored bonus amount', async () => {
    const api = makeApi(); api.getMessages.mockResolvedValueOnce({ success: true, messages: [] }).mockResolvedValueOnce({ success: true, messages: [{ ...row, claimable_bonus: 100 }] });
    await expect(createVerifiedMessage(draft, api)).rejects.toThrow();
  });
  it('rejects deletion when the message still reads back', async () => {
    const api = makeApi(); api.getMessages.mockResolvedValue({ success: true, messages: [row] });
    await expect(deleteVerifiedMessage('new', api)).rejects.toThrow();
  });
  it('confirms deletion only after absence is verified', async () => {
    const api = makeApi(); api.getMessages.mockResolvedValue({ success: true, messages: [] });
    await expect(deleteVerifiedMessage('new', api)).resolves.toEqual([]);
  });
  it('rejects unavailable readback', async () => {
    const api = makeApi(); api.getMessages.mockResolvedValue({ success: false });
    await expect(deleteVerifiedMessage('new', api)).rejects.toThrow();
  });
});