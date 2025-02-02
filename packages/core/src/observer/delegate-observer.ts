import type { Observer } from './observer.ts';
import { type Subject } from './subject.js';

export class DelegateObserver<T> implements Observer<T> {
  private readonly _fn: (data: T) => Promise<void>;

  public constructor(fn: (data: T) => Promise<void>) {
    this._fn = fn;
  }

  public async notify(subject: Subject<T>): Promise<void> {
    if (subject.data === null) {
      throw new Error('No data.');
    }

    await this._fn(subject.data);
  }
}
