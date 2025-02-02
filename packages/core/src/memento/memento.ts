import type { Snapshot } from './snapshot.js';

export interface Memento {
  getSnapshot(): Snapshot;
}
