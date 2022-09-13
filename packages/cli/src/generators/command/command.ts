import {
  formatFiles,
  generateFiles,
  getProjects,
  joinPathFragments,
  names,
  readWorkspaceConfiguration,
  TargetConfiguration,
  Tree,
} from '@nrwl/devkit';
import { join } from 'path';
import { ConfigProp, readCliConfig, writeCliConfig } from '../../utils/config';
import refreshGenerator from '../refresh/refresh';
import { Schema as CommandGeneratorSchema } from './schema';

export interface NormalizedCommandSchema extends CommandGeneratorSchema {
  description?: string;
  buildTargetMain?: string;
  projectName: string;
  projectRoot: string;
  projectSrcRoot: string;
}

function normalizeOptions(
  tree: Tree,
  options: CommandGeneratorSchema
): NormalizedCommandSchema {
  const ws = readWorkspaceConfiguration(tree);
  const projectName = options.project ?? ws.defaultProject;
  const projects = getProjects(tree);
  if (!projectName) {
    throw new Error('no project');
  }
  const project = projects.get(projectName);

  if (!project) {
    throw new Error(`Project "${projectName}" not found`);
  }

  let buildTargetMain = 'none';

  const { sourceRoot, targets } = project;
  if (targets) {
    const build: TargetConfiguration<{ main: string }> = targets['build'];
    buildTargetMain = (build.options && build.options.main) || 'none';
  }

  const projectSrcRoot = sourceRoot ?? 'src';
  const projectRoot = project.root;

  return {
    ...options,
    buildTargetMain,
    projectName,
    projectRoot,
    projectSrcRoot,
  };
}

function addFiles(tree: Tree, options: NormalizedCommandSchema) {
  const parms = options.parameter ?? [];
  const commandParameters = `{ ${[...parms, 'opts'].join(', ')} }`;
  const templateOptions = {
    ...options,
    ...names(options.name),
    commandParameters,
    tmpl: '',
  };
  generateFiles(
    tree,
    join(__dirname, './files'),
    join(options.projectSrcRoot, 'app', 'commands'),
    templateOptions
  );
}

function updateIndex(tree: Tree, options: NormalizedCommandSchema) {
  const ndxPath = joinPathFragments(
    options.projectSrcRoot,
    'app',
    'commands',
    'index.ts'
  );
  const buf = tree.read(ndxPath);
  const lines = buf
    ? buf
        .toString()
        .split('\n')
        .map((line) => line.trim())
    : [];
  lines.push(`export * from './${names(options.name).fileName}.command';`);
  tree.write(ndxPath, lines.sort().join('\n'));
}

function getDefaultProps(names: string[]): Record<string, ConfigProp> {
  return names.reduce((a, b) => {
    a[b] = { type: 'string', description: `Description of ${b}` };
    return a;
  }, {} as Record<string, ConfigProp>);
}

export default async function commandGenerator(
  tree: Tree,
  options: CommandGeneratorSchema
): Promise<void> {
  const normalizedOptions = normalizeOptions(tree, options);
  const config = readCliConfig(tree, normalizedOptions.projectRoot);

  const cmd = {
    description: `${normalizedOptions.name} description`,
    parameters: getDefaultProps(normalizedOptions.parameter ?? []),
    options: getDefaultProps(normalizedOptions.option ?? []),
  };
  config.commands[normalizedOptions.name] = cmd;

  addFiles(tree, normalizedOptions);
  if (options.export) {
    updateIndex(tree, normalizedOptions);
  }
  writeCliConfig(tree, normalizedOptions.projectRoot, config);
  await refreshGenerator(tree, {
    all: true,
    project: normalizedOptions.projectName,
  });
  return await formatFiles(tree);
}
