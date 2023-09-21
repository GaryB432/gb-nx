import { readProjectConfiguration, type Tree } from '@nx/devkit';
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
    });

    expect(tree.children('apps/my-app')).toContain('project.json');
    expect(tree.children('apps/my-app/src')).toContain('main.ts');

    const rpconf = readProjectConfiguration(tree, 'my-app');
    expect(rpconf.targets!['build'].executor).toEqual('@nx/webpack:webpack');

    expect(rpconf.targets!['lint']).toMatchInlineSnapshot(`
      {
        "executor": "@nx/linter:eslint",
        "options": {
          "lintFilePatterns": [
            "apps/my-app/**/*.ts",
          ],
        },
        "outputs": [
          "{options.outputFile}",
        ],
      }
    `);

    expect(tree.read('apps/my-app/src/main.ts', 'utf-8')).toMatchInlineSnapshot(
      `""`
    );

    expect(tree.read('apps/my-app/.eslintrc.json', 'utf-8'))
      .toMatchInlineSnapshot(`
      "{
        "extends": ["../../.eslintrc.json"],
        "ignorePatterns": ["!**/*"],
        "overrides": [
          {
            "files": ["*.ts", "*.tsx", "*.js", "*.jsx"],
            "rules": {}
          },
          {
            "files": ["*.ts", "*.tsx"],
            "rules": {},
            "extends": ["../../eslint-custom.json"]
          },
          {
            "files": ["*.js", "*.jsx"],
            "rules": {}
          }
        ]
      }
      "
    `);

    expect(
      JSON.parse(tree.read('apps/my-app/tsconfig.json', 'utf-8')!)
    ).toEqual({
      extends: '../../tsconfig.base.json',
      compilerOptions: {
        strict: true,
      },
      files: [],
      include: [],
      references: [
        {
          path: './tsconfig.app.json',
        },
        {
          path: './tsconfig.scripts.json',
        },
        {
          path: './tsconfig.spec.json',
        },
      ],
    });
  });
});
