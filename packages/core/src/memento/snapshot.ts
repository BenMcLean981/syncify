export type SnapshotValue =
  | number
  | string
  | null
  | undefined
  | boolean
  | ReadonlyArray<SnapshotValue>
  | Snapshot;

export interface Snapshot {
  [key: string]: SnapshotValue;
}
