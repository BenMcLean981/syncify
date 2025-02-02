import { type Memento } from '../memento/index.js';

export interface Command<TState> extends Memento {
  apply(state: TState): TState;
}
