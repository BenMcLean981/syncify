import { type Subject } from "./subject";

export interface Observer<T> {
  notify(subject: Subject<T>): Promise<void>;
}
