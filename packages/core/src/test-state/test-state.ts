import type { Memento, Snapshot } from '../memento/index.js';
import type { Equalable } from '../equality/index.js';

export class TestState implements Memento, Equalable {
  private readonly _value: number;

  public constructor(value: number) {
    this._value = value;
  }

  public get value(): number {
    return this._value;
  }

  public static makeFromSnapshot(snapshot: TestStateSnapshot): TestState {
    return new TestState(snapshot.value);
  }

  public getSnapshot(): TestStateSnapshot {
    return {
      value: this.value,
    };
  }

  public equals(other: unknown) {
    if (other instanceof TestState) {
      return this.value === other.value;
    } else {
      return false;
    }
  }
}

interface TestStateSnapshot extends Snapshot {
  value: number;
}
