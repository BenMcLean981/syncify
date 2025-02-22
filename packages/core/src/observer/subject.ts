import { type Observer } from './observer';

export interface Subject<T> {
  readonly data: T | null;

  attach(observer: Observer<T>): void;

  detach(observer: Observer<T>): void;

  update(data: T): Promise<void>;
}
