import {
  formatFiles,
  generateFiles,
  getProjects,
  names,
  readNxJson,
  type Tree,
} from '@nx/devkit';
import { join } from 'path';
import { getSvelteConfig, getSvelteFiles } from '../../utils/svelte';
import type { Schema as ComponentGeneratorSchema } from './schema';

export interface NormalizedComponentSchema extends ComponentGeneratorSchema {
  projectLibRoot: string;
  projectName: string;
}

function normalizeOptions(
  tree: Tree,
  options: ComponentGeneratorSchema
): NormalizedComponentSchema {
  const ws = readNxJson(tree);
  const projectName = options.project ?? ws?.defaultProject;
  const projects = getProjects(tree);
  if (!projectName) {
    throw new Error('no project');
  }
  const project = projects.get(projectName);

  if (!project) {
    throw new Error(`Project "${projectName}" not found`);
  }

  const supportsRunes = false;

  const runes = options.runes ?? supportsRunes;

  const config = getSvelteConfig(tree, project);

  if (!config) {
    throw new Error(`Project "${projectName}" not configured for svelte`);
  }

  // TODO choose lib or routes (new sverdle has components next to route files)
  const { lib } = getSvelteFiles(config);
  options.language = options.language ?? 'js';
  options.style = options.style ?? 'css';
  return {
    ...options,
    runes,
    projectName,
    projectLibRoot: join(project.root, lib),
  };
}

function addFiles(tree: Tree, options: NormalizedComponentSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    tmpl: '',
  };
  generateFiles(
    tree,
    join(__dirname, './files'),
    join(options.projectLibRoot, options.directory ?? ''),
    templateOptions
  );
}

export default async function componentGenerator(
  tree: Tree,
  options: ComponentGeneratorSchema
): Promise<void> {
  const normalizedOptions = normalizeOptions(tree, options);
  addFiles(tree, normalizedOptions);
  if (!normalizedOptions.skipFormat) {
    await formatFiles(tree);
  }
}
