import { addProjectConfiguration, type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { createSvelteKitApp } from '../../utils/svelte';
import generator, { getSegments } from './generator';
import { Schema } from './schema';

describe('route generator', () => {
  let appTree: Tree;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    createSvelteKitApp(appTree, '0', { directory: 'apps', name: 'test' });
    addProjectConfiguration(appTree, 'test', { root: 'apps/test' });
  });

  it('should run successfully', async () => {
    await generator(appTree, { name: 'tester', project: 'test' });

    const svelte = appTree
      .read('apps/test/src/routes/tester/+page.svelte')
      ?.toString();
    expect(svelte).toContain(' .container {');
    expect(svelte).toContain('{data.subject} works');
    expect(
      appTree.read('apps/test/tests/tester.spec.ts')?.toString()
    ).toContain("await page.goto('/tester');");
  });

  it('should use scss', async () => {
    await generator(appTree, {
      name: 'tester',
      project: 'test',
      style: 'scss',
    });

    const svelte = appTree
      .read('apps/test/src/routes/tester/+page.svelte')
      ?.toString();
    expect(svelte).toContain('<style lang="scss"');
  });

  it('should use ts', async () => {
    await generator(appTree, {
      name: 'tester',
      project: 'test',
      language: 'ts',
    });

    const svelte = appTree
      .read('apps/test/src/routes/tester/+page.svelte')
      ?.toString();
    expect(svelte).toContain("let data = $state({ subject: 'tester' });");
    expect(
      appTree.exists('apps/test/src/routes/tester/+page.server.ts')
    ).toBeFalsy();
    expect(
      appTree.exists('apps/test/src/routes/tester/+page.server.js')
    ).toBeFalsy();
    expect(appTree.exists('apps/test/src/routes/tester/+page.ts')).toBeFalsy();
    expect(appTree.exists('apps/test/src/routes/tester/+page.js')).toBeFalsy();
  });

  it('should make server', async () => {
    await generator(appTree, {
      name: 'tester',
      project: 'test',
      load: 'server',
    });

    const svelte = appTree
      .read('apps/test/src/routes/tester/+page.svelte')
      ?.toString();
    expect(svelte).toContain('export let data;');
    expect(
      appTree.exists('apps/test/src/routes/tester/+page.server.ts')
    ).toBeFalsy();
    expect(
      appTree.read('apps/test/src/routes/tester/+page.server.js')?.toString()
    ).toContain("return Promise.resolve('tester');");
  });

  it('should make client', async () => {
    await generator(appTree, {
      name: 'tester',
      project: 'test',
      load: 'shared',
    });

    const svelte = appTree
      .read('apps/test/src/routes/tester/+page.svelte')
      ?.toString();
    expect(svelte).toContain('export let data;');
    expect(appTree.exists('apps/test/src/routes/tester/+page.ts')).toBeFalsy();
    expect(
      appTree.read('apps/test/src/routes/tester/+page.js')?.toString()
    ).toContain('subject: `tester`');
  });

  it('handles directory and path', async () => {
    await generator(appTree, {
      name: 'a/b/c/tester',
      directory: 'tbd',
      project: 'test',
    });
    expect(
      appTree
        .read('apps/test/src/routes/tbd/a/b/c/tester/+page.svelte')
        ?.toString()
    ).toContain('{data.subject} works');
    expect(
      appTree.read('apps/test/tests/tbd/a/b/c/tester.spec.ts')?.toString()
    ).toContain("await page.goto('/tbd/a/b/c/tester');");
  });

  it('handles directory and path with routeparams', async () => {
    await generator(appTree, {
      name: '[a]/b/[c]/tester',
      directory: 'tbd',
      project: 'test',
      load: 'server',
      language: 'ts',
    });
    expect(
      appTree
        .read('apps/test/src/routes/tbd/[a]/b/[c]/tester/+page.svelte')
        ?.toString()
    ).toContain('{data.subject} works');
    const serverPage = appTree
      .read('apps/test/src/routes/tbd/[a]/b/[c]/tester/+page.server.ts')
      ?.toString();
    expect(serverPage).toContain('const { a, c } = params;');
    expect(serverPage).toContain(
      'return Promise.resolve(`tbd/${a}/b/${c}/tester`);'
    );
    expect(
      appTree.read('apps/test/tests/tbd/[a]/b/[c]/tester.spec.ts')?.toString()
    ).toContain("await page.goto('/tbd/_a_/b/_c_/tester');");
  });

  it('handles directory and path with routeparams shared', async () => {
    await generator(appTree, {
      name: '[a]/b/[c]/tester',
      directory: 'tbd',
      project: 'test',
      load: 'shared',
      language: 'ts',
    });
    expect(
      appTree
        .read('apps/test/src/routes/tbd/[a]/b/[c]/tester/+page.svelte')
        ?.toString()
    ).toContain('{data.subject} works');
    const loadPage = appTree
      .read('apps/test/src/routes/tbd/[a]/b/[c]/tester/+page.ts')
      ?.toString();
    expect(loadPage).toContain('const { a, c } = params;');
    expect(loadPage).toContain('subject: `tbd/${a}/b/${c}/tester`');
    expect(
      appTree.read('apps/test/tests/tbd/[a]/b/[c]/tester.spec.ts')?.toString()
    ).toContain("await page.goto('/tbd/_a_/b/_c_/tester');");
  });

  it('handles route param type ynf', async () => {
    await generator(appTree, {
      name: '[a]/b/[c=ynf]/tester',
      directory: 'tbd',
      project: 'test',
      load: 'shared',
      language: 'ts',
    });
    expect(
      appTree
        .read('apps/test/src/routes/tbd/[a]/b/[c=ynf]/tester/+page.svelte')
        ?.toString()
    ).toContain('{data.subject} works');
    const loadPage = appTree
      .read('apps/test/src/routes/tbd/[a]/b/[c=ynf]/tester/+page.ts')
      ?.toString();
    expect(loadPage).toContain('const { a, c } = params;');
    expect(loadPage).toContain('subject: `tbd/${a}/b/${c}/tester`');
    expect(
      appTree
        .read('apps/test/tests/tbd/[a]/b/[c=ynf]/tester.spec.ts')
        ?.toString()
    ).toContain("await page.goto('/tbd/_a_/b/_c_/tester');");
  });
});

describe('route generator runes', () => {
  let appTree: Tree;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    createSvelteKitApp(appTree, '0', { directory: 'apps', name: 'test' });
    addProjectConfiguration(appTree, 'test', { root: 'apps/test' });
  });

  it('should do shared runes', async () => {
    const opts: Schema = {
      name: 'tester',
      project: 'test',
      load: 'shared',
      language: 'ts',
      runes: true,
    };
    await generator(appTree, opts);

    expect(
      appTree.read('apps/test/src/routes/tester/+page.svelte', 'utf-8')
    ).toMatchSnapshot();
    expect(
      appTree.read(
        `apps/test/src/routes/tester/+page.${opts.language}`,
        'utf-8'
      )
    ).toMatchSnapshot();
    expect(
      appTree.exists(
        `apps/test/src/routes/tester/+page.server.${opts.language}`
      )
    ).toBeFalsy();
  });

  it('should do server runes', async () => {
    const opts: Schema = {
      name: 'tester',
      project: 'test',
      load: 'server',
      language: 'ts',
      runes: true,
    };
    await generator(appTree, opts);

    expect(
      appTree.read('apps/test/src/routes/tester/+page.svelte', 'utf-8')
    ).toMatchSnapshot();
    expect(
      appTree.read(`apps/test/src/routes/tester/+page.server.ts`, 'utf-8')
    ).toMatchSnapshot();
    expect(appTree.exists(`apps/test/src/routes/tester/+page.ts`)).toBeFalsy();
  });

  it('should do none runes', async () => {
    const opts: Schema = {
      name: 'tester',
      project: 'test',
      load: 'none',
      language: 'ts',
      runes: true,
    };
    await generator(appTree, opts);

    expect(
      appTree.read('apps/test/src/routes/tester/+page.svelte', 'utf-8')
    ).toMatchSnapshot();
    expect(
      appTree.exists(`apps/test/src/routes/tester/+page.${opts.language}`)
    ).toBeFalsy();
    expect(
      appTree.exists(
        `apps/test/src/routes/tester/+page.server.${opts.language}`
      )
    ).toBeFalsy();
  });
});

describe('getSegments', () => {
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
