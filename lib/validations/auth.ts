import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Adres e-mail jest wymagany')
    .email('Podaj poprawny adres e-mail (np. michal@example.com)'),
  password: z
    .string()
    .min(8, 'Hasło musi mieć minimum 8 znaków'),
});

export const registerSchema = loginSchema.extend({
  name: z
    .string()
    .trim()
    .min(2, 'Imię lub pseudonim musi mieć min. 2 znaki'),
  neighborhood: z
    .string()
    .trim()
    .min(3, 'Podaj nazwę osiedla lub rejonu (min. 3 znaki)'),
  exactAddress: z
    .string()
    .trim()
    .min(5, 'Podaj dokładny adres odbioru i telefon (min. 5 znaków)'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

