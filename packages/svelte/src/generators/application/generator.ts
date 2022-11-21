import { normalizePath, type GeneratorCallback, type Tree } from '@nrwl/devkit';
import {
  addDependenciesToPackageJson,
  formatFiles,
  getWorkspaceLayout,
  installPackagesTask,
  joinPathFragments,
  names,
  output,
} from '@nrwl/devkit';
import { join } from 'path';
import { getSveltePackageVersions, isSvelte } from '../../utils/svelte';
import { prettierPluginSvelteVersion } from '../../utils/versions';
import type { Schema as ApplicationGeneratorSchema } from './schema';

const nx = {
  namedInputs: {
    default: ['{projectRoot}/**/*'],
    production: [
      '!{projectRoot}/.svelte-kit/*',
      '!{projectRoot}/build/*',
      '!{projectRoot}/tests/*',
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

interface PackageJson {
  devDependencies: Record<string, string>;
  name: string;
  version: string;
  workspaces: Array<string>;
}

interface NormalizedSchema extends ApplicationGeneratorSchema {
  appsDir: string;
  parsedTags: string[];
  projectDirectory: string;
  projectName: string;
  projectRoot: string;
}

function normalizeOptions(
  tree: Tree,
  options: ApplicationGeneratorSchema
): NormalizedSchema {
  const { appsDir } = getWorkspaceLayout(tree);
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = join(appsDir, projectDirectory);

  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    appsDir,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  };
}

function addWorkspace(tree: Tree, options: NormalizedSchema): void {
  const buf = tree.read('package.json');
  if (!buf) {
    throw new Error('no pacakge');
  }
  const pj = JSON.parse(buf.toString()) as PackageJson;
  pj.workspaces = pj.workspaces ?? [];
  pj.workspaces.push(normalizePath(options.projectRoot));
  tree.write('package.json', JSON.stringify(pj));
}

function updatePrettierIgnore(tree: Tree, options: NormalizedSchema) {
  const fname = '.prettierignore';
  const tbs = ['.svelte-kit', 'build'];
  const newPatterns = tbs.map((p) => joinPathFragments(options.projectRoot, p));

  const buf = tree.read(fname);
  const content = buf
    ? buf.toString()
    : '# Add files here to ignore them from prettier formatting\n';

  const patterns = content.split('\n');

  const lines = patterns
    .concat(newPatterns.filter((p) => !patterns.includes(p)))
    .concat('');

  tree.write(fname, lines.join('\n'));
}

export default async function (
  tree: Tree,
  options: ApplicationGeneratorSchema
): Promise<GeneratorCallback> {
  // logger.warn(
  //   'The generator is deprecated and will be removed in @gb-nx/svelte@2.0.0'
  // );
  const notSvelte = (p: string) =>
    `project '${p}' is not configured for svelte`;
  const noProject = (p: string) => `project '${p}' not found in workspace`;

  const normalizedOptions = normalizeOptions(tree, options);
  const config = { root: normalizedOptions.projectRoot };

  if (!isSvelte(tree, config)) {
    throw new Error(notSvelte(normalizedOptions.name));
  }

  const pname = joinPathFragments(
    normalizedOptions.projectRoot,
    'package.json'
  );
  const pbuff = tree.read(pname);
  if (pbuff) {
    const sveltePackage = JSON.parse(pbuff.toString()) as PackageJson;
    const pluginVersion =
      sveltePackage.devDependencies['prettier-plugin-svelte'] ??
      prettierPluginSvelteVersion;
    if (pluginVersion) {
      addDependenciesToPackageJson(
        tree,
        {},
        { 'prettier-plugin-svelte': pluginVersion }
      );
    }

    const packs = getSveltePackageVersions(tree, config);
    output.log({
      title: 'Svelte Packages',
      bodyLines: packs.map(
        (p) =>
          `${output.colors.white(p.name)}: ${output.colors.green(p.version)}`
      ),
    });

    updatePrettierIgnore(tree, normalizedOptions);
    tree.write(
      pname,
      JSON.stringify({ ...sveltePackage, nx }, undefined, 2) + '\n'
    );
    addWorkspace(tree, normalizedOptions);
  } else {
    throw new Error(noProject(options.name));
  }

  await formatFiles(tree);

  return async () => {
    installPackagesTask(tree);
  };
}
