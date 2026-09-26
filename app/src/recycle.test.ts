import { describe, expect, it } from 'vitest'
import { createBoard } from './board'
import { CATEGORY_DOMINATION_THRESHOLD } from './draw'
import type { Goal } from './pool'
import {
  RECYCLE_ALLOWANCE_MAX_LEVEL,
  RECYCLE_ALLOWANCE_UPGRADE_COST,
  RECYCLE_ALLOWANCE_WINDOW_MS,
  RECYCLE_COST,
  effectiveRemaining,
  purchaseAllowanceUpgrade,
  recycleCell,
  type RecycleState,
} from './recycle'
import { STARTER_POOL } from './storage'
import { seededRng } from './test-support'

const FRESH: RecycleState = { allowanceLevel: 1, remaining: 1, windowStartedAt: null }
const NOW = 1_700_000_000_000

describe('recycleCell (GB-FUN-039, GB-CON-008)', () => {
  it('replaces an unmarked tile with a different goal drawn from the pool', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const board = createBoard(5, pool, () => 0)
    expect(board.ok).toBe(true)
    if (!board.ok) return
    const before = board.board.cells[0]!.goal
    const result = recycleCell(board.board, pool, 0, FRESH, 0, () => 0.99, NOW)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.board.cells[0]!.goal).not.toEqual(before)
    expect(result.board.cells[0]!.marked).toBe(false)
  })

  it('refuses on a marked tile without touching allowance or balance', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const board = createBoard(5, pool, () => 0)
    expect(board.ok).toBe(true)
    if (!board.ok) return
    const cells = board.board.cells.slice()
    cells[0] = { ...cells[0]!, marked: true }
    const marked = { ...board.board, cells }
    const beforeCell = marked.cells[0]
    const beforeRecycle = { ...FRESH }
    const beforeBalance = 0
    const result = recycleCell(marked, pool, 0, beforeRecycle, beforeBalance, Math.random, NOW)
    expect(result).toEqual({ ok: false, reason: 'marked' })
    expect(marked.cells[0]).toEqual(beforeCell)
    expect(beforeRecycle).toEqual(FRESH)
    expect(beforeBalance).toBe(0)
  })

  it('uses the free allowance first, leaving board balance untouched', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const board = createBoard(5, pool, () => 0)
    expect(board.ok).toBe(true)
    if (!board.ok) return
    const result = recycleCell(board.board, pool, 0, FRESH, 0, Math.random, NOW)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.paidWithBalance).toBe(false)
    expect(result.boardBalance).toBe(0)
    expect(result.recycle.remaining).toBe(0)
    expect(result.recycle.windowStartedAt).toBe(NOW)
  })

  it('spends board balance once the free allowance is exhausted', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const board = createBoard(5, pool, () => 0)
    expect(board.ok).toBe(true)
    if (!board.ok) return
    const exhausted: RecycleState = { allowanceLevel: 1, remaining: 0, windowStartedAt: NOW }
    const result = recycleCell(board.board, pool, 0, exhausted, 20, Math.random, NOW + 1000)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.paidWithBalance).toBe(true)
    expect(result.boardBalance).toBe(20 - RECYCLE_COST)
    expect(result.recycle).toEqual(exhausted)
  })

  it('refuses when the allowance is exhausted and board balance is insufficient', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const board = createBoard(5, pool, () => 0)
    expect(board.ok).toBe(true)
    if (!board.ok) return
    const exhausted: RecycleState = { allowanceLevel: 1, remaining: 0, windowStartedAt: NOW }
    const result = recycleCell(board.board, pool, 0, exhausted, RECYCLE_COST - 1, Math.random, NOW + 1000)
    expect(result).toEqual({ ok: false, reason: 'insufficient-balance' })
  })

  it('restores the full allowance 24h after the window started, treating it as free again', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const board = createBoard(5, pool, () => 0)
    expect(board.ok).toBe(true)
    if (!board.ok) return
    const exhausted: RecycleState = { allowanceLevel: 2, remaining: 0, windowStartedAt: NOW }
    const justBefore = NOW + RECYCLE_ALLOWANCE_WINDOW_MS - 1
    const justAfter = NOW + RECYCLE_ALLOWANCE_WINDOW_MS
    expect(effectiveRemaining(exhausted, justBefore)).toBe(0)
    expect(effectiveRemaining(exhausted, justAfter)).toBe(2)

    const result = recycleCell(board.board, pool, 0, exhausted, 0, Math.random, justAfter)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.paidWithBalance).toBe(false)
    // A fresh window starts at this recycle, consuming one of the two restored slots.
    expect(result.recycle).toEqual({ allowanceLevel: 2, remaining: 1, windowStartedAt: justAfter })
  })

  it('with allowance 2, two recycles in the window are free and the third spends board balance (GB-FUN-041)', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const built = createBoard(5, pool, () => 0)
    expect(built.ok).toBe(true)
    if (!built.ok) return
    let current = built.board
    let recycle: RecycleState = { allowanceLevel: 2, remaining: 2, windowStartedAt: NOW }
    let balance = 20
    const lifetime = 15
    for (let n = 0; n < 2; n++) {
      const result = recycleCell(current, pool, 0, recycle, balance, () => 0.5, NOW + 1000)
      expect(result.ok).toBe(true)
      if (!result.ok) return
      expect(result.paidWithBalance).toBe(false)
      expect(result.boardBalance).toBe(balance)
      current = result.board
      recycle = result.recycle
      balance = result.boardBalance
    }
    const paid = recycleCell(current, pool, 0, recycle, balance, () => 0.5, NOW + 2000)
    expect(paid.ok).toBe(true)
    if (!paid.ok) return
    expect(paid.paidWithBalance).toBe(true)
    expect(paid.boardBalance).toBe(20 - RECYCLE_COST)
    expect(lifetime).toBe(15)
  })

  it('refuses on an empty pool without touching allowance or balance', () => {
    const pool = STARTER_POOL.map((g) => ({ ...g }))
    const board = createBoard(5, pool, () => 0)
    expect(board.ok).toBe(true)
    if (!board.ok) return
    const result = recycleCell(board.board, [], 0, FRESH, 0, Math.random, NOW)
    expect(result).toEqual({ ok: false, reason: 'empty-pool' })
  })

  it('never draws a replacement that violates the long-term/domination placement rules, across many seeds', () => {
    const pool: Goal[] = [
      { id: 'l1', title: 'L1', category: 'a', cadence: 'long-term' },
      { id: 'l2', title: 'L2', category: 'a', cadence: 'long-term' },
      { id: 'h1', title: 'H1', category: 'b', cadence: 'hourly' },
      { id: 'd1', title: 'D1', category: 'c', cadence: 'daily' },
      { id: 'w1', title: 'W1', category: 'd', cadence: 'weekly' },
    ]
    for (let seed = 0; seed < 20; seed++) {
      const rng = seededRng(seed)
      const board = createBoard(5, pool, rng)
      expect(board.ok).toBe(true)
      if (!board.ok) continue
      // Recycle cell 0 repeatedly (paid, since balance is generous) and check row/col
      // long-term counts and category share stay legal after every recycle.
      let current = board.board
      let balance = 1000
      let recycle: RecycleState = { allowanceLevel: 0, remaining: 0, windowStartedAt: NOW }
      for (let i = 0; i < 5; i++) {
        const result = recycleCell(current, pool, 0, recycle, balance, rng, NOW)
        expect(result.ok).toBe(true)
        if (!result.ok) continue
        current = result.board
        balance = result.boardBalance
        recycle = result.recycle
      }
      const longInRow0 = [0, 1, 2, 3, 4].filter(
        (c) => current.cells[c]!.goal.cadence === 'long-term',
      ).length
      expect(longInRow0).toBeLessThanOrEqual(1)
      const longInCol0 = [0, 1, 2, 3, 4].filter(
        (r) => current.cells[r * 5]!.goal.cadence === 'long-term',
      ).length
      expect(longInCol0).toBeLessThanOrEqual(1)
      const counts = new Map<string, number>()
      for (const cell of current.cells) {
        counts.set(cell.goal.category, (counts.get(cell.goal.category) ?? 0) + 1)
      }
      for (const n of counts.values()) {
        expect(n / current.cells.length).toBeLessThanOrEqual(CATEGORY_DOMINATION_THRESHOLD)
      }
    }
  })
})

describe('purchaseAllowanceUpgrade (GB-FUN-037)', () => {
  it('raises the allowance level from 1 to 2 and deducts board balance', () => {
    const result = purchaseAllowanceUpgrade(FRESH, RECYCLE_ALLOWANCE_UPGRADE_COST)
    expect(result).toEqual({
      ok: true,
      recycle: { ...FRESH, allowanceLevel: 2 },
      boardBalance: 0,
    })
  })

  it('raises the allowance level from 2 to 3 and deducts board balance again', () => {
    const level2: RecycleState = { ...FRESH, allowanceLevel: 2 }
    const result = purchaseAllowanceUpgrade(level2, RECYCLE_ALLOWANCE_UPGRADE_COST)
    expect(result).toEqual({
      ok: true,
      recycle: { ...level2, allowanceLevel: 3 },
      boardBalance: 0,
    })
  })

  it('refuses at the cap, with no state change', () => {
    const capped: RecycleState = { ...FRESH, allowanceLevel: RECYCLE_ALLOWANCE_MAX_LEVEL }
    const result = purchaseAllowanceUpgrade(capped, 10_000)
    expect(result).toEqual({ ok: false, reason: 'max-level' })
  })

  it('refuses with insufficient board balance, with no state change', () => {
    const result = purchaseAllowanceUpgrade(FRESH, RECYCLE_ALLOWANCE_UPGRADE_COST - 1)
    expect(result).toEqual({ ok: false, reason: 'insufficient-balance' })
  })

  it('persists the new level across a saveState/loadState round-trip', () => {
    const upgraded = purchaseAllowanceUpgrade(FRESH, RECYCLE_ALLOWANCE_UPGRADE_COST)
    expect(upgraded.ok).toBe(true)
    if (!upgraded.ok) return
    const restored = JSON.parse(JSON.stringify(upgraded.recycle)) as RecycleState
    expect(restored).toEqual(upgraded.recycle)
    expect(effectiveRemaining(restored, NOW)).toBe(2)
  })
})
