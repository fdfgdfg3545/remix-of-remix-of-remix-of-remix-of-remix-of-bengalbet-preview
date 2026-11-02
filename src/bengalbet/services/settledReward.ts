/** A completed server settlement may refresh a wallet, never issue another claim. */
export async function refreshSettledReward(
  result: { success: boolean },
  refresh?: () => void | Promise<void>,
) {
  if (!result.success) throw new Error('পুরস্কার জমা নিশ্চিত হয়নি।');
  await refresh?.();
}