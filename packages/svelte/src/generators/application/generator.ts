import {
  NX_VERSION,
  addDependenciesToPackageJson,
  ensurePackage,
  formatFiles,
  installPackagesTask,
  joinPathFragments,
  normalizePath,
  updateJson,
  writeJson,
  type GeneratorCallback,
  type Tree,
} from '@nx/devkit';

import { initGenerator } from '@nx/js';

import {
  eslintVersion,
  typescriptESLintVersion,
} from '@nx/eslint/src/utils/versions';
import type {
  NxProjectPackageJsonConfiguration,
  PackageJson,
} from 'nx/src/utils/package-json';
import { updateEslint } from '../../utils/eslint';
import { includes } from '../../utils/globber';
import { isSvelte } from '../../utils/svelte';
import {
  eslintPluginGbVersion,
  eslintPluginSvelteVersion,
  prettierPluginSvelteVersion,
} from '../../utils/versions';
import { normalizeOptions } from './lib/normalize-options';
import { type Config as PrettierConfig } from './lib/prettier';
import {
  type ApplicationGeneratorOptions,
  type NormalizedOptions,
} from './schema';

const PRETTIER_PLUGIN_SVELTE = 'prettier-plugin-svelte';

const nx: NxProjectPackageJsonConfiguration = {
  namedInputs: {
    default: ['{projectRoot}/**/*'],
    production: [
      '!{projectRoot}/.svelte-kit/*',
      '!{projectRoot}/build/*',
      '!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)',
      '!{projectRoot}/tsconfig.spec.json',
    ],
  },
  targets: {
    build: {
      inputs: ['production', '^production'],
      outputs: ['{projectRoot}/build'],
      dependsOn: ['^build'],
    },
  },
};

function addNxConfig(tree: Tree, packageJsonPath: string): void {
  return updateJson<PackageJson>(tree, packageJsonPath, (json) => ({
    ...json,
    nx,
  }));
}

function addScriptsToPackageJson(
  tree: Tree,
  scripts: Record<string, string>,
  packageJsonPath: string
): void {
  updateJson<PackageJson>(tree, packageJsonPath, (json) => {
    json.scripts = json.scripts ?? {};
    for (const script of Object.keys(scripts)) {
      json.scripts[script] = scripts[script];
    }
    return json;
  });
}

function addWorkspaceToPackageJson(
  tree: Tree,
  options: NormalizedOptions,
  packageJsonPath = 'package.json'
): void {
  updateJson<PackageJson>(tree, packageJsonPath, (json) => {
    json.workspaces = json.workspaces ?? [];
    if (Array.isArray(json.workspaces)) {
      if (!includes(options.projectRoot, json.workspaces)) {
        json.workspaces.push(normalizePath(options.projectRoot));
        json.workspaces.sort();
      }
    } else {
      throw new Error('TODO handle');
    }
    return json;
  });
}

function updatePrettier(tree: Tree, options: NormalizedOptions) {
  ensurePackage(PRETTIER_PLUGIN_SVELTE, prettierPluginSvelteVersion);

  const updateConfig = () => {
    const prettierrc = '.prettierrc';
    if (!tree.exists(prettierrc)) {
      writeJson(tree, prettierrc, { singleQuote: true });
    }

    updateJson<PrettierConfig, PrettierConfig>(tree, prettierrc, (json) => {
      json.plugins = json.plugins ?? [];
      if (!json.plugins.includes(PRETTIER_PLUGIN_SVELTE)) {
        json.plugins.push(PRETTIER_PLUGIN_SVELTE);
      }
      json.overrides = json.overrides ?? [];
      if (!json.overrides.some((t) => t.files === '*.svelte')) {
        json.overrides.push({
          files: '*.svelte',
          options: { parser: 'svelte' },
        });
      }
      return json;
    });
  };
  const updateIgnore = () => {
    const fname = '.prettierignore';
    const tbs = ['.svelte-kit', 'build'];
    const newPatterns = tbs.map((p) =>
      joinPathFragments(options.projectRoot, p)
    );

    let content = [
      '# Add files here to ignore them from prettier formatting',
      '/dist',
      '/coverage',
      '/.nx/cache',
    ].join('\n');

    if (tree.exists(fname)) {
      content = tree.read(fname, 'utf-8')!;
    }

    const patterns = content.split('\n');

    const lines = patterns
      .concat(newPatterns.filter((p) => !patterns.includes(p)))
      .concat('');

    tree.write(fname, lines.join('\n'));
  };
  addDependenciesToPackageJson(
    tree,
    {},
    {
      'prettier-plugin-svelte': prettierPluginSvelteVersion,
    }
  );
  updateConfig();
  updateIgnore();
}

export default async function (
  tree: Tree,
  options: ApplicationGeneratorOptions
): Promise<GeneratorCallback> {
  const notSvelte = (p: string) =>
    `project at '${p}' is not configured for svelte`;

  const normalizedOptions = await normalizeOptions(tree, options);
  const config = { root: normalizedOptions.projectRoot };

  if (!isSvelte(tree, config)) {
    throw new Error(notSvelte(normalizedOptions.projectRoot));
  }

  const webPackageJsonPath = joinPathFragments(
    normalizedOptions.projectRoot,
    'package.json'
  );

  await initGenerator(tree, {
    skipFormat: normalizedOptions.skipFormat,
    tsConfigName: 'tsconfig.gb.json',
  });

  addNxConfig(tree, webPackageJsonPath);

  updatePrettier(tree, normalizedOptions);
  addWorkspaceToPackageJson(tree, normalizedOptions, 'package.json');

  normalizedOptions.eslint = false;
  if (normalizedOptions.eslint) {
    // TODO use @nx/eslint (@nx/eslint works with projects. this is not a project yet)
    updateEslint(tree, config);
    addDependenciesToPackageJson(
      tree,
      {},
      {
        '@nx/eslint-plugin': NX_VERSION,
        '@typescript-eslint/eslint-plugin': typescriptESLintVersion,
        '@typescript-eslint/parser': typescriptESLintVersion,
        eslint: eslintVersion,
        'eslint-plugin-gb': eslintPluginGbVersion,
        'eslint-plugin-svelte': eslintPluginSvelteVersion,
      },
      'package.json'
    );
    tree.write(
      joinPathFragments(normalizedOptions.projectRoot, 'tsconfig.base.json'),
      '{ "extends": "./tsconfig.json" }'
    );
    addScriptsToPackageJson(tree, { lint: 'eslint .' }, webPackageJsonPath);
  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return async () => {
    installPackagesTask(tree);
  };
}
