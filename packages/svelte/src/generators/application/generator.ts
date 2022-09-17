import { getSveltePackageVersions, isSvelte } from '$utils/svelte';
import {
  addProjectConfiguration,
  formatFiles,
  GeneratorCallback,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  output,
  ProjectConfiguration,
  Tree,
} from '@nrwl/devkit';
import { join } from 'path';
import { Schema as ApplicationGeneratorSchema } from './schema';

function sveltekitConfig(o: NormalizedSchema): ProjectConfiguration {
  const cwd = joinPathFragments(o.appsDir, o.name);
  const root = cwd;
  return {
    root,
    projectType: 'application',
    sourceRoot: joinPathFragments(root, 'src'),
    targets: {
      build: {
        executor: '@nrwl/workspace:run-commands',
        options: {
          command: 'npx vite build',
          cwd,
        },
      },
      serve: {
        executor: '@nrwl/workspace:run-commands',
        options: {
          command: 'npx vite dev',
          cwd,
        },
      },
      lint: {
        executor: '@nrwl/workspace:run-commands',
        options: {
          command: 'npx eslint .',
          cwd,
        },
      },
    },
    tags: [],
  };
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

function updatePrettierIgnore(tree: Tree, options: NormalizedSchema) {
  const fname = '.prettierignore';
  const newPatterns = ['**/.svelte-kit', '**/build'];

  const buf = tree.read(fname);
  const content = buf
    ? buf.toString()
    : '# Add files here to ignore them from prettier formatting\n';

  const patterns = content.split('\n');

  const lines = [...patterns, '# Svelte-kit output', ...newPatterns, ''];

  tree.write(fname, lines.join('\n'));
}

// function addFiles(tree: Tree, options: NormalizedSchema) {
//   const templateOptions = {
//     ...options,
//     ...names(options.name),
//     offsetFromRoot: offsetFromRoot(options.projectRoot),
//     template: '',
//   };
//   generateFiles(
//     tree,
//     join(__dirname, 'files'),
//     options.projectRoot,
//     templateOptions
//   );
// }

export default async function (
  tree: Tree,
  options: ApplicationGeneratorSchema
): Promise<GeneratorCallback> {
  const normalizedOptions = normalizeOptions(tree, options);
  const config = sveltekitConfig(normalizedOptions);

  if (!isSvelte(tree, config)) {
    throw new Error(
      `Project '${normalizedOptions.name}' is not configured as a Svelte application`
    );
  }

  const packs = getSveltePackageVersions(tree, config);

  output.log({
    title: 'Svelte Packages',
    bodyLines: packs.map(
      (p) => `${output.colors.white(p.name)}: ${output.colors.green(p.version)}`
    ),
  });

  updatePrettierIgnore(tree, normalizedOptions);

  addProjectConfiguration(tree, normalizedOptions.name, config);
  return async () => {
    await formatFiles(tree);
  };
}
