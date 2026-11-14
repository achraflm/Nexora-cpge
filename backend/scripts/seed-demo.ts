import '@cnc/common'
import { createHash } from 'node:crypto'
import bcrypt from 'bcrypt'
import { PrismaClient as AuthClient } from '../services/auth-user-service/src/generated/prisma'
import { PrismaClient as CatalogClient } from '../services/catalog-course-service/src/generated/prisma'
import { PrismaClient as AnalyticsClient } from '../services/analytics-streak-service/src/generated/prisma'
import { PrismaClient as ContactClient } from '../services/admin-contact-service/src/generated/prisma'
import { PrismaClient as QcmClient } from '../services/adaptive-qcm-service/src/generated/prisma'
import { localDate, updateStreak } from '../services/analytics-streak-service/src/streak'

const auth = new AuthClient()
const catalog = new CatalogClient()
const analytics = new AnalyticsClient()
const contact = new ContactClient()
const qcm = new QcmClient()
const clients = [auth, catalog, analytics, contact, qcm]

// Identifiants stables pour rendre les relances sans doublons et préserver les modifications.
function id(name: string) {
  const hash = createHash('sha256').update(`nexora-demo-v1:${name}`).digest('hex')
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`
}

async function main() {
  if (process.env.NODE_ENV === 'production') throw new Error('Données de démonstration réservées au développement local.')
  const studentHash = await bcrypt.hash('Nexora-Etudiant-2026!', 12)
  const adminHash = await bcrypt.hash('Nexora-Admin-2026!', 12)
  const admin = await auth.user.upsert({
    where: { email: 'admin.demo@example.test' }, update: {},
    create: { id: id('admin'), firstName: 'Samir', lastName: 'Démo', email: 'admin.demo@example.test', passwordHash: adminHash, role: 'ADMIN', administrator: { create: { privilegeLevel: 3, assignedSubjects: ['MATH', 'PHYS', 'SI', 'INFO'], department: 'Équipe pédagogique fictive' } } },
  })
  const subjects = [
    { code: 'MATH' as const, name: 'Mathématiques', title: 'Suites et raisonnement', statement: 'Calculer la somme des entiers de 1 à n.', answer: 'La somme vaut n(n+1)/2.' },
    { code: 'PHYS' as const, name: 'Physique', title: 'Mécanique du point', statement: 'Exprimer la vitesse après une accélération constante a durant t.', answer: 'v(t)=v_0+at.' },
    { code: 'SI' as const, name: 'Sciences de l’ingénieur', title: 'Systèmes du premier ordre', statement: 'Identifier le gain statique de H(p)=K/(1+Tp).', answer: 'Le gain statique est K.' },
    { code: 'INFO' as const, name: 'Informatique', title: 'Complexité algorithmique', statement: 'Quelle est la complexité d’un parcours simple de n éléments ?', answer: 'La complexité est linéaire, O(n).' },
  ]
  for (const [index, subject] of subjects.entries()) {
    const row = await catalog.subject.upsert({ where: { code: subject.code }, update: {}, create: { code: subject.code, name: subject.name, coeffMP: 1, coeffPSI: 1, coeffTSI: 1 } })
    for (const level of ['SUP', 'SPE'] as const) {
      const key = `${subject.code}-${level}`
      await catalog.chapter.upsert({ where: { id: id(`chapter-${key}`) }, update: {}, create: { id: id(`chapter-${key}`), subjectId: row.id, studyLevel: level, domainName: 'Données pédagogiques fictives', title: `${subject.title} — exemple ${level}`, targetFilieres: ['MP', 'PSI', 'TSI'], orderIndex: index + 1 } })
      await catalog.lesson.upsert({ where: { id: id(`lesson-${key}`) }, update: {}, create: { id: id(`lesson-${key}`), chapterId: id(`chapter-${key}`), title: subject.title, contentLatex: `Exemple pédagogique fictif. ${subject.answer}`, estimatedDurationMin: 30, orderIndex: 1 } })
      await catalog.exercise.upsert({ where: { ref: `DEMO-${key}-001` }, update: {}, create: { id: id(`exercise-${key}`), ref: `DEMO-${key}-001`, lessonId: id(`lesson-${key}`), difficulty: 1, statementLatex: subject.statement, hintsLatex: ['Revenir à la définition du cours.'], solutionLatex: subject.answer } })
      await qcm.qcmQuestion.upsert({ where: { id: id(`question-${key}`) }, update: {}, create: { id: id(`question-${key}`), lessonId: id(`lesson-${key}`), chapterId: id(`chapter-${key}`), questionLatex: subject.statement, difficultyLevel: 1, targetTimeSec: 90, explanationLatex: subject.answer, choices: { create: [{ id: id(`choice-good-${key}`), labelLatex: subject.answer, isCorrect: true }, { id: id(`choice-bad-${key}`), labelLatex: 'Aucune des réponses.', isCorrect: false, feedback: 'Relire la définition présentée dans la leçon.' }] } } })
    }
    await catalog.referenceBook.upsert({ where: { id: id(`book-${subject.code}`) }, update: {}, create: { id: id(`book-${subject.code}`), subjectId: row.id, title: `Fiche de référence fictive — ${subject.name}`, authors: 'Équipe de démonstration Nexora', targetFilieres: ['MP', 'PSI', 'TSI'], studyLevel: 'BOTH', summaryAndAdvice: 'Donnée de test pour vérifier les relations du catalogue.' } })
  }
  const today = localDate(new Date())
  const profiles = [
    ['amina', 'Amina', 'Bennani', 'MP', 'SUP'], ['yassine', 'Yassine', 'Alaoui', 'MP', 'SPE'],
    ['salma', 'Salma', 'Idrissi', 'PSI', 'SUP'], ['ilyas', 'Ilyas', 'Amrani', 'PSI', 'SPE'],
    ['nour', 'Nour', 'El Fassi', 'TSI', 'SUP'], ['adam', 'Adam', 'Mansouri', 'TSI', 'SPE'],
  ] as const
  for (const [index, [slug, firstName, lastName, filiere, enrolledYear]] of profiles.entries()) {
    const user = await auth.user.upsert({ where: { email: `${slug}.demo@example.test` }, update: {}, create: { id: id(`user-${slug}`), firstName, lastName, email: `${slug}.demo@example.test`, passwordHash: studentHash, role: 'STUDENT', student: { create: { filiere, enrolledYear, cpgeCenter: 'Centre CPGE de démonstration', accessAllYears: true } } } })
    const days: string[] = []
    for (let offset = 29; offset >= 0; offset--) {
      if (offset > 6 && (offset + index) % 5 === 0) continue
      const date = new Date(`${today}T00:00:00Z`)
      date.setUTCDate(date.getUTCDate() - offset)
      days.push(date.toISOString().slice(0, 10))
      const subjectCode = subjects[(offset + index) % subjects.length].code
      await analytics.dailyActivityLog.upsert({ where: { userId_activityDate_subjectCode: { userId: user.id, activityDate: date, subjectCode } }, update: {}, create: { id: id(`log-${slug}-${days.at(-1)}`), userId: user.id, activityDate: date, subjectCode, lessonsRead: 1, exercisesSolved: 1 + index % 3, problemsWritten: offset % 7 === 0 ? 1 : 0, qcmCompleted: offset % 3 === 0 ? 1 : 0, studyMinutes: 30 + ((offset + index) % 5) * 15 } })
    }
    let streak = { currentStreak: 0, longestStreak: 0, lastActiveDate: null as string | null }
    for (const day of days) streak = updateStreak(streak, day)
    await analytics.userStreak.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id, currentStreak: streak.currentStreak, longestStreak: streak.longestStreak, lastActiveDate: new Date(`${today}T00:00:00Z`) } })
    await catalog.exerciseAttempt.upsert({ where: { id: id(`attempt-${slug}`) }, update: {}, create: { id: id(`attempt-${slug}`), userId: user.id, exerciseId: id(`exercise-MATH-${enrolledYear}`), usedMode: 'BIBMATH', hintUsed: true, resolutionStatus: 'WITH_HINT', timeSpentSec: 300 } })
    await contact.contactMessage.upsert({ where: { id: id(`ticket-${slug}`) }, update: {}, create: { id: id(`ticket-${slug}`), userId: user.id, category: 'PEDAGOGICAL_QUESTION', messageBody: 'Ticket fictif pour tester le suivi pédagogique.', status: 'RESOLVED', adminReply: 'Exemple de réponse pédagogique.', repliedBy: admin.id, resolvedAt: new Date(), notifications: { create: { id: id(`notification-${slug}`), userId: user.id, message: 'Une réponse de démonstration est disponible.' } } } })
    await qcm.qcmMastery.upsert({ where: { userId_chapterId: { userId: user.id, chapterId: id(`chapter-MATH-${enrolledYear}`) } }, update: {}, create: { userId: user.id, chapterId: id(`chapter-MATH-${enrolledYear}`), masteryScore: 50 + index * 5 } })
  }
  // Les sujets publics existants restent référencés par le catalogue local de l'interface.
  console.log('Base fictive prête : 7 comptes, 4 matières, 8 chapitres/leçons/exercices/QCM, 4 ouvrages, activités et tickets.')
}

main().catch(error => { console.error(error); process.exitCode = 1 }).finally(async () => { await Promise.all(clients.map(client => client.$disconnect())) })
