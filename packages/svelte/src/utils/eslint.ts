import {
  joinPathFragments,
  type ProjectConfiguration,
  type Tree,
} from '@nx/devkit';

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
    extraFileExtensions: string[];
    project: string;
    sourceType: string;
  };
  plugins: string[];
  root: boolean;
  rules?: unknown;
}

function updateWorkspaceEslint(tree: Tree): void {
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
          '@nx/enforce-module-boundaries': [
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
    plugins: ['@nx', 'gb'],
    rules: {},
  };
  tree.write('.eslintrc.json', JSON.stringify(config));
}
function updateProjectEslint(
  tree: Tree,
  project: Pick<ProjectConfiguration, 'root'>
): void {
  const config: Partial<EslintConfiguration> = {
    extends: ['../../.eslintrc.json'],
    ignorePatterns: ['.svelte-kit', 'build/*', '**/*.config.*'],
  };

  tree.write(
    joinPathFragments(project.root, '.eslintrc.json'),
    JSON.stringify(config)
  );
}

/**
 * 
 * @param tree 
 * @param project 
 * @deprecated
 */
export function updateEslint(
  tree: Tree,
  project: Pick<ProjectConfiguration, 'root'>
): void {
  updateWorkspaceEslint(tree);
  updateProjectEslint(tree, project);
}
