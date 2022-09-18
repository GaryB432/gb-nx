export function stringInsert(
  source: Readonly<string>,
  pos: number,
  useComma: boolean,
  matter: string
): string {
  return [
    source.slice(0, pos),
    useComma ? ',' : '',
    matter,
    source.slice(pos),
  ].join('');
}
