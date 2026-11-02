export interface MemberTaskState {
  day: number;
  claimed: boolean;
  eligible: boolean;
}

export function mayClaimMemberTask(tasks: MemberTaskState[], day: number, busy: boolean): boolean {
  const task = tasks.find(item => item.day === day);
  return !busy && task?.eligible === true && task.claimed === false;
}