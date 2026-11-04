import assert from 'node:assert/strict'
import { test } from 'node:test'
import { daysBetween, localDate, updateStreak } from './streak'

test('premiere activite : streak = 1', () => {
  assert.deepEqual(updateStreak({ currentStreak: 0, longestStreak: 0, lastActiveDate: null }, '2026-11-04'), {
    currentStreak: 1,
    longestStreak: 1,
    lastActiveDate: '2026-11-04',
  })
})

test('Delta = 0 : maintien', () => {
  const s = { currentStreak: 5, longestStreak: 9, lastActiveDate: '2026-11-04' }
  assert.deepEqual(updateStreak(s, '2026-11-04'), s)
})

test('Delta = 1 : incrementation et mise a jour du record', () => {
  const s = updateStreak({ currentStreak: 9, longestStreak: 9, lastActiveDate: '2026-11-03' }, '2026-11-04')
  assert.equal(s.currentStreak, 10)
  assert.equal(s.longestStreak, 10)
})

test('Delta > 1 : reinitialisation a 1, record conserve', () => {
  const s = updateStreak({ currentStreak: 14, longestStreak: 20, lastActiveDate: '2026-11-01' }, '2026-11-04')
  assert.equal(s.currentStreak, 1)
  assert.equal(s.longestStreak, 20)
})

test('passage de mois et annee', () => {
  assert.equal(daysBetween('2026-12-31', '2027-01-01'), 1)
  assert.equal(daysBetween('2028-02-28', '2028-03-01'), 2) // annee bissextile
})

test('date locale Casablanca (UTC+1) et non date UTC du serveur', () => {
  assert.equal(localDate(new Date('2026-11-04T22:30:00Z')), '2026-11-04')
  assert.equal(localDate(new Date('2026-11-04T23:30:00Z')), '2026-11-05') // deja minuit 30 a Casablanca
})
