import type { Tree } from '@nx/devkit';
import { NX_VERSION, readJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import generator from './generator';
import type { Schema as InitGeneratorSchema } from './schema';

describe('init generator', () => {
  let appTree: Tree;
  const options: InitGeneratorSchema = {};

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    // writeJson(appTree, 'package.json', { devDependencies: { nx: '65.43.21' } });
  });

  it('should run successfully', async () => {
    await generator(appTree, options);
    const { devDependencies } = readJson(appTree, 'package.json');
    expect(devDependencies).toEqual({
      '@nx/devkit': NX_VERSION,
      '@nx/eslint': NX_VERSION,
      '@nx/jest': NX_VERSION,
      '@nx/webpack': NX_VERSION,
    });
  });
});
