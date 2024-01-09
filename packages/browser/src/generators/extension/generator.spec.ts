import { readJson, readProjectConfiguration, type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { type ManifestSchema } from '../../manifest/manifest';
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
    expect(tree.children('apps/my-app/src/scripts')).toContain(
      'my-app.content_script.ts'
    );
    expect(tree.children('apps/my-app')).toContain('jest.config.ts');

    const rpconf = readProjectConfiguration(tree, 'my-app');
    expect(rpconf.targets!['build'].executor).toEqual('@nx/webpack:webpack');
    expect(rpconf.targets!['lint'].executor).toEqual('@nx/eslint:lint');
    expect(rpconf.targets!['zip']).toEqual({
      dependsOn: ['build', 'build-scripts'],
      executor: '@gb-nx/browser:zip',
      options: {
        outputFileName:
          '{workspaceRoot}/zip/my-app.extension@{manifestVersion}.zip',
      },
      outputs: ['{options.outputFileName}'],
    });

    const manifest = readJson<ManifestSchema>(
      tree,
      'apps/my-app/src/manifest.json'
    );
    expect(manifest.content_scripts).toContainEqual({
      js: ['scripts/my-app.content_script.js'],
      matches: ['https://*/my-app.com/*'],
    });

    expect(
      readJson(tree, 'apps/my-app/.eslintrc.json').overrides.length
    ).toEqual(3);

    expect(
      readJson(tree, 'apps/my-app/tsconfig.json').references.length
    ).toEqual(3);
  });
});
