import { type Memento } from '../memento';

export interface Command<TState> extends Memento {
  apply(state: TState): TState;
}
