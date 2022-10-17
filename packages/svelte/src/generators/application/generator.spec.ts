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

      # Svelte-kit output
      **/.svelte-kit
      **/build
      "
    `);
  });

  it('should create prettier', async () => {
    await generator(appTree, options);
    const p = appTree.read(PRETTIERIGNORE);
    expect(p?.toString()).toMatchInlineSnapshot(`
      "# Add files here to ignore them from prettier formatting

      # Svelte-kit output
      **/.svelte-kit
      **/build
      "
    `);
  });

  it('should go', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toMatchInlineSnapshot(`
      Object {
        "$schema": "../../node_modules/nx/schemas/project-schema.json",
        "name": "test",
        "projectType": "application",
        "root": "apps/test",
        "sourceRoot": "apps/test/src",
        "tags": Array [],
        "targets": Object {
          "build": Object {
            "executor": "@nrwl/workspace:run-commands",
            "options": Object {
              "command": "npx vite build",
              "cwd": "apps/test",
            },
          },
          "lint": Object {
            "executor": "@nrwl/workspace:run-commands",
            "options": Object {
              "command": "npx eslint .",
              "cwd": "apps/test",
            },
          },
          "serve": Object {
            "executor": "@nrwl/workspace:run-commands",
            "options": Object {
              "command": "npx vite dev",
              "cwd": "apps/test",
            },
          },
        },
      }
    `);
  });
});
