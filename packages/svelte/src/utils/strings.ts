export function greet(name: string): string {
  return `strings says: hello to ${name}`;
}
export function add(a: number, b: number): number {
  return a + b;
}
export const meaning = {
  life: 42,
};

export function stringInsert(
  source: Readonly<string>,
  pos: number,
  commaNeeded: boolean,
  matter: string
): string {
  return [
    source.slice(0, pos),
    commaNeeded ? ',' : '',
    matter,
    source.slice(pos),
  ].join('');
}
