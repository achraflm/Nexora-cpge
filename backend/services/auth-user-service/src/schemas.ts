import { z } from 'zod'

/** Validation des corps de requete (Zod). Une erreur => 400 VALIDATION_ERROR. */

const filiere = z.enum(['MP', 'PSI', 'TSI'])
const studyYear = z.enum(['SUP', 'SPE'])
const role = z.enum(['STUDENT', 'ADMIN'])
const firstName = z.string().trim().min(1, 'Indiquez un prénom.').max(80)
const lastName = z.string().trim().min(1, 'Indiquez un nom.').max(80)
const email = z.string().trim().max(254).pipe(z.email('Indiquez une adresse e-mail valide.')).transform(value => value.toLowerCase())
const password = z.string().min(8, 'Saisissez au moins 8 caractères.').max(72)
  .refine(value => Buffer.byteLength(value, 'utf8') <= 72, 'Le mot de passe dépasse 72 octets UTF-8.')
const currentPassword = z.string().min(1).max(72)
  .refine(value => Buffer.byteLength(value, 'utf8') <= 72, 'Le mot de passe dépasse 72 octets UTF-8.')
const identityFields = { firstName, lastName, email }
const studentFields = { cpgeCenter: z.string().trim().min(2).max(160), enrolledYear: studyYear, filiere }

// UC01 : inscription avec nom, prenom, e-mail, centre CPGE, niveau et filiere (CDC 2.1).
export const registerSchema = z.object({
  ...identityFields, ...studentFields, password,
}).strict()
export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email,
  password: currentPassword,
}).strict()
export type LoginInput = z.infer<typeof loginSchema>

export const refreshSchema = z.object({
  refreshToken: z.string().regex(/^[A-Za-z0-9_-]{64}$/),
}).strict()

export const updateProfileSchema = z.strictObject({
  ...identityFields, ...studentFields,
  username: z.string().trim().toLowerCase().regex(/^[\p{L}\p{N}._-]{1,40}$/u, 'Utilisez 1 à 40 lettres, chiffres, points, tirets ou underscores.'),
  bio: z.string().trim().max(500, 'La bio est limitée à 500 caractères.'),
  avatarUrl: z.string().max(260_000).regex(/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/).nullable(),
  badge: z.enum(['', 'MP', 'PC', 'INF', 'SII', 'CNC']),
  targetConcours: z.array(z.string().trim().min(1).max(80)).max(10),
  notifyAnswers: z.boolean(), notifyAnnales: z.boolean(), notifyReminders: z.boolean(),
}).partial()
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export const createAccountSchema = z.discriminatedUnion('role', [
  registerSchema.extend({ role: z.literal('STUDENT') }),
  z.strictObject({ ...identityFields, password, role: z.literal('ADMIN') }),
])
export type CreateAccountInput = z.infer<typeof createAccountSchema>
export const updateAccountSchema = z.strictObject({ ...identityFields, ...studentFields }).partial()
export const accountStatusSchema = z.strictObject({ active: z.boolean() })
export const accountListSchema = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(254).optional(),
  role: role.optional(),
  status: z.enum(['active', 'deactivated']).optional(),
})
export type AccountListInput = z.infer<typeof accountListSchema>
export const accessSchema = z.strictObject({ userId: z.uuid(), role, sessionVersion: z.number().int().nonnegative() })
export const changePasswordSchema = z.strictObject({ currentPassword, newPassword: password })
