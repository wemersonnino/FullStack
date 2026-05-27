import { z } from 'zod';

export const ShiftSwapSchema = z.object({
  originalShift: z.string().min(1, 'Selecione o turno que deseja trocar'),
  compensationRequired: z.boolean(),
  compensationDate: z.string().optional().refine((date) => {
    if (!date) return true;
    return new Date(date) > new Date();
  }, {
    message: 'A data de compensação deve ser futura',
  }),
  comments: z.string().max(500, 'O comentário deve ter no máximo 500 caracteres').optional(),
  receiver: z.string().optional(),
});

export type ShiftSwapSchemaType = z.infer<typeof ShiftSwapSchema>;
