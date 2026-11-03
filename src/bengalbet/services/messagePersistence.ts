export interface MessageDraft {
  userId: string;
  title: string;
  headline: string;
  sender: string;
  category: string;
  claimableBonus: number;
  description: string;
  steps: string[];
  rules: string[];
}

export function normalizeMessage(row: Record<string, any>) {
  let content = row.content;
  if (!content && typeof row.content_json === 'string') {
    try { content = JSON.parse(row.content_json); } catch { content = {}; }
  }
  return { ...row, userId: row.userId ?? row.user_id, claimableBonus: Number(row.claimableBonus ?? row.claimable_bonus ?? 0), displayTime: row.displayTime ?? row.display_time, dateFull: row.dateFull ?? row.date_full, content: content ?? {} };
}

type MessageApi = {
  getMessages: () => Promise<{ success: boolean; messages?: Record<string, any>[] }>;
  createBroadcastMessage: (draft: MessageDraft) => Promise<{ success: boolean; message?: string }>;
  deleteMessage: (id: string) => Promise<{ success: boolean; message?: string }>;
};

async function readMessages(api: MessageApi) {
  const result = await api.getMessages();
  if (!result.success || !Array.isArray(result.messages)) throw new Error('সার্ভারের বার্তা যাচাই করা যায়নি।');
  return result.messages.map(normalizeMessage);
}

export async function createVerifiedMessage(draft: MessageDraft, api: MessageApi) {
  const before = await readMessages(api);
  const saved = await api.createBroadcastMessage(draft);
  if (!saved.success) throw new Error(saved.message || 'বার্তা পাঠানো যায়নি।');
  const after = await readMessages(api);
  const previousIds = new Set(before.map(row => String(row.id)));
  const found = after.some(row => !previousIds.has(String(row.id)) &&
    row.userId === draft.userId && row.title === draft.title && row.sender === draft.sender &&
    row.category === draft.category && row.claimableBonus === draft.claimableBonus &&
    row.content.headline === draft.headline && row.content.description === draft.description &&
    JSON.stringify(row.content.howToGetSteps) === JSON.stringify(draft.steps) &&
    JSON.stringify(row.content.rules) === JSON.stringify(draft.rules));
  if (!found) throw new Error('বার্তা লেখা হয়েছে, কিন্তু সংরক্ষিত তথ্য মেলেনি। আবার লোড করুন; পুনরায় পাঠাবেন না।');
  return after;
}

export async function deleteVerifiedMessage(id: string, api: MessageApi) {
  const deleted = await api.deleteMessage(id);
  if (!deleted.success) throw new Error(deleted.message || 'বার্তা মুছে ফেলা যায়নি।');
  const after = await readMessages(api);
  if (after.some(row => String(row.id) === String(id))) throw new Error('বার্তাটি সার্ভারে এখনো আছে।');
  return after;
}