'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  Camera,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Info,
  Loader2,
} from 'lucide-react';
import {
  ItemFormData,
  step1Schema,
  step2Schema,
  step3Schema,
  itemFormSchema,
} from '@/lib/validations/item';
import { createItemAction, updateItemAction } from '@/app/actions/item.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  TOOL_CONDITION_LABELS,
  ToolCondition,
} from '@/types/domain';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface MultiStepItemFormProps {
  categories: CategoryOption[];
  initialData?: {
    id: string;
    title: string;
    categoryId: string;
    condition: string;
    description: string;
    dailyPrice: number;
    depositAmount: number;
    neighborLoc: string;
    rentalRules?: string | null;
    imagesJson?: string;
  };
  isEdit?: boolean;
}

const CONDITION_OPTIONS: { id: ToolCondition; label: string; desc: string }[] = [
  {
    id: 'NEW',
    label: TOOL_CONDITION_LABELS.NEW,
    desc: 'Sprzęt fabrycznie nowy lub użyty raz, brak jakichkolwiek śladów.',
  },
  {
    id: 'GOOD',
    label: TOOL_CONDITION_LABELS.GOOD,
    desc: 'W pełni sprawny technicznie, regularnie konserwowany, drobne rysy.',
  },
  {
    id: 'FAIR',
    label: TOOL_CONDITION_LABELS.FAIR,
    desc: 'Działa bez zarzutu, widoczne normalne ślady intensywnej pracy.',
  },
  {
    id: 'WELL_USED',
    label: TOOL_CONDITION_LABELS.WELL_USED,
    desc: 'Mocno wyeksploatowany wizualnie, w 100% zdatny do bezpiecznego użytku.',
  },
];

const PRESET_SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80',
];

export function MultiStepItemForm({
  categories,
  initialData,
  isEdit = false,
}: MultiStepItemFormProps) {
  const router = useRouter();

  // Krok formularza: 1, 2, 3
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Stan danych formularza
  const initialImages: string[] = (() => {
    if (initialData?.imagesJson) {
      try {
        const parsed = JSON.parse(initialData.imagesJson);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // Ignoruj błąd parsowania
      }
    }
    return [PRESET_SAMPLE_IMAGES[0]];
  })();

  const [formData, setFormData] = useState<ItemFormData>({
    title: initialData?.title || '',
    categoryId: initialData?.categoryId || categories[0]?.id || '',
    condition: (initialData?.condition as ToolCondition) || 'GOOD',
    description: initialData?.description || '',
    dailyPrice: initialData?.dailyPrice || 40,
    depositAmount: initialData?.depositAmount ?? 100,
    neighborLoc: initialData?.neighborLoc || 'Rzeszów - Nowe Miasto',
    rentalRules:
      initialData?.rentalRules ||
      'Zwrot narzędzia w stanie oczyszczonym. Odbiór osobisty po okazaniu 4-cyfrowego kodu PIN.',
    images: initialImages,
  });

  // Dodawanie nowego zdjęcia po URL
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageError, setImageError] = useState('');

  // Błędy walidacji per pole
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // -------------------------------------------------------------------------
  // Kalkulacja zarobku
  // -------------------------------------------------------------------------
  const price = Number(formData.dailyPrice) || 0;
  const platformFee = Math.round(price * 0.15 * 100) / 100;
  const ownerNetPerDay = Math.round((price - platformFee) * 100) / 100;
  const weekendNet = Math.round(ownerNetPerDay * 2 * 100) / 100;
  const weekNet = Math.round(ownerNetPerDay * 7 * 100) / 100;

  // -------------------------------------------------------------------------
  // Walidacja kroków
  // -------------------------------------------------------------------------
  function validateCurrentStep(): boolean {
    setErrors({});
    setServerError('');

    if (currentStep === 1) {
      const result = step1Schema.safeParse({
        title: formData.title,
        categoryId: formData.categoryId,
        condition: formData.condition,
        description: formData.description,
      });

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const path = issue.path[0]?.toString();
          if (path && !fieldErrors[path]) {
            fieldErrors[path] = issue.message;
          }
        }
        setErrors(fieldErrors);
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      const result = step2Schema.safeParse({
        images: formData.images,
        dailyPrice: formData.dailyPrice,
        depositAmount: formData.depositAmount,
      });

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const path = issue.path[0]?.toString();
          if (path && !fieldErrors[path]) {
            fieldErrors[path] = issue.message;
          }
        }
        setErrors(fieldErrors);
        return false;
      }
      return true;
    }

    if (currentStep === 3) {
      const result = step3Schema.safeParse({
        neighborLoc: formData.neighborLoc,
        rentalRules: formData.rentalRules,
      });

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const path = issue.path[0]?.toString();
          if (path && !fieldErrors[path]) {
            fieldErrors[path] = issue.message;
          }
        }
        setErrors(fieldErrors);
        return false;
      }
      return true;
    }

    return true;
  }

  function handleNextStep() {
    if (validateCurrentStep()) {
      if (currentStep < 3) {
        setCurrentStep((prev) => (prev + 1) as 2 | 3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  function handlePrevStep() {
    if (currentStep > 1) {
      setErrors({});
      setCurrentStep((prev) => (prev - 1) as 1 | 2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // -------------------------------------------------------------------------
  // Obsługa zdjęć
  // -------------------------------------------------------------------------
  function handleAddImage() {
    setImageError('');
    const url = newImageUrl.trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setImageError('Adres URL zdjęcia musi rozpoczynać się od http:// lub https://');
      return;
    }

    if (formData.images.includes(url)) {
      setImageError('To zdjęcie zostało już dodane do listy.');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url],
    }));
    setNewImageUrl('');
  }

  function handleRemoveImage(index: number) {
    if (formData.images.length <= 1) {
      setImageError('Ogłoszenie musi posiadać przynajmniej jedno zdjęcie.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_: string, i: number) => i !== index),
    }));
  }

  function handleAddPresetImage(url: string) {
    if (!formData.images.includes(url)) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, url],
      }));
    }
  }

  // -------------------------------------------------------------------------
  // Wysłanie formularza
  // -------------------------------------------------------------------------
  async function handleSubmit() {
    // Pełna walidacja przed wysłaniem
    const fullValidation = itemFormSchema.safeParse(formData);
    if (!fullValidation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of fullValidation.error.issues) {
        const path = issue.path[0]?.toString();
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      setServerError('Uzupełnij wszystkie wymagane pola przed publikacją.');
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      if (isEdit && initialData?.id) {
        const res = await updateItemAction(initialData.id, formData);
        if (!res.success) {
          setServerError(res.message || 'Wystąpił błąd podczas zapisywania zmian.');
          if (res.fieldErrors) setErrors(res.fieldErrors);
          setIsSubmitting(false);
          return;
        }
        router.push(`/items/${initialData.id}`);
      } else {
        const res = await createItemAction(formData);
        if (!res.success || !res.data?.itemId) {
          setServerError(res.message || 'Wystąpił błąd podczas tworzenia ogłoszenia.');
          if (res.fieldErrors) setErrors(res.fieldErrors);
          setIsSubmitting(false);
          return;
        }
        router.push(`/items/${res.data.itemId}`);
      }
    } catch (err: unknown) {
      console.error('Błąd zapisu ogłoszenia:', err);
      const msg = err instanceof Error ? err.message : '';
      setServerError(msg || 'Nieoczekiwany błąd serwera. Spróbuj ponownie.');
      setIsSubmitting(false);
    }
  }

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* PASEK POSTĘPU KROKÓW */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 sm:p-5">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {/* Krok 1 */}
          <div
            onClick={() => currentStep > 1 && setCurrentStep(1)}
            className={`flex items-center gap-2 sm:gap-3 p-2 rounded-xl transition ${
              currentStep === 1
                ? 'bg-orange-600/15 border border-orange-500/30 text-orange-400'
                : currentStep > 1
                ? 'text-stone-300 hover:text-white cursor-pointer'
                : 'text-stone-500'
            }`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                currentStep > 1
                  ? 'bg-emerald-600 text-white'
                  : currentStep === 1
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'bg-stone-800 text-stone-400'
              }`}
            >
              {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider block opacity-70">
                Krok 1
              </span>
              <span className="text-xs sm:text-sm font-semibold truncate block">
                Podstawowe dane
              </span>
            </div>
          </div>

          {/* Krok 2 */}
          <div
            onClick={() => currentStep > 2 && setCurrentStep(2)}
            className={`flex items-center gap-2 sm:gap-3 p-2 rounded-xl transition ${
              currentStep === 2
                ? 'bg-orange-600/15 border border-orange-500/30 text-orange-400'
                : currentStep > 2
                ? 'text-stone-300 hover:text-white cursor-pointer'
                : 'text-stone-500'
            }`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                currentStep > 2
                  ? 'bg-emerald-600 text-white'
                  : currentStep === 2
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'bg-stone-800 text-stone-400'
              }`}
            >
              {currentStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider block opacity-70">
                Krok 2
              </span>
              <span className="text-xs sm:text-sm font-semibold truncate block">
                Zdjęcia i stawka
              </span>
            </div>
          </div>

          {/* Krok 3 */}
          <div
            className={`flex items-center gap-2 sm:gap-3 p-2 rounded-xl transition ${
              currentStep === 3
                ? 'bg-orange-600/15 border border-orange-500/30 text-orange-400'
                : 'text-stone-500'
            }`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                currentStep === 3
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'bg-stone-800 text-stone-400'
              }`}
            >
              3
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider block opacity-70">
                Krok 3
              </span>
              <span className="text-xs sm:text-sm font-semibold truncate block">
                Lokalizacja i zasady
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KOMUNIKAT BŁĘDU SERWEROWEGO */}
      {serverError && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Błąd zapisu ogłoszenia</p>
            <p className="text-xs text-red-300/90">{serverError}</p>
          </div>
        </div>
      )}

      {/* ZAWARTOŚĆ FORMULARZA PER KROK */}
      <Card className="border-stone-800 bg-stone-900/60">
        <CardContent className="p-5 sm:p-7 space-y-6">
          {/* ============================================================= */}
          {/* KROK 1: INFORMACJE PODSTAWOWE I STAN TECHNICZNY               */}
          {/* ============================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-orange-500" />
                  <span>Podstawowe informacje o sprzęcie</span>
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Wprowadź dokładną nazwę modelu, kategorię oraz określ stan techniczny narzędzia.
                </p>
              </div>

              {/* Tytuł ogłoszenia */}
              <Input
                label="Tytuł ogłoszenia i model urządzenia *"
                placeholder="np. Wiertarka udarowa DeWalt DWD024S 650W + zestaw wierteł"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                error={errors.title}
                helperText="Minimum 5 znaków. Podaj markę i kluczowe parametry techniczne."
              />

              {/* Wybór kategorii */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300 block">
                  Kategoria sprzętu *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {categories.map((cat) => {
                    const isSelected = formData.categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, categoryId: cat.id }))
                        }
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-orange-600/15 border-orange-500 text-white ring-1 ring-orange-500'
                            : 'bg-stone-950/80 border-stone-800 text-stone-300 hover:border-stone-700 hover:bg-stone-900'
                        }`}
                      >
                        <span className="text-lg">{cat.icon || '📦'}</span>
                        <span className="text-xs font-semibold">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.categoryId && (
                  <p className="text-xs text-red-400 mt-1">{errors.categoryId}</p>
                )}
              </div>

              {/* Stan techniczny */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-300 block">
                  Stan techniczny narzędzia *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CONDITION_OPTIONS.map((opt) => {
                    const isSelected = formData.condition === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, condition: opt.id }))
                        }
                        className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                          isSelected
                            ? 'bg-orange-600/15 border-orange-500 ring-1 ring-orange-500'
                            : 'bg-stone-950/80 border-stone-800 hover:border-stone-700 hover:bg-stone-900'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center ${
                            isSelected
                              ? 'border-orange-500 bg-orange-600'
                              : 'border-stone-600'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">
                              {opt.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                            {opt.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {errors.condition && (
                  <p className="text-xs text-red-400 mt-1">{errors.condition}</p>
                )}
              </div>

              {/* Opis narzędzia */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-300">
                    Opis zestawu i wyposażenia *
                  </label>
                  <span className="text-[10px] text-stone-500">
                    {formData.description.length} / 2000 znaków (min. 20)
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Opisz, co wchodzi w skład zestawu (walizka, klucze, wiertła, baterie), jak używać sprzętu oraz jakie ma parametry mocy..."
                  className={`w-full rounded-xl bg-stone-950 border px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                    errors.description ? 'border-red-500' : 'border-stone-800'
                  }`}
                />
                {errors.description && (
                  <p className="text-xs text-red-400">{errors.description}</p>
                )}
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* KROK 2: ZDJĘCIA, STAWKA DOBOWA I KAUCJA                      */}
          {/* ============================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-orange-500" />
                  <span>Galeria zdjęć i finanse</span>
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Dodaj zdjęcia sprzętu, określ stawkę dobową oraz opcjonalną kaucję zwrotną.
                </p>
              </div>

              {/* Lista zdjęć */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-stone-300 block">
                  Zdjęcia sprzętu (min. 1 zdjęcie) *
                </label>

                {/* Siatka miniatur */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {formData.images.map((imgUrl: string, idx: number) => (
                    <div
                      key={idx}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-stone-800 bg-stone-950"
                    >
                      <img
                        src={imgUrl}
                        alt={`Zdjęcie ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <div className="absolute top-2 left-2 bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                          Główne
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-stone-950/80 text-stone-300 hover:text-red-400 hover:bg-stone-900 border border-stone-700 opacity-90 sm:opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        title="Usuń zdjęcie"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Formularz dodawania URL */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Wklej bezpośredni adres URL zdjęcia (https://...)"
                    value={newImageUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewImageUrl(e.target.value)
                    }
                    className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddImage}
                    className="shrink-0"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Dodaj
                  </Button>
                </div>

                {imageError && (
                  <p className="text-xs text-red-400">{imageError}</p>
                )}
                {errors.images && (
                  <p className="text-xs text-red-400">{errors.images}</p>
                )}

                {/* Szybkie presety próbne */}
                <div className="pt-1">
                  <span className="text-[11px] text-stone-500 block mb-1.5">
                    Lub wybierz zdjęcie wzorcowe sprzętu warsztatowego:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_SAMPLE_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddPresetImage(preset)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700 cursor-pointer transition"
                      >
                        + Szablon {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Parametry finansowe */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Input
                  label="Stawka dobowa (PLN / doba) *"
                  type="number"
                  min={5}
                  max={5000}
                  value={formData.dailyPrice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({
                      ...prev,
                      dailyPrice: Number(e.target.value),
                    }))
                  }
                  error={errors.dailyPrice}
                  helperText="Od 5 do 5000 PLN. Standard w Rzeszowie to 30-70 zł."
                />

                <Input
                  label="Kaucja zwrotna (PLN)"
                  type="number"
                  min={0}
                  max={10000}
                  value={formData.depositAmount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({
                      ...prev,
                      depositAmount: Number(e.target.value),
                    }))
                  }
                  error={errors.depositAmount}
                  helperText="0 PLN oznacza brak kaucji. Kaucja jest zwracana po oddaniu sprzętu."
                />
              </div>

              {/* Dynamiczny kalkulator zarobku */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>Kalkulator Twojego zysku (Platforma Barter)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800/80">
                    <span className="text-stone-400 text-[11px] block">Stawka klienta</span>
                    <span className="text-base font-bold text-white">{price} zł</span>
                    <span className="text-[10px] text-stone-500 block">za dobę</span>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800/80">
                    <span className="text-stone-400 text-[11px] block">Prowizja (15%)</span>
                    <span className="text-base font-bold text-orange-400">-{platformFee} zł</span>
                    <span className="text-[10px] text-stone-500 block">obsługa platformy</span>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800/80">
                    <span className="text-stone-400 text-[11px] block">Twój zysk (doba)</span>
                    <span className="text-base font-extrabold text-emerald-400">{ownerNetPerDay} zł</span>
                    <span className="text-[10px] text-emerald-500/80 block">na rękę</span>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800/80">
                    <span className="text-stone-400 text-[11px] block">Weekend (2 doby)</span>
                    <span className="text-base font-extrabold text-emerald-400">{weekendNet} zł</span>
                    <span className="text-[10px] text-emerald-500/80 block">szacunek</span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-400 flex items-center gap-1.5 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>
                    Kaucja zwrotna ({formData.depositAmount} zł) trafia na depozyt i nie jest pomniejszana o prowizję.
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* KROK 3: LOKALIZACJA, REGULAMIN I PODSUMOWANIE                */}
          {/* ============================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <span>Lokalizacja sąsiedzka i podsumowanie oferty</span>
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Wskaż osiedle lub rejon odbioru oraz zasady, na jakich udostępniasz sprzęt sąsiadom.
                </p>
              </div>

              {/* Przybliżona lokalizacja */}
              <Input
                label="Przybliżona lokalizacja sąsiedzka (Osiedle / Rejon) *"
                placeholder="np. Rzeszów - Nowe Miasto, okolice ul. Podwisłocze"
                value={formData.neighborLoc}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({ ...prev, neighborLoc: e.target.value }))
                }
                error={errors.neighborLoc}
                helperText="Publicznie widoczne w katalogu. Dokładny adres z numerem lokalu poznaje wyłącznie sąsiad po zatwierdzeniu rezerwacji."
              />

              {/* Regulamin wypożyczenia */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-300">
                    Zasady użytkowania i warunki zwrotu (opcjonalnie)
                  </label>
                  <span className="text-[10px] text-stone-500">
                    {formData.rentalRules?.length || 0} / 1000 znaków
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={formData.rentalRules || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData((prev) => ({ ...prev, rentalRules: e.target.value }))
                  }
                  placeholder="np. Odbiór w godz. 17:00-20:00. Zakaz używania do mieszania ciężkich zapraw murarskich. Zwrot w stanie oczyszczonym."
                  className="w-full rounded-xl bg-stone-950 border border-stone-800 px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                />
              </div>

              {/* PODGLĄD OFERTY PRZED PUBLIKACJĄ */}
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-3">
                  Podgląd ogłoszenia w katalogu:
                </span>

                <div className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-36 h-36 rounded-xl overflow-hidden bg-stone-900 border border-stone-800 shrink-0 relative">
                      {formData.images[0] ? (
                        <img
                          src={formData.images[0]}
                          alt={formData.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-600">
                          <Wrench className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="primary">
                          {selectedCategory?.name || 'Sprzęt'}
                        </Badge>
                        <Badge variant="default">
                          {TOOL_CONDITION_LABELS[formData.condition as ToolCondition] || formData.condition}
                        </Badge>
                      </div>

                      <h4 className="font-bold text-white text-base">
                        {formData.title || 'Brak tytułu'}
                      </h4>

                      <p className="text-xs text-stone-400 line-clamp-2">
                        {formData.description || 'Brak opisu'}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-stone-400 pt-1">
                        <span className="flex items-center gap-1 text-stone-300">
                          <MapPin className="w-3.5 h-3.5 text-orange-500" />
                          {formData.neighborLoc}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-orange-400 text-sm">
                          {formData.dailyPrice} zł / doba
                        </span>
                        {formData.depositAmount > 0 && (
                          <span className="text-stone-400 text-xs">
                            (Kaucja: {formData.depositAmount} zł)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRZYCISKI NAWIGACJI MIĘDZY KROKAMI */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-800/80">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handlePrevStep}
                disabled={isSubmitting}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Wstecz
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleNextStep}
              >
                Dalej <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="success"
                size="lg"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                className="shadow-lg shadow-emerald-600/25"
              >
                {isEdit ? 'Zapisz zmiany w ogłoszeniu' : 'Opublikuj ogłoszenie'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
