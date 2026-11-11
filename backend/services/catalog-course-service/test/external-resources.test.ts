import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resourceFilters, resourceSample, resourceUpserts } from '../src/external-resources'

const sample = JSON.parse(readFileSync(new URL('../../../../frontend/lib/catalog-sample.json', import.meta.url), 'utf8'))

test('available documents point to actual local PDF files; blocked documents have no fake URL', () => {
  for (const resource of resourceSample.parse(sample)) {
    if (resource.downloadStatus === 'available') {
      assert.ok(resource.localPdfUrl)
      const path = new URL(`../../../../frontend/public${resource.localPdfUrl}`, import.meta.url)
      assert.equal(readFileSync(path).subarray(0, 5).toString(), '%PDF-')
    } else {
      assert.equal(resource.localPdfUrl, null)
    }
  }
})

test('small selection covers all four subjects without duplicate URLs', () => {
  const resources = resourceSample.parse(sample)
  for (const subject of ['MATH', 'PHYS', 'SI', 'INFO']) {
    const subset = resources.filter(resource => resource.subject === subject)
    assert.equal(subset.length, subject === 'SI' ? 1 : 6)
    assert.deepEqual(new Set(subset.map(resource => resource.level)), new Set(subject === 'SI' ? ['SUP'] : ['SUP', 'SPE']))
  }
  assert.ok(resources.some(resource => resource.subject === 'PHYS' && resource.category === 'Chimie'))
  assert.throws(() => resourceSample.parse([...sample, sample[0]]))
})

test('filters accept SUP/SPE and COURSE/TD, rejecting invalid or repeated parameters', () => {
  for (const level of ['SUP', 'SPE']) {
    for (const type of ['COURSE', 'TD']) {
      const filter = resourceFilters.parse({ subject: 'MATH', level, type })
      assert.ok(sample.some((resource: Record<string, string>) => Object.entries(filter).every(([key, value]) => resource[key] === value)))
    }
  }
  assert.deepEqual(resourceFilters.parse({}), {})
  for (const query of [{ subject: 'CHEM' }, { level: 'other' }, { type: 'PDF' }, { level: ['SUP', 'SPE'] }, { unrelated: 'value' }]) {
    assert.equal(resourceFilters.safeParse(query).success, false)
  }
})

test('repeated import operations use the same URL and update metadata', () => {
  // Verifies import payloads in memory; PostgreSQL constraint is verified on deployment.
  const rows = new Map()
  const apply = (input: unknown) => {
    for (const operation of resourceUpserts(input)) {
      const key = operation.where.sourceUrl
      rows.set(key, rows.has(key) ? operation.update : operation.create)
    }
  }
  apply(sample)
  apply(sample)
  assert.equal(rows.size, sample.length)
  apply([{ ...sample[0], title: 'Titre actualisé' }])
  assert.equal(rows.size, sample.length)
  assert.equal(rows.get(sample[0].sourceUrl).title, 'Titre actualisé')
})
