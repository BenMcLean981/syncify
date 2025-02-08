import type { Snapshot } from './snapshot';

export interface Memento {
  getSnapshot(): Snapshot;
}
