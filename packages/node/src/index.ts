import * as fs from 'node:fs';

export function add(a: number, b: number): number {
  fs.writeFileSync('foo', JSON.stringify(a));

  return a + b;
}
