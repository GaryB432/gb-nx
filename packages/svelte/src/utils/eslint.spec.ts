import { type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
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
    updateEslint(appTree, { root: 'apps/tester' });
    const wsconfig = JSON.parse(
      appTree.read('.eslintrc.json', 'utf-8')!
    ) as EslintConfiguration;
    expect(wsconfig.extends).toEqual([
      'plugin:gb/recommended',
      'plugin:svelte/recommended',
    ]);
    const pconfig = JSON.parse(
      appTree.read('apps/tester/.eslintrc.json', 'utf-8')!
    ) as EslintConfiguration;
    expect(pconfig.extends).toEqual(['../../.eslintrc.json']);
  });
});
