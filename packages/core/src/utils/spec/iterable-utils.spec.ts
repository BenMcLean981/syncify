import { describe, expect, it } from 'vitest';
import { takeWhile } from '../iterable-utils.js';
import { equalInOrder, isEmpty } from '../iterable-checks.js';

describe('takeWhile', () => {
  it('Returns empty for empty and continueCb returns false.', () => {
    const actual = takeWhile([], () => false);

    expect(isEmpty(actual)).toBe(true);
  });

  it('Returns empty for empty and continueCb returns true.', () => {
    const actual = takeWhile([], () => true);

    expect(isEmpty(actual)).toBe(true);
  });

  it('Returns empty for not empty and continueCb returns false.', () => {
    const actual = takeWhile([1, 2, 3], () => false);

    expect(isEmpty(actual)).toBe(true);
  });

  it('Returns array for continueCb returns true.', () => {
    const arr = [1, 2, 3];
    const actual = takeWhile(arr, () => true);

    expect(equalInOrder(actual, arr)).toBe(true);
  });

  it('Stops when check returns false.', () => {
    const arr = [1, 2, 3, 4, 5];

    const actual = takeWhile(arr, (n) => n !== 4);
    const expected = [1, 2, 3];

    expect(equalInOrder(actual, expected)).toBe(true);
  });
});
