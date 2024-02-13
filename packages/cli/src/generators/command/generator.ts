import type { TargetConfiguration, Tree } from '@nx/devkit';
import {
  formatFiles,
  generateFiles,
  getProjects,
  joinPathFragments,
  names,
  output,
  readNxJson,
} from '@nx/devkit';
import { join } from 'path';
import type { ConfigProp } from '../../utils/config';
import { readCliConfig, writeCliConfig } from '../../utils/config';
import refreshGenerator from '../refresh/generator';
import type { Schema as CommandGeneratorSchema } from './schema';

export interface NormalizedCommandSchema extends CommandGeneratorSchema {
  buildTargetMain?: string;
  description?: string;
  option: string[];
  parameter: string[];
  projectName: string;
  projectRoot: string;
  projectSrcRoot: string;
}

function normalizeOptions(
  tree: Tree,
  options: CommandGeneratorSchema
): NormalizedCommandSchema {
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

  let buildTargetMain = 'none';

  const { sourceRoot, targets } = project;
  if (targets) {
    const build: TargetConfiguration = targets['build'];
    buildTargetMain = (build.options && build.options.main) || 'none';
  }

  const parameter = options.parameter ?? [];
  const option = options.option ?? [];

  const projectSrcRoot = sourceRoot ?? 'src';
  const projectRoot = project.root;

  return {
    ...options,
    buildTargetMain,
    option,
    projectName,
    projectRoot,
    projectSrcRoot,
    parameter,
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

  if (normalizedOptions.parameter.some((param) => param === 'opts')) {
    throw new Error('"opts" is a reserved parameter name');
  }

  const config = readCliConfig(tree, normalizedOptions.projectRoot);
  const cmd = {
    description: `Description of ${normalizedOptions.name} command`,
    parameters: getDefaultProps(normalizedOptions.parameter),
    options: getDefaultProps(normalizedOptions.option),
  };
  config.commands[normalizedOptions.name] = cmd;

  addFiles(tree, normalizedOptions);
  updateIndex(tree, normalizedOptions);
  writeCliConfig(tree, normalizedOptions.projectRoot, config);

  const refreshCmd = `nx sync ${normalizedOptions.projectName}`;
  output.note({
    title: 'Next steps',
    bodyLines: [
      `1. Replace boilerplate descriptions and types for the new ${output.colors.green(
        normalizedOptions.name
      )} command in ${output.colors.cyan('cli.config.json')} `,
      `2. Run ${output.colors.green(refreshCmd)}`,
    ],
  });

  await refreshGenerator(tree, {
    all: true,
    project: normalizedOptions.projectName,
  });

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}
