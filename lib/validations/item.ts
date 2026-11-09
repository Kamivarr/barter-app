import { z } from 'zod';

export const itemFormSchema = z.object({
  title: z
    .string()
    .min(5, 'Tytuł musi mieć min. 5 znaków')
    .max(80, 'Tytuł może mieć maksymalnie 80 znaków'),
  categoryId: z.string().min(1, 'Wybierz kategorię sprzętu'),
  condition: z.enum(['NEW', 'GOOD', 'FAIR', 'WELL_USED'], {
    errorMap: () => ({ message: 'Wybierz poprawny stan techniczny' }),
  }),
  description: z
    .string()
    .min(20, 'Opis musi zawierać min. 20 znaków')
    .max(2000, 'Opis może mieć maksymalnie 2000 znaków'),
  dailyPrice: z.coerce
    .number({ invalid_type_error: 'Podaj poprawną kwotę' })
    .min(5, 'Minimalna cena za dobę to 5 PLN')
    .max(5000, 'Maksymalna cena za dobę to 5000 PLN'),
  depositAmount: z.coerce
    .number({ invalid_type_error: 'Podaj poprawną kwotę kaucji' })
    .min(0, 'Kaucja nie może być ujemna')
    .max(10000, 'Maksymalna kaucja to 10 000 PLN'),
  neighborLoc: z
    .string()
    .min(3, 'Podaj publiczną lokalizację (np. osiedle, min. 3 znaki)')
    .max(60, 'Lokalizacja może mieć maksymalnie 60 znaków'),
  rentalRules: z
    .string()
    .max(1000, 'Regulamin może mieć maksymalnie 1000 znaków')
    .optional()
    .or(z.literal('')),
  images: z
    .array(z.string().url('Podaj poprawny adres URL zdjęcia'))
    .min(1, 'Dodaj przynajmniej jedno zdjęcie przedmiotu'),
});

export type ItemFormData = z.infer<typeof itemFormSchema>;

// Częściowe schematy do walidacji poszczególnych kroków formularza
export const step1Schema = itemFormSchema.pick({
  title: true,
  categoryId: true,
  condition: true,
  description: true,
});

export const step2Schema = itemFormSchema.pick({
  images: true,
  dailyPrice: true,
  depositAmount: true,
});

export const step3Schema = itemFormSchema.pick({
  neighborLoc: true,
  rentalRules: true,
});
