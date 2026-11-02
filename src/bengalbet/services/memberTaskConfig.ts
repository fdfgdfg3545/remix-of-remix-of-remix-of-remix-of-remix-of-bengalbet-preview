export interface MemberTaskDefinition {
  day: number;
  bonus: number;
  requirementType: 'login' | 'bet' | 'deposit';
  requiredAmount: number;
}
export interface MemberTaskConfig { enabled: boolean; days: MemberTaskDefinition[] }

export function validateMemberTaskConfig(config: MemberTaskConfig): MemberTaskConfig {
  if (typeof config.enabled !== 'boolean' || config.days.length !== 12) throw new Error('১২টি দিনের কাজ প্রয়োজন।');
  config.days.forEach((task, index) => {
    if (task.day !== index + 1 || !['login', 'bet', 'deposit'].includes(task.requirementType) ||
      !Number.isFinite(task.bonus) || task.bonus < 0 || task.bonus > 100000000 ||
      !Number.isFinite(task.requiredAmount) || task.requiredAmount < 0 || task.requiredAmount > 100000000 ||
      (task.requirementType === 'login' && task.requiredAmount !== 0)) throw new Error('কাজের শর্ত বা পরিমাণ সঠিক নয়।');
  });
  return config;
}
export function memberTaskLabel(task: MemberTaskDefinition) {
  if (task.requirementType === 'login') return 'প্রতিদিন লগইন করুন';
  return `${task.requiredAmount.toLocaleString('bn-BD')} টাকা ${task.requirementType === 'deposit' ? 'জমা করুন' : 'বাজি ধরুন'}`;
}
export async function saveMemberTaskConfig(config: MemberTaskConfig, service: {
  updateConfig: (config: MemberTaskConfig) => Promise<{ success: boolean }>;
  getConfig: () => Promise<{ success: boolean; config: MemberTaskConfig }>;
}) {
  validateMemberTaskConfig(config);
  if (!(await service.updateConfig(config)).success) throw new Error('কাজ সংরক্ষণ হয়নি।');
  const readback = await service.getConfig();
  if (!readback.success || readback.config.enabled !== config.enabled || readback.config.days.length !== 12 ||
    config.days.some((task, i) => Object.keys(task).some(key => task[key as keyof MemberTaskDefinition] !== readback.config.days[i]?.[key as keyof MemberTaskDefinition]))) {
    throw new Error('সার্ভারে সংরক্ষিত কাজের তথ্য মিলছে না।');
  }
  return readback.config;
}