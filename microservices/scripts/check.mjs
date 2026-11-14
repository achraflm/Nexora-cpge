const names = ['gateway', 'identity', 'academic-content', 'communication', 'student-analytics', 'document-processing', 'adaptive-qcm']
for (const [index, name] of names.entries()) {
  const response = await fetch('http://localhost:' + (5100 + index) + '/health', { signal: AbortSignal.timeout(5000) })
  const body = await response.json()
  if (!response.ok || body.status !== 'ok' || body.service !== name) throw new Error(name + ' health failed')
  console.log(name + ': healthy')
}
