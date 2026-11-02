import { expect, it } from 'vitest';
import { saveMemberTaskConfig, validateMemberTaskConfig, type MemberTaskConfig } from '../bengalbet/services/memberTaskConfig';
const config = (): MemberTaskConfig => ({ enabled: true, days: Array.from({ length: 12 }, (_, i) => ({ day: i + 1, bonus: 10, requirementType: 'login', requiredAmount: 0 })) });
it('requires exactly twelve sequential days', () => {
  const c = config(); c.days.pop(); expect(() => validateMemberTaskConfig(c)).toThrow();
  const d = config(); d.days[1] = { day: 1, bonus: 10, requirementType: 'login', requiredAmount: 0 }; expect(() => validateMemberTaskConfig(d)).toThrow();
});
it('rejects invalid bonus and login thresholds', () => {
  const c = config(); c.days[0] = { day: 1, bonus: -1, requirementType: 'login', requiredAmount: 0 }; expect(() => validateMemberTaskConfig(c)).toThrow();
  const d = config(); d.days[0] = { day: 1, bonus: 10, requirementType: 'login', requiredAmount: 100 }; expect(() => validateMemberTaskConfig(d)).toThrow();
});
it('requires persisted readback to match the saved reward amount', async () => {
  const c = config(); const d = config(); d.days[0] = { day: 1, bonus: 20, requirementType: 'login', requiredAmount: 0 };
  await expect(saveMemberTaskConfig(c, { updateConfig: async () => ({ success: true }), getConfig: async () => ({ success: true, config: d }) })).rejects.toThrow();
  expect((await saveMemberTaskConfig(c, { updateConfig: async () => ({ success: true }), getConfig: async () => ({ success: true, config: c }) })).days[0]?.bonus).toBe(10);
});