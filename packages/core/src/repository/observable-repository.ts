import { type Repository } from './repository.js';
import { type Subject } from '../observer/index.js';
import { type Identifiable } from '../id.js';

export interface ObservableRepository<T extends Identifiable>
  extends Repository<T> {
  readonly onAdd: Subject<T>;

  readonly onUpdate: Subject<T>;

  readonly onDelete: Subject<T>;
}
