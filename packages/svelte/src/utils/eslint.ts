import {
  joinPathFragments,
  type ProjectConfiguration,
  type Tree,
} from '@nrwl/devkit';

export interface EslintConfiguration {
  env?: {
    browser: boolean;
    es2021: boolean;
    node: boolean;
  };
  extends?: string[];
  ignorePatterns?: string[];
  overrides: unknown[];
  parser?: string;
  parserOptions?: {
    ecmaVersion: string;
    sourceType: string;
    project: string;
    extraFileExtensions: string[];
  };
  plugins: string[];
  root: boolean;
  rules?: unknown;
}

async function updateWorkspaceEslint(tree: Tree): Promise<void> {
  const config: Partial<EslintConfiguration> = {
    root: true,
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    extends: ['plugin:gb/recommended', 'plugin:svelte/recommended'],
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
        files: ['*.svelte'],
        parser: 'svelte-eslint-parser',
        parserOptions: {
          parser: '@typescript-eslint/parser',
        },
      },
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      project: 'tsconfig.base.json',
      extraFileExtensions: ['.svelte'],
    },
    plugins: ['@nrwl/nx', 'gb'],
    rules: {},
  };
  tree.write('.eslintrc.json', JSON.stringify(config));
}
async function updateProjectEslint(
  tree: Tree,
  project: Pick<ProjectConfiguration, 'root'>
): Promise<void> {
  const config: Partial<EslintConfiguration> = {
    extends: ['../../.eslintrc.json'],
    ignorePatterns: ['.svelte-kit', 'build/*', '**/*.config.*'],
  };

  tree.write(
    joinPathFragments(project.root, '.eslintrc.json'),
    JSON.stringify(config)
  );
}

export async function updateEslint(
  tree: Tree,
  project: Pick<ProjectConfiguration, 'root'>
): Promise<void> {
  updateWorkspaceEslint(tree);
  updateProjectEslint(tree, project);
}
