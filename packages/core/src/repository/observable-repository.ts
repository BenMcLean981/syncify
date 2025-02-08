import { type Repository } from './repository';
import { type Subject } from '../observer';
import { type Identifiable } from '../id';

export interface ObservableRepository<T extends Identifiable>
  extends Repository<T> {
  readonly onAdd: Subject<T>;

  readonly onUpdate: Subject<T>;

  readonly onDelete: Subject<T>;
}
