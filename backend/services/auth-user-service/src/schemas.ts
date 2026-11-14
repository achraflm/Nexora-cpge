import { z } from 'zod'

/** Validation des corps de requete (Zod). Une erreur => 400 VALIDATION_ERROR. */

const filiere = z.enum(['MP', 'PSI', 'TSI'])
const studyYear = z.enum(['SUP', 'SPE'])

// UC01 : inscription avec nom, prenom, e-mail, centre CPGE, niveau et filiere (CDC 2.1).
export const registerSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().max(254).pipe(z.email()).transform((e) => e.toLowerCase()),
  password: z.string().min(8, 'Au moins 8 caracteres').max(72)
    .refine(value => Buffer.byteLength(value, 'utf8') <= 72, 'Maximum 72 octets UTF-8'),
  cpgeCenter: z.string().trim().min(2).max(160),
  enrolledYear: studyYear,
  filiere,
}).strict()
export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().trim().max(254).pipe(z.email()).transform((e) => e.toLowerCase()),
  password: z.string().min(1).max(72)
    .refine(value => Buffer.byteLength(value, 'utf8') <= 72, 'Maximum 72 octets UTF-8'),
}).strict()
export type LoginInput = z.infer<typeof loginSchema>

export const refreshSchema = z.object({
  refreshToken: z.string().regex(/^[A-Za-z0-9_-]{64}$/),
}).strict()

export const updateProfileSchema = z
  .object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    cpgeCenter: z.string().trim().min(2).max(160),
    enrolledYear: studyYear,
    filiere,
  })
  .partial()
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
