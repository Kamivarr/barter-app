import { z } from 'zod';

export const createRentalSchema = z.object({
  itemId: z.string().min(1, 'Identyfikator sprzętu jest wymagany'),
  startDate: z.string().min(10, 'Wybierz datę początkową'),
  endDate: z.string().min(10, 'Wybierz datę końcową'),
  blikCode: z
    .string()
    .length(6, 'Kod BLIK musi zawierać dokładnie 6 cyfr')
    .regex(/^\d{6}$/, 'Kod BLIK może składać się wyłącznie z cyfr')
    .optional()
    .or(z.literal('')),
});

export type CreateRentalInput = z.infer<typeof createRentalSchema>;

export const respondRentalSchema = z.object({
  rentalId: z.string().min(1, 'Identyfikator rezerwacji jest wymagany'),
  decision: z.enum(['APPROVE', 'CANCEL'], {
    errorMap: () => ({ message: 'Niepoprawna decyzja (dozwolone: APPROVE, CANCEL)' }),
  }),
});

export const verifyPinSchema = z.object({
  rentalId: z.string().min(1, 'Identyfikator rezerwacji jest wymagany'),
  enteredPin: z
    .string()
    .length(4, 'Kod PIN musi mieć dokładnie 4 cyfry')
    .regex(/^\d{4}$/, 'Kod PIN może zawierać wyłącznie cyfry'),
});

export const reviewSchema = z.object({
  rentalRequestId: z.string().min(1, 'Identyfikator wypożyczenia jest wymagany'),
  rating: z.coerce
    .number()
    .min(1, 'Wybierz ocenę w skali od 1 do 5 gwiazdek')
    .max(5, 'Maksymalna ocena to 5 gwiazdek'),
  comment: z
    .string()
    .min(5, 'Komentarz musi zawierać co najmniej 5 znaków')
    .max(500, 'Komentarz może zawierać maksymalnie 500 znaków'),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
