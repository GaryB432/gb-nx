import { addProjectConfiguration, readNxJson, type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { createSvelteKitApp } from '../../utils/svelte';
import generator, { getSegments } from './generator';
import { type Schema } from './schema';

import '../../utils/testing/matchers';

describe('route generator', () => {
  let appTree: Tree;

  beforeEach(() => {
    appTree = setupTreeWithSvelteProject('apps', 'test', '4.0.0');
  });
  describe('basics', () => {
    it('works with default values', async () => {
      await skipFormatGenerator(appTree, {
        name: 'some-route',
        project: 'test',
      });
      expect(
        appTree.read('apps/test/src/routes/some-route/+page.svelte', 'utf-8')
      ).toMatchSnapshot();

      expect(
        appTree.read('apps/test/tests/some-route.spec.ts', 'utf-8')
      ).toMatchSnapshot(); // TODO should be js
    });
    it('skips tests', async () => {
      await skipFormatGenerator(appTree, {
        name: 'some-route-a',
        skipTests: true,
        project: 'test',
      });
      expect(appTree.children('apps/test/src/routes/some-route-a')).toEqual([
        '+page.svelte',
      ]);
      expect(appTree.children('apps/test/tests')).toEqual([]);
    });

    it('should add defaults to nx.json', async () => {
      await skipFormatGenerator(appTree, {
        name: 'hello',
        project: 'test',
        directory: 'a/b/c/d',
        language: 'ts',
        style: 'scss',
      });

      expect(readNxJson(appTree)!.generators!['@gb-nx/svelte:route']).toEqual({
        directory: 'a/b/c/d',
        language: 'ts',
        style: 'scss',
      });
    });
  });

  describe('--directory', () => {
    /* snapshots? */
    it('works with --directory="a/b/c"', async () => {
      await skipFormatGenerator(appTree, {
        name: 'some-route',
        directory: 'a/b/c',
        project: 'test',
      });
      expect(appTree.children('apps/test/src/routes/a/b/c/some-route')).toEqual(
        ['+page.svelte']
      );
      expect(appTree.children('apps/test/tests/a/b/c')).toEqual([
        'some-route.spec.ts', // TODO this should be js!
      ]);
    });
  });

  describe('--language', () => {
    /* snapshots? */
    it('works with --language=ts', async () => {
      await skipFormatGenerator(appTree, {
        name: 'some-route',
        language: 'ts',
        project: 'test',
      });
      expect(
        appTree.read('apps/test/src/routes/some-route/+page.svelte', 'utf-8')
      ).toMatchSnapshot();

      expect(
        appTree.read('apps/test/tests/some-route.spec.ts', 'utf-8')
      ).toMatchSnapshot();
    });
  });

  describe('--style', () => {
    /* snapshots? */

    it('works with --style=scss', async () => {
      await skipFormatGenerator(appTree, {
        name: 'some-route',
        language: 'ts',
        style: 'scss',
        project: 'test',
      });
      expect(appTree.children('apps/test/src/routes/some-route')).toEqual([
        '+page.svelte',
      ]);
      expect(
        appTree.read('apps/test/src/routes/some-route/+page.svelte', 'utf-8')
      ).toContain('<style lang="scss">');

      expect(appTree.children('apps/test/tests')).toEqual([
        'some-route.spec.ts',
      ]);
    });
  });

  describe('--load', () => {
    /* snapshots? */
    it('works with --load=shared', async () => {
      await skipFormatGenerator(appTree, {
        name: 'some-route',
        language: 'ts',
        load: 'universal',
        project: 'test',
      });
      expect(appTree.children('apps/test/src/routes/some-route')).toEqual([
        '+page.ts',
        '+page.svelte',
      ]);
      expect(
        appTree.read('apps/test/src/routes/some-route/+page.ts', 'utf-8')
      ).toMatchSnapshot();

      const pageSvelte = appTree.read(
        'apps/test/src/routes/some-route/+page.svelte',
        'utf-8'
      );
      expect(pageSvelte).not.toUseRunes();

      expect(appTree.children('apps/test/tests')).toEqual([
        'some-route.spec.ts',
      ]);
    });
    it('works with --load=server', async () => {
      await skipFormatGenerator(appTree, {
        name: 'some-route',
        language: 'ts',
        load: 'server',
        project: 'test',
      });
      expect(appTree.children('apps/test/src/routes/some-route')).toEqual([
        '+page.server.ts',
        '+page.svelte',
      ]);
      expect(
        appTree.read('apps/test/src/routes/some-route/+page.server.ts', 'utf-8')
      ).toMatchSnapshot();

      const pageSvelte = appTree.read(
        'apps/test/src/routes/some-route/+page.svelte',
        'utf-8'
      );
      expect(pageSvelte).not.toUseRunes();
      expect(pageSvelte).toContain('export let');

      expect(appTree.children('apps/test/tests')).toEqual([
        'some-route.spec.ts',
      ]);
    });
    it('works with --load=none', async () => {
      await skipFormatGenerator(appTree, {
        name: 'some-route',
        language: 'ts',
        load: 'none',
        project: 'test',
      });
      expect(appTree.children('apps/test/src/routes/some-route')).toEqual([
        '+page.svelte',
      ]);

      const pageSvelte = appTree.read(
        'apps/test/src/routes/some-route/+page.svelte',
        'utf-8'
      );
      expect(pageSvelte).not.toUseRunes();
      expect(pageSvelte).toContain('export let data');

      expect(appTree.children('apps/test/tests')).toEqual([
        'some-route.spec.ts',
      ]);
    });
  });

  describe('--runes', () => {
    describe('svelte 4', () => {
      beforeEach(() => {
        appTree = setupTreeWithSvelteProject('apps', 'test', '4.0.0');
      });
      it('works with --runes=undefined', async () => {
        await skipFormatGenerator(appTree, {
          name: 'some-route',
          project: 'test',
        });
        expect(
          appTree.read('apps/test/src/routes/some-route/+page.svelte', 'utf-8')
        ).toContain('let data = ');

        expect(appTree.children('apps/test/tests')).toEqual([
          'some-route.spec.ts',
        ]);
      });
      it('works with --no-runes', async () => {
        await skipFormatGenerator(appTree, {
          name: 'some-route',
          runes: false,
          project: 'test',
        });
        expect(
          appTree.read('apps/test/src/routes/some-route/+page.svelte', 'utf-8')
        ).toMatchSnapshot();

        expect(appTree.children('apps/test/tests')).toEqual([
          'some-route.spec.ts',
        ]);
      });
      it('works with --runes', async () => {
        //

        expect(async () => {
          await skipFormatGenerator(appTree, {
            name: 'some-route',
            runes: true,
            project: 'test',
          });
        }).rejects.toThrow(
          "runes feature requires svelte >= 5 (currently '4.0.0')"
        );
      });
    });

    describe('svelte 5', () => {
      beforeEach(() => {
        appTree = setupTreeWithSvelteProject('apps', 'test', '5.0.0');
      });
      it('works with --runes=undefined', async () => {
        await skipFormatGenerator(appTree, {
          name: 'some-route',
          project: 'test',
        });
        expect(
          appTree.read('apps/test/src/routes/some-route/+page.svelte', 'utf-8')
        ).toContain('let data = ');

        expect(appTree.children('apps/test/tests')).toEqual([
          'some-route.spec.ts',
        ]);
      });
      it('works with --no-runes', async () => {
        await skipFormatGenerator(appTree, {
          name: 'some-route',
          runes: false,
          project: 'test',
        });
        expect(
          appTree.read('apps/test/src/routes/some-route/+page.svelte', 'utf-8')
        ).toMatchSnapshot();

        expect(appTree.children('apps/test/tests')).toEqual([
          'some-route.spec.ts',
        ]);
      });
      it('works with --runes', async () => {
        await skipFormatGenerator(appTree, {
          name: 'some-route',
          runes: true,
          project: 'test',
        });
        expect(
          appTree.read('apps/test/src/routes/some-route/+page.svelte', 'utf-8')
        ).toUseRunes();
      });
    });
  });

  describe('getSegments', () => {
    it('gets segments', () => {
      expect(getSegments({ routePath: '[just]' })).toEqual([
        { path: 'just', paramType: undefined, isParam: true },
      ]);
      expect(getSegments({ routePath: '[ab]/cd/ef/[gh=atype]/ij' })).toEqual([
        { path: 'ab', paramType: undefined, isParam: true },
        { path: 'cd', paramType: undefined, isParam: false },
        { path: 'ef', paramType: undefined, isParam: false },
        { path: 'gh', paramType: 'atype', isParam: true },
        { path: 'ij', paramType: undefined, isParam: false },
      ]);
    });
  });
});

function skipFormatGenerator(tree: Tree, options: Schema): Promise<void> {
  return generator(tree, { ...options, skipFormat: true });
}

function setupTreeWithSvelteProject(
  directory: string,
  name: string,
  svelteVersion: string
): Tree {
  const appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  createSvelteKitApp(appTree, svelteVersion, {
    directory,
    name,
    skipFormat: true,
  });
  const root = directory.concat('/').concat(name);
  addProjectConfiguration(appTree, name, {
    root,
  });
  return appTree;
}
