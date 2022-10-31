import { makeCommandDeclarations } from './typescript';

describe('typescript', () => {
  describe('makeCommandDeclarations', () => {
    test('make', () => {
      expect(makeCommandDeclarations('my-app', {}, {})).toMatchInlineSnapshot(`
        "/* This is a generated file. Make changes to cli.config.json and run \\"nx sync my-app\\" */
        import { type SharedOptions } from '../shared';
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
          'my-app',
          { s: { kind: 'string' }, b: { kind: 'boolean' } },
          { n: { kind: 'number' }, a: { kind: 'unknown' } }
        )
      ).toMatchInlineSnapshot(`
        "/* This is a generated file. Make changes to cli.config.json and run \\"nx sync my-app\\" */
        import { type SharedOptions } from '../shared';
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
