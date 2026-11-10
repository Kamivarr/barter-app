import test from 'node:test';
import assert from 'node:assert/strict';

import {
  computeRentalPricing,
  computeAverageRating,
  isToolCondition,
  isRentalStatus,
  parseImagesJson,
  getFirstImage,
  TOOL_CONDITION_LABELS,
} from '../types/domain.ts';

test('computeRentalPricing - model prowizyjny 15% platformy Barter', () => {
  // Test 1: 1 doba, stawka 100 PLN, kaucja 50 PLN
  const p1 = computeRentalPricing(100, 1, 50);
  assert.equal(p1.ownerAmount, 100);
  assert.equal(p1.commissionAmount, 15);
  assert.equal(p1.depositAmount, 50);
  assert.equal(p1.totalPaid, 165);

  // Test 2: 3 doby, stawka 45 PLN, kaucja 100 PLN
  const p2 = computeRentalPricing(45, 3, 100);
  assert.equal(p2.ownerAmount, 135);
  assert.equal(p2.commissionAmount, 20.25);
  assert.equal(p2.depositAmount, 100);
  assert.equal(p2.totalPaid, 255.25);

  // Test 3: Kaucja zerowa
  const p3 = computeRentalPricing(60, 2, 0);
  assert.equal(p3.ownerAmount, 120);
  assert.equal(p3.commissionAmount, 18);
  assert.equal(p3.depositAmount, 0);
  assert.equal(p3.totalPaid, 138);
});

test('computeAverageRating - poprawność zaokrągleń i brak recenzji', () => {
  // Brak recenzji -> null
  assert.equal(computeAverageRating([]), null);

  // Średnia 4.6666... -> 4.7
  const reviews1 = [{ rating: 5 }, { rating: 5 }, { rating: 4 }];
  assert.equal(computeAverageRating(reviews1), 4.7);

  // Średnia 5.0
  const reviews2 = [{ rating: 5 }, { rating: 5 }];
  assert.equal(computeAverageRating(reviews2), 5.0);
});

test('Type guards - weryfikacja statusów wypożyczeń i stanów narzędzi', () => {
  assert.equal(isToolCondition('NEW'), true);
  assert.equal(isToolCondition('GOOD'), true);
  assert.equal(isToolCondition('FAIR'), true);
  assert.equal(isToolCondition('WELL_USED'), true);
  assert.equal(isToolCondition('BROKEN'), false);

  assert.equal(isRentalStatus('PENDING'), true);
  assert.equal(isRentalStatus('APPROVED'), true);
  assert.equal(isRentalStatus('ACTIVE'), true);
  assert.equal(isRentalStatus('RETURNED'), true);
  assert.equal(isRentalStatus('CANCELLED'), true);
  assert.equal(isRentalStatus('DELETED'), false);

  assert.equal(TOOL_CONDITION_LABELS.GOOD, 'Dobry');
});

test('parseImagesJson & getFirstImage - odporność na błędy parsowania', () => {
  const validJson = JSON.stringify(['https://example.com/drill1.jpg', 'https://example.com/drill2.jpg']);
  assert.deepEqual(parseImagesJson(validJson), [
    'https://example.com/drill1.jpg',
    'https://example.com/drill2.jpg',
  ]);
  assert.equal(getFirstImage(validJson), 'https://example.com/drill1.jpg');

  // Uszkodzony JSON nie rzuca błędu, zwraca pustą tablicę / domyślny fallback
  assert.deepEqual(parseImagesJson('corrupted-json'), []);
  assert.ok(getFirstImage('corrupted-json').startsWith('https://images.unsplash.com/'));
});
