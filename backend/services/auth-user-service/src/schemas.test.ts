import assert from 'node:assert/strict'
import { test } from 'node:test'
import { registerSchema } from './schemas'

const valid = {
  firstName: 'Achraf',
  lastName: 'Lemrani',
  email: 'Achraf@Example.MA',
  password: 'motdepasse123',
  cpgeCenter: 'Lycee Omar Ibn Al-Khattab',
  enrolledYear: 'SPE',
  filiere: 'MP',
}

test("l'inscription valide normalise l'e-mail en minuscules", () => {
  assert.equal(registerSchema.parse(valid).email, 'achraf@example.ma')
})

test("l'inscription refuse une filiere hors MP/PSI/TSI", () => {
  assert.equal(registerSchema.safeParse({ ...valid, filiere: 'BCPST' }).success, false)
})

test("l'inscription refuse un mot de passe trop court", () => {
  assert.equal(registerSchema.safeParse({ ...valid, password: 'court' }).success, false)
})
