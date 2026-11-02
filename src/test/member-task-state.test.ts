import { expect, it } from 'vitest';
import { mayClaimMemberTask } from '../bengalbet/services/memberTaskState';

it('permits a server-approved first task and blocks the premature second task', () => {
  const tasks = [{ day: 1, claimed: false, eligible: true }, { day: 2, claimed: false, eligible: false }];
  expect(mayClaimMemberTask(tasks, 1, false)).toBe(true);
  expect(mayClaimMemberTask(tasks, 2, false)).toBe(false);
});
it('blocks claimed, missing and in-flight tasks', () => {
  expect(mayClaimMemberTask([{ day: 1, claimed: true, eligible: true }], 1, false)).toBe(false);
  expect(mayClaimMemberTask([], 1, false)).toBe(false);
  expect(mayClaimMemberTask([{ day: 1, claimed: false, eligible: true }], 1, true)).toBe(false);
});