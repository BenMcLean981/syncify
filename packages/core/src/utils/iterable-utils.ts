export function takeWhile<T>(
  it: Iterable<T>,
  continueCb: (t: T) => boolean
): Iterable<T> {
  const iterator = it[Symbol.iterator]();

  return {
    [Symbol.iterator]: () => {
      return {
        next(): IteratorResult<T, unknown> {
          const { value, done } = iterator.next();

          if (done) {
            return { value, done };
          } else if (!continueCb(value)) {
            return { value, done: true };
          } else {
            return { value, done: false };
          }
        },
      };
    },
  };
}
