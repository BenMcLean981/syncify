import { TOL } from '../tol.js';
import { isEqualable } from './equalable.js';

export type EqualityChecker<T> = (t1: T, t2: T, tol?: number) => boolean;

export const defaultEqualityChecker: EqualityChecker<unknown> = (
  t1,
  t2,
  tol = TOL
) => {
  if (isEqualable(t1)) {
    return t1.equals(t2, tol);
  } else {
    return t1 === t2;
  }
};
