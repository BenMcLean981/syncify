import type { Observer } from './observer.ts';
import type { Subject } from './subject.ts';

export class SubjectImp<T> implements Subject<T> {
  private _observers: ReadonlyArray<Observer<T>> = [];

  public constructor(data?: T) {
    this._data = data ?? null;
  }

  private _data: T | null;

  public get data(): T | null {
    return this._data;
  }

  public attach(observer: Observer<T>): void {
    this._observers = [...this._observers, observer];
  }

  public detach(observer: Observer<T>): void {
    this._observers = this._observers.filter((o) => o !== observer);
  }

  public async update(data: T): Promise<void> {
    this._data = data;

    this._observers.forEach((o) => o.notify(this));
  }
}
