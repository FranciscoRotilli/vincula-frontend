import { z } from 'zod';

export type CaseItem = {
  id: string;
  name: string;
  owner: string;
  status: string;
  creation_date: string;
}

export type ApiResponse = {
  total: number;
  page: number;
  limit: number;
  items: CaseItem[];
}

const ValidCaseStatus = [
    "Em andamento",
    "Suspenso",
    "Encerrado"
]

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10)
})

export type PaginationParams = z.infer<typeof PaginationSchema>

export const FilterSchema = z.object({
  name: z.coerce.string().optional(),
  owner: z.coerce.string().optional(),
  status: z.enum(ValidCaseStatus).optional()
})

export type FilterParams = z.infer<typeof FilterSchema>