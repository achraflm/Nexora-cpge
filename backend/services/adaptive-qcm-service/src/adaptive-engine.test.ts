import assert from 'node:assert/strict'
import { test } from 'node:test'
import { nextDifficulty, scheduleReview, speedFactor, updateMastery } from './adaptive-engine'

test('bonne reponse rapide en D=4 : +alpha * 1.75 * 1.3', () => {
  const m = updateMastery({ mastery: 50, correct: true, difficulty: 4, timeSpentSec: 10, targetTimeSec: 60 })
  assert.equal(m, 50 + 5 * 1.75 * 1.3)
})

test('mauvaise reponse lente en D=1 : -alpha * 1.2 * 0.5', () => {
  const m = updateMastery({ mastery: 50, correct: false, difficulty: 1, timeSpentSec: 600, targetTimeSec: 60 })
  assert.equal(m, 50 - 5 * 1.2 * 0.5)
})

test("l'indice reste dans [0, 100]", () => {
  assert.equal(updateMastery({ mastery: 99, correct: true, difficulty: 4, timeSpentSec: 1, targetTimeSec: 60 }), 100)
  assert.equal(updateMastery({ mastery: 1, correct: false, difficulty: 4, timeSpentSec: 1, targetTimeSec: 60 }), 0)
})

test('phi borne entre 0.5 et 1.3', () => {
  assert.equal(speedFactor(1, 60), 1.3)
  assert.equal(speedFactor(1000, 60), 0.5)
  assert.equal(speedFactor(60, 60), 1)
})

test('selection adaptative de la difficulte', () => {
  assert.equal(nextDifficulty(2, true, 30, 60), 3)
  assert.equal(nextDifficulty(4, true, 30, 60), 4)
  assert.equal(nextDifficulty(2, true, 90, 60), 2)
  assert.equal(nextDifficulty(1, false, 30, 60), 1)
  assert.equal(nextDifficulty(3, false, 30, 60), 2)
})

test('repetition espacee J+1 -> J+3 -> J+7 -> J+21 -> maitrisee', () => {
  const r0 = scheduleReview(null, false, '2026-11-04')
  assert.deepEqual(r0, { step: 0, intervalDays: 1, nextReviewDate: '2026-11-05' })
  assert.equal(scheduleReview(0, true, '2026-11-05')?.nextReviewDate, '2026-11-08')
  assert.equal(scheduleReview(1, true, '2026-11-08')?.intervalDays, 7)
  assert.equal(scheduleReview(2, true, '2026-11-15')?.intervalDays, 21)
  assert.equal(scheduleReview(3, true, '2026-12-06'), null)
  assert.equal(scheduleReview(2, false, '2026-11-15')?.intervalDays, 1)
})
