'use client';

import React, { useState } from 'react';
import { Star, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { createReviewAction } from '@/app/actions/rental.actions';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  rentalRequestId: string;
  itemTitle: string;
  onSuccess?: () => void;
}

export function ReviewModal({
  isOpen,
  onClose,
  rentalRequestId,
  itemTitle,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');

    if (comment.trim().length < 5) {
      setErrorMessage('Komentarz musi zawierać co najmniej 5 znaków.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createReviewAction({
        rentalRequestId,
        rating,
        comment: comment.trim(),
      });

      if (!res.success) {
        setErrorMessage(res.message || 'Wystąpił błąd podczas zapisywania recenzji.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setErrorMessage(msg || 'Błąd połączenia. Spróbuj ponownie.');
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Wystaw opinię i ocenę"
      description={`Podziel się wrażeniami z wypożyczenia: ${itemTitle}`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Gwiazdki 1-5 */}
        <div className="space-y-2 text-center py-2">
          <label className="text-xs font-semibold text-stone-300 block">
            Jak oceniasz stan sprzętu i współpracę z sąsiadem?
          </label>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 rounded-lg hover:scale-110 transition cursor-pointer"
              >
                <Star
                  className={`w-8 h-8 transition ${
                    (hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-stone-700'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-amber-400 block pt-1">
            {rating === 5 && '⭐️⭐️⭐️⭐️⭐️ Rewelacja! Sprzęt w doskonałym stanie'}
            {rating === 4 && '⭐️⭐️⭐️⭐️ Bardzo dobrze, drobne uwagi'}
            {rating === 3 && '⭐️⭐️⭐️ W porządku, sprzęt spełnił zadanie'}
            {rating === 2 && '⭐️⭐️ Słabo, narzędzie wymaga konserwacji'}
            {rating === 1 && '⭐️ Zdecydowanie nie polecam'}
          </span>
        </div>

        {/* Komentarz */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-300">
              Twój komentarz dla społeczności *
            </label>
            <span className="text-[10px] text-stone-500">
              {comment.length} / 500 znaków (min. 5)
            </span>
          </div>
          <textarea
            rows={4}
            value={comment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
            placeholder="Napisz, jak sprawdziło się narzędzie, czy kontakt z właścicielem był sprawny oraz czy polecasz ten sprzęt sąsiadom..."
            className="w-full rounded-xl bg-stone-950 border border-stone-800 px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Dodaj opinię
          </Button>
        </div>
      </form>
    </Modal>
  );
}
