import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
})

export const updateNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  content: z.string().optional(),
})

export const upgradeTenantSchema = z.object({
  plan: z.enum(['pro']),
})

export type LoginInput = z.infer<typeof loginSchema>
export type CreateNoteInput = z.infer<typeof createNoteSchema>
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>
export type UpgradeTenantInput = z.infer<typeof upgradeTenantSchema>
