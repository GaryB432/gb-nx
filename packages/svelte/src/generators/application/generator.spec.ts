import { readJson, type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { type PackageJson } from 'nx/src/utils/package-json';
import { type Config as PrettierConfig } from 'prettier';
import { createSvelteKitApp } from '../../utils/svelte';
import generator from './generator';
import type { Schema as ApplicationGeneratorOptions } from './schema';

const PRETTIERIGNORE = '.prettierignore';

jest.mock('@nx/devkit', () => {
  const devkit = { ...jest.requireActual('@nx/devkit') };
  return {
    ...devkit,
    // ensurePackage: (pkg: string) => jest.requireActual(pkg),
    ensurePackage: jest.fn(),
    // installPackagesTask: jest.fn(),
  };
});

describe('with eslint', () => {
  let appTree: Tree;
  const options: ApplicationGeneratorOptions = {
    projectPath: 'apps/subject-skapp',
    eslint: true,
    skipFormat: true,
  };

  const version = '0.0.0-alpha.0';

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
    jest.clearAllMocks();
    createSvelteKitApp(appTree, version, {
      name: 'subject-skapp',
      skipFormat: true,
      directory: 'apps',
    });
  });

  it('should handle project eslint config', async () => {
    await generator(appTree, options);
    expect(
      appTree.read('apps/subject-skapp/.eslintrc.json', 'utf-8')
    ).toMatchSnapshot();
  });

  it('should handle eslint config', async () => {
    await generator(appTree, options);
    expect(appTree.read('.eslintrc.json', 'utf-8')).toMatchSnapshot();
  });

  it('should add web dev dependencies', async () => {
    await generator(appTree, options);
    const pj: PackageJson = JSON.parse(
      appTree.read('apps/subject-skapp/package.json', 'utf-8')!
    );
    expect(pj.devDependencies!['@typescript-eslint/parser']).not.toBeDefined();
  });
  it('should add root dev dependencies', async () => {
    await generator(appTree, options);
    const pj: PackageJson = JSON.parse(appTree.read('package.json', 'utf-8')!);
    expect(pj.devDependencies!['@nx/eslint']).toBeDefined();
    expect(pj.devDependencies!['@nx/eslint-plugin']).toBeDefined();
    expect(
      pj.devDependencies!['@typescript-eslint/eslint-plugin']
    ).toBeDefined();
    expect(pj.devDependencies!['@typescript-eslint/parser']).toBeDefined();
    expect(pj.devDependencies!['eslint']).toBeDefined();
    expect(pj.devDependencies!['eslint-plugin-gb']).not.toBeDefined();
    expect(pj.devDependencies!['eslint-plugin-svelte']).toBeDefined();
  });
});

describe('application generator', () => {
  let appTree: Tree;
  const options: ApplicationGeneratorOptions = {
    projectPath: 'apps/subject-skapp',
    skipFormat: true,
  };

  const version = '0.0.0-alpha.0';
  const pt: PackageJson = {
    name: 'test',
    version: '0',
    // workspaces: { packages: [] },
    workspaces: ['apps/z', 'apps/a'],
  };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
    appTree.write('package.json', JSON.stringify(pt));
    jest.clearAllMocks();
    createSvelteKitApp(appTree, version, {
      name: 'subject-skapp',
      skipFormat: true,
      directory: 'apps',
    });
  });

  it('should run successfully', async () => {
    await generator(appTree, options);
    // const config = readProjectConfiguration(appTree, 'test');

    const { name } = JSON.parse(
      appTree.read('apps/subject-skapp/package.json')!.toString()
    );
    expect(name).toEqual('@subject-skapp/source');

    expect(appTree.read('tsconfig.base.json', 'utf-8')).toMatchInlineSnapshot(
      `"{"compilerOptions":{"paths":{}}}"`
    );

    expect(appTree.read('.prettierrc', 'utf-8')).toMatchInlineSnapshot(`
      "{
        "singleQuote": true,
        "plugins": [
          "prettier-plugin-svelte"
        ],
        "overrides": [
          {
            "files": "*.svelte",
            "options": {
              "parser": "svelte"
            }
          }
        ]
      }
      "
    `);

    expect(appTree.children('').sort()).toEqual([
      '.prettierignore',
      '.prettierrc',
      'apps',
      'nx.json',
      'package.json',
      'tsconfig.base.json',
    ]);

    // expect(installPackagesTask.mock.calls.length).toBe(2);
    expect(
      readJson(appTree, 'apps/subject-skapp/project.json')
    ).toMatchSnapshot();
  });

  it('should update prettier', async () => {
    appTree.write(PRETTIERIGNORE, '# hi\n\ndist\nstuff\n');
    await generator(appTree, options);
    const p = appTree.read(PRETTIERIGNORE);
    expect(p?.toString()).toMatchInlineSnapshot(`
      "# hi

      dist
      stuff

      apps/subject-skapp/.svelte-kit
      apps/subject-skapp/build
      "
    `);
  });

  it('should not update prettier twice', async () => {
    appTree.write(
      PRETTIERIGNORE,
      '# hi\n\ndist\nstuff\n\napps/subject-skapp/.svelte-kit\napps/subject-skapp/build\n'
    );
    await generator(appTree, options);
    const p = appTree.read(PRETTIERIGNORE);
    expect(p?.toString()).toMatchInlineSnapshot(`
      "# hi

      dist
      stuff

      apps/subject-skapp/.svelte-kit
      apps/subject-skapp/build

      "
    `);
  });

  it('should create prettier', async () => {
    await generator(appTree, options);
    const p = appTree.read(PRETTIERIGNORE);
    expect(p?.toString()).toMatchInlineSnapshot(`
      "# Add files here to ignore them from prettier formatting
      /dist
      /coverage
      /.nx/cache
      apps/subject-skapp/.svelte-kit
      apps/subject-skapp/build
      "
    `);
  });

  it('should add workspace', async () => {
    await generator(appTree, options);
    const p = appTree.read('package.json');
    const s = p ? p.toString() : '';
    const q = JSON.parse(s);
    expect(q.workspaces).toEqual(['apps/a', 'apps/subject-skapp', 'apps/z']);
  });

  it('should update prettier', async () => {
    appTree.write(
      '.prettierrc',
      JSON.stringify({
        useTabs: undefined,
        singleQuote: true,
        trailingComma: 'none',
        printWidth: 100,
        // plugins: ['prettier-plugin-svelte'],
        overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
      })
    );
    await generator(appTree, options);
    const config = readJson<PrettierConfig>(appTree, '.prettierrc');
    expect(config).toEqual({
      // useTabs: true,
      singleQuote: true,
      trailingComma: 'none',
      printWidth: 100,
      plugins: ['prettier-plugin-svelte'],
      overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
    });
  });
});
