import { readJson, readProjectConfiguration, type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import extensionGenerator from './generator';

describe('extension', () => {
  let tree: Tree;
  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  });

  it('should generate extension in directory', async () => {
    await extensionGenerator(tree, {
      name: 'my-app',
      directory: 'apps/my-app',
      projectNameAndRootFormat: 'as-provided',
      skipFormat: true,
    });

    expect(tree.children('apps/my-app')).toContain('project.json');
    expect(tree.children('apps/my-app/src')).toContain('main.ts');
    expect(tree.children('apps/my-app')).toContain('jest.config.ts');

    const rpconf = readProjectConfiguration(tree, 'my-app');
    expect(rpconf.targets!['build'].executor).toEqual('@nx/webpack:webpack');
    expect(rpconf.targets!['lint'].executor).toEqual('@nx/eslint:lint');
    expect(rpconf.targets!['zip']).toEqual({
      dependsOn: ['build', 'build-scripts'],
      executor: '@gb-nx/browser:zip',
      options: {
        outputFileName: '{workspaceRoot}/zip/my-app.extension@{manifestVersion}.zip',
      },
      outputs: ['{options.outputFileName}'],
    });

    expect(
      readJson(tree, 'apps/my-app/.eslintrc.json').overrides.length
    ).toEqual(3);

    expect(
      readJson(tree, 'apps/my-app/tsconfig.json').references.length
    ).toEqual(3);
  });
});
