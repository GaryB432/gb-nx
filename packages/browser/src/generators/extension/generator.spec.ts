import {
  readProjectConfiguration,
  readWorkspaceConfiguration,
  type Tree,
} from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import extensionGenerator from './generator';

describe('extension', () => {
  let tree: Tree;
  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should generate extension in directory', async () => {
    await extensionGenerator(tree, {
      name: 'my-app',
    });

    expect(tree.children('apps/my-app')).toContain('project.json');
    expect(tree.children('apps/my-app/src')).toContain('main.ts');
    expect(readWorkspaceConfiguration(tree).version).toEqual(2);

    const rpconf = readProjectConfiguration(tree, 'my-app');
    expect(rpconf.targets!['build'].executor).toEqual('@nrwl/webpack:webpack');

    expect(rpconf.targets!['lint']).toMatchInlineSnapshot(`
      Object {
        "executor": "@nrwl/linter:eslint",
        "options": Object {
          "lintFilePatterns": Array [
            "apps/my-app/**/*.ts",
          ],
        },
        "outputs": Array [
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
        \\"extends\\": [
          \\"../../.eslintrc.json\\"
        ],
        \\"ignorePatterns\\": [
          \\"!**/*\\"
        ],
        \\"overrides\\": [
          {
            \\"files\\": [
              \\"*.ts\\",
              \\"*.tsx\\",
              \\"*.js\\",
              \\"*.jsx\\"
            ],
            \\"parserOptions\\": {
              \\"project\\": [
                \\"apps/my-app/tsconfig.*?.json\\"
              ]
            },
            \\"rules\\": {}
          },
          {
            \\"files\\": [
              \\"*.ts\\",
              \\"*.tsx\\"
            ],
            \\"rules\\": {},
            \\"extends\\": [
              \\"../../eslint-custom.json\\"
            ]
          },
          {
            \\"files\\": [
              \\"*.js\\",
              \\"*.jsx\\"
            ],
            \\"rules\\": {}
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
