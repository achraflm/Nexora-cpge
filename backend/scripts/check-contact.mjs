import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'

const base = process.env.NEXORA_TEST_ORIGIN || 'http://localhost:3000'
const cookies = {}
async function login(role, email, password) {
  const response = await fetch(base + '/api/auth/login', {
    method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  assert.equal(response.status, 200, await response.clone().text())
  cookies[role] = response.headers.get('set-cookie').split(';')[0]
}
async function call(role, path, expected, method = 'GET', data, origin = base) {
  const response = await fetch(base + '/api/contact/' + path, {
    method, headers: { Origin: origin, 'Content-Type': 'application/json', ...(cookies[role] && { Cookie: cookies[role] }) },
    body: data && JSON.stringify(data),
  })
  const body = await response.json()
  assert.equal(response.status, expected, `${method} ${path}: ${JSON.stringify(body)}`)
  return body
}
await login('student', 'amina.demo@example.test', 'Nexora-Etudiant-2026!')
await login('other', 'yassine.demo@example.test', 'Nexora-Etudiant-2026!')
await login('admin', 'admin.demo@example.test', 'Nexora-Admin-2026!')
try {
  const title = 'Test communication ' + randomUUID()
  const targetEntityRef = 'https://elearning-cpge.com/maths-sup/ensembles-et-applications/'
  const input = { title, category: 'ERRATUM', description: 'Erreur dans la leçon.', targetEntityRef }
  await call('anonymous', 'tickets/mine', 401)
  await call('student', 'tickets', 403, 'POST', input, 'https://foreign.test')
  await call('student', 'tickets', 400, 'POST', { ...input, studentId: randomUUID() })
  await call('student', 'tickets', 400, 'POST', { ...input, description: '  ' })
  const { id } = await call('student', 'tickets', 201, 'POST', input)
  const student = 'tickets/' + id
  const admin = 'admin/tickets/' + id
  assert.equal((await call('student', student, 200)).targetEntityRef, targetEntityRef)
  assert.equal((await call('student', 'tickets/mine?q=' + encodeURIComponent(title), 200)).items[0].id, id)
  await call('other', student, 404)
  await call('other', student + '/messages', 404, 'POST', { text: 'Interdit' })
  await call('other', student + '/read', 404, 'PATCH', { through: randomUUID() })
  await call('student', admin, 403)
  await call('student', admin + '/status', 403, 'PATCH', { status: 'IN_PROGRESS' })
  const list = await call('admin', 'admin/tickets?q=' + id, 200)
  assert.equal(list.items[0]._count.messages, 1)
  assert.ok(Array.isArray(await call('admin', 'admin/directory', 200)))
  await call('admin', 'admin/tickets/statistics', 200)
  await call('admin', admin + '/status', 409, 'PATCH', { status: 'RESOLVED' })
  await call('admin', admin + '/status', 200, 'PATCH', { status: 'IN_PROGRESS' })
  const answer = await call('admin', admin + '/messages', 201, 'POST', { text: 'Merci, nous vérifions.' })
  const notices = await call('student', 'notifications', 200)
  assert.ok(notices.items.some(notice => notice.ticketId === id && !notice.readAt))
  await call('student', student + '/read', 404, 'PATCH', { through: randomUUID() })
  await call('student', student + '/read', 200, 'PATCH', { through: answer.id })
  const cleared = await call('student', 'notifications', 200)
  assert.ok(cleared.items.some(notice => notice.ticketId === id && notice.readAt))
  await call('student', student + '/messages', 201, 'POST', { text: 'Voici la précision.' })
  const resolved = await call('admin', admin + '/status', 200, 'PATCH', { status: 'RESOLVED' })
  assert.ok(resolved.resolvedAt)
  await call('student', student + '/messages', 409, 'POST', { text: 'Après résolution' })
  await login('student', 'amina.demo@example.test', 'Nexora-Etudiant-2026!')
  const thread = await call('student', student + '/messages', 200)
  for (const path of [student, student + '/messages', student + '/messages/' + answer.id]) {
    const denied = await fetch(base + '/api/contact/' + path, {
      method: 'DELETE', headers: { Cookie: cookies.student, Origin: base },
    })
    assert.equal(denied.status, 405, 'La suppression doit être refusée : ' + path)
  }
  const retained = await call('student', student + '/messages', 200)
  assert.deepEqual(retained.messages.map(message => message.id), thread.messages.map(message => message.id))
  assert.deepEqual(thread.messages.map(message => message.senderRole), ['STUDENT', 'ADMIN', 'STUDENT'])
  assert.deepEqual(thread.messages.map(message => message.content), [input.description, answer.content, 'Voici la précision.'])
  console.log('PASS: création, référence, visibilité admin, isolation, validation, réponse, notification, lecture, résolution, historique après reconnexion et suppression interdite.')
  console.log('Ticket de test résolu conservé : ' + id)
} finally {
  await Promise.all(Object.values(cookies).map(Cookie => fetch(base + '/api/auth/logout', {
    method: 'POST', headers: { Cookie, Origin: base, 'Content-Type': 'application/json' }, body: '{}',
  })))
}
