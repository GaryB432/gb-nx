export type Section = string[];

export function codeBlock(block: string[], lang: string): string[] {
  return ['```'.concat(lang), ...block, '```'];
}

export function bulletList(block: string[]): string[] {
  return block.map((l) => '- '.concat(l));
}

export function table(headings: string[], body: string[][]): string[] {
  const tline = (parts: string[]) =>
    ['', ...parts, ''].join(' | ').slice(1, -1);
  const dashes = Array(headings.length).fill('---');
  const result = [headings, dashes, ...body].map(tline);
  return result;
}

export function headingLevel(line: string): number {
  let lvl = 0;
  for (const c of line) {
    if (c === '#') {
      lvl += 1;
    } else {
      break;
    }
  }
  return lvl;
}

export function h1(s: string): string {
  return h(s, 1);
}

export function h2(s: string): string {
  return h(s, 2);
}

export function h3(s: string): string {
  return h(s, 3);
}

function h(s: string, level: number): string {
  return '#'.repeat(level).concat(' ').concat(s);
}

export class Document {
  public readonly sections: Section[] = [];

  public constructor(lines: string[]) {
    const block: string[] = [];
    let last = '';
    for (const line of lines) {
      const h = headingLevel(line);
      if (h > 0) {
        if (block.length) {
          this.sections.push(block.splice(0, block.length));
        }
        block.push(line);
        last = '';
        block.push(last);
      } else {
        if (line === '') {
          if (last !== '') {
            block.push(line);
            last = line;
          }
        } else {
          block.push(line);
          last = line;
        }
      }
    }

    if (block.length) {
      this.sections.push(block.splice(0, block.length));
    }
  }

  public outline(): string[] {
    return this.sections.map((s) => s[0]);
  }

  public print(breakLine = ''): string[] {
    return this.sections.map((s) => [...s, breakLine]).flat();
  }
}
