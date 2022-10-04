import type { Tree } from '@nrwl/devkit';
import { readProjectConfiguration } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { createSvelteKitApp } from '../../utils/svelte';
import generator from './generator';
import type { Schema as ApplicationGeneratorSchema } from './schema';

const PRETTIERIGNORE = '.prettierignore';

describe('application generator', () => {
  let appTree: Tree;
  const options: ApplicationGeneratorSchema = { name: 'test' };

  const version = '0.0.0-alpha.0';

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
    createSvelteKitApp(appTree, version, 'apps/test');
  });

  it('should run successfully', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');
    expect(config.root).toEqual('apps/test');
  });

  it('should update prettier', async () => {
    appTree.write(PRETTIERIGNORE, '# hi\n\ndist\nstuff\n');
    await generator(appTree, options);
    const p = appTree.read(PRETTIERIGNORE);
    expect(p?.toString()).toMatchInlineSnapshot(`
      "# hi

      dist
      stuff

      apps/test/.svelte-kit
      apps/test/build
      "
    `);
  });

  it('should not update prettier twice', async () => {
    appTree.write(
      PRETTIERIGNORE,
      '# hi\n\ndist\nstuff\n\napps/test/.svelte-kit\napps/test/build\n'
    );
    await generator(appTree, options);
    const p = appTree.read(PRETTIERIGNORE);
    expect(p?.toString()).toMatchInlineSnapshot(`
      "# hi

      dist
      stuff

      apps/test/.svelte-kit
      apps/test/build

      "
    `);
  });

  it('should create prettier', async () => {
    await generator(appTree, options);
    const p = appTree.read(PRETTIERIGNORE);
    expect(p?.toString()).toMatchInlineSnapshot(`
      "# Add files here to ignore them from prettier formatting

      apps/test/.svelte-kit
      apps/test/build
      "
    `);
  });

  it('should go', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toEqual({
      $schema: '../../node_modules/nx/schemas/project-schema.json',
      root: 'apps/test',
      name: 'test',
      projectType: 'application',
      sourceRoot: 'apps/test/src',
      targets: {
        build: {
          executor: 'nx:run-commands',
          options: { command: 'npx vite build', cwd: 'apps/test' },
        },
        serve: {
          executor: 'nx:run-commands',
          options: { command: 'npx vite dev', cwd: 'apps/test' },
        },
        lint: {
          executor: 'nx:run-commands',
          options: { command: 'npx eslint .', cwd: 'apps/test' },
        },
      },
      tags: [],
    });
  });
});
