import { readJson, type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import initGenerator from './generator';
import type { Schema } from './schema';
import { prettierPluginSvelteVersion } from '../../utils/versions';

describe('init schematic', () => {
  let tree: Tree;
  const options: Schema = {
    skipFormat: true,
    unitTestRunner: 'jest',
    e2eTestRunner: 'cypress',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    tree.write(
      'package.json',
      `
      {
        "name": "test-name",
        "dependencies": {},
        "devDependencies": {
          "@XXX/nrwl/workspace": "0.0.0"
        }
      }
    `
    );
  });

  it('should add Svelte dependencies', async () => {
    await initGenerator(tree, options);

    const packageJson = readJson(tree, 'package.json');
    expect(packageJson.devDependencies).toEqual({
      '@XXX/nrwl/workspace': '0.0.0',
      'prettier-plugin-svelte': prettierPluginSvelteVersion,
    });
  });
});
