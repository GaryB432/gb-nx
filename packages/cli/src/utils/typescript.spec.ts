import { makeCommandDeclarations } from './typescript';

describe('typescript', () => {
  describe('makeCommandDeclarations', () => {
    test('make', () => {
      expect(makeCommandDeclarations({}, {})).toMatchInlineSnapshot(`
        "import { type SharedOptions } from '../shared';
        /* eslint-disable @typescript-eslint/no-empty-interface */
        interface Options extends SharedOptions {
        }
        type CommandArgs = {
            opts: Options;
        };
        "
      `);
    });
    test('full', () => {
      expect(
        makeCommandDeclarations(
          { s: { kind: 'string' }, b: { kind: 'boolean' } },
          { n: { kind: 'number' }, a: { kind: 'unknown' } }
        )
      ).toMatchInlineSnapshot(`
        "import { type SharedOptions } from '../shared';
        interface Options extends SharedOptions {
            a: unknown;
            n: number;
        }
        type CommandArgs = {
            b: boolean;
            s: string;
            opts: Options;
        };
        "
      `);
    });
  });
});
