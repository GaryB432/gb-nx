import { makeCommandDeclarations } from './typescript';

describe('typescript', () => {
  describe('makeCommandDeclarations', () => {
    test('make', () => {
      expect(makeCommandDeclarations('my-app', {}, {})).toMatchInlineSnapshot(`
        "/* This is a generated file. Make changes to cli.config.json and run "nx sync my-app" */
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
        "/* This is a generated file. Make changes to cli.config.json and run "nx sync my-app" */
        import { type SharedOptions } from '../shared';
        interface Options extends SharedOptions {
            a: unknown;
            n: number;
        }
        type CommandArgs = {
            b: boolean;
            opts: Options;
            s: string;
        };
        "
      `);
    });

    test('missing things a', () => {
      expect(
        makeCommandDeclarations(
          'my-app',
          { s: { kind: 'string' }, b: {} },
          { n: { kind: 'number' }, a: { kind: 'unknown' } }
        )
      ).toMatchInlineSnapshot(`
        "/* This is a generated file. Make changes to cli.config.json and run "nx sync my-app" */
        import { type SharedOptions } from '../shared';
        interface Options extends SharedOptions {
            a: unknown;
            n: number;
        }
        type CommandArgs = {
            b: unknown;
            opts: Options;
            s: string;
        };
        "
      `);
    });

    test('missing things b', () => {
      expect(
        makeCommandDeclarations(
          'my-app',
          { s: { kind: 'string' }, b: {} },
          { n: {}, a: { kind: 'boolean' } }
        )
      ).toMatchInlineSnapshot(`
        "/* This is a generated file. Make changes to cli.config.json and run "nx sync my-app" */
        import { type SharedOptions } from '../shared';
        interface Options extends SharedOptions {
            a: boolean;
            n: unknown;
        }
        type CommandArgs = {
            b: unknown;
            opts: Options;
            s: string;
        };
        "
      `);
    });
  });

  test('disallow opts parameter', () => {
    expect(() =>
      makeCommandDeclarations(
        'my-app',
        { s: { kind: 'string' }, b: {}, opts: {} },
        { n: {}, a: { kind: 'boolean' } }
      )
    ).toThrow('opts is a reserved parameter name');
  });
});
