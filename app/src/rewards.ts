/** Personal rewards (GB-FUN-034, GB-FUN-034b, GB-FUN-035). */

export type Reward = {
  id: string
  name: string
  price: number
}

export function createRewardId(): string {
  return `rw-${crypto.randomUUID()}`
}

export function validateReward(
  input: { name: string; price: number | string },
): { ok: true; reward: Omit<Reward, 'id'> } | { ok: false; error: string } {
  const name = input.name.trim()
  if (!name) return { ok: false, error: 'Name is required.' }
  const price = typeof input.price === 'string' ? Number(input.price) : input.price
  if (!Number.isFinite(price) || !Number.isInteger(price) || price <= 0) {
    return { ok: false, error: 'Price must be a positive whole number.' }
  }
  return { ok: true, reward: { name, price } }
}

export function addReward(
  rewards: Reward[],
  input: { name: string; price: number | string },
): { ok: true; rewards: Reward[] } | { ok: false; error: string } {
  const checked = validateReward(input)
  if (!checked.ok) return checked
  return { ok: true, rewards: [...rewards, { id: createRewardId(), ...checked.reward }] }
}

export function removeReward(rewards: Reward[], id: string): Reward[] {
  return rewards.filter((r) => r.id !== id)
}

export type PurchaseResult =
  | { ok: true; rewardBalance: number }
  | { ok: false; reason: 'not-found' | 'insufficient-balance' }

/**
 * Purchase a reward, deducting its price from reward balance only (GB-FUN-035).
 * Never touches lifetime score or board balance - the caller applies the returned
 * balance to `GameState.score.rewardBalance` alone. A reward is not consumed by
 * purchase; it stays in the list and can be bought again.
 */
export function purchaseReward(
  rewards: Reward[],
  id: string,
  rewardBalance: number,
): PurchaseResult {
  const reward = rewards.find((r) => r.id === id)
  if (!reward) return { ok: false, reason: 'not-found' }
  if (reward.price > rewardBalance) return { ok: false, reason: 'insufficient-balance' }
  return { ok: true, rewardBalance: rewardBalance - reward.price }
}
