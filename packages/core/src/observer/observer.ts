import {type Subject } from "./subject.js";

export interface Observer<T> {
  notify(subject: Subject<T>): Promise<void>;
}
