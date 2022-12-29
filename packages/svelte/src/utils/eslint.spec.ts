import { type Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { updateEslint, type EslintConfiguration } from './eslint';

const existingEslintConfiguration: EslintConfiguration = {
  root: true,
  ignorePatterns: ['**/*'],
  plugins: ['@nrwl/nx'],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      rules: {
        '@nrwl/nx/enforce-module-boundaries': [
          'error',
          {
            enforceBuildableLibDependency: true,
            allow: [],
            depConstraints: [
              {
                sourceTag: '*',
                onlyDependOnLibsWithTags: ['*'],
              },
            ],
          },
        ],
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: ['plugin:@nrwl/nx/typescript'],
      rules: {},
    },
    {
      files: ['*.js', '*.jsx'],
      extends: ['plugin:@nrwl/nx/javascript'],
      rules: {},
    },
    {
      files: ['*.spec.ts', '*.spec.tsx', '*.spec.js', '*.spec.jsx'],
      env: {
        jest: true,
      },
      rules: {},
    },
  ],
};

describe('eslint util', () => {
  let appTree: Tree;
  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  test('updateEslint', async () => {
    await updateEslint(appTree, { root: 'apps/tester' });
    const c = JSON.parse(
      appTree.read('.eslintrc.json', 'utf-8')!
    ) as EslintConfiguration;
    expect(c.extends).toEqual([
      'plugin:gb/recommended',
      'plugin:svelte/recommended',
    ]);
  });
});
