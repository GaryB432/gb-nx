// import type { TargetConfiguration, Tree } from '@nx/devkit';
// import {
//   formatFiles,
//   generateFiles,
//   getProjects,
//   joinPathFragments,
//   names,
//   output,
//   readNxJson,
// } from '@nx/devkit';
// import { join } from 'path';
import {
  readCliConfig,
  writeCliConfig,
  type ConfigProp,
} from '../../utils/config';
// import refreshGenerator from '../refresh/refresh';
// import type { Schema as CommandGeneratorSchema } from './schema';

// export interface NormalizedCommandSchema extends CommandGeneratorSchema {
//   buildTargetMain?: string;
//   description?: string;
//   option: string[];
//   parameter: string[];
//   projectName: string;
//   projectRoot: string;
//   projectSrcRoot: string;
// }

// function normalizeOptions(
//   tree: Tree,
//   options: CommandGeneratorSchema
// ): NormalizedCommandSchema {
//   const ws = readNxJson(tree);
//   const projectName = options.project ?? ws?.defaultProject;
//   const projects = getProjects(tree);
//   if (!projectName) {
//     throw new Error('no project');
//   }
//   const project = projects.get(projectName);

//   if (!project) {
//     throw new Error(`Project "${projectName}" not found`);
//   }

//   let buildTargetMain = 'none';

//   const { sourceRoot, targets } = project;
//   if (targets) {
//     const build: TargetConfiguration = targets['build'];
//     buildTargetMain = (build.options && build.options.main) || 'none';
//   }

//   const parameter = options.parameter ?? [];
//   const option = options.option ?? [];

//   const projectSrcRoot = sourceRoot ?? 'src';
//   const projectRoot = project.root;

//   return {
//     ...options,
//     buildTargetMain,
//     option,
//     projectName,
//     projectRoot,
//     projectSrcRoot,
//     parameter,
//   };
// }

// function addFiles(tree: Tree, options: NormalizedCommandSchema) {
//   const parms = options.parameter ?? [];
//   const commandParameters = `{ ${[...parms, 'opts'].join(', ')} }`;
//   const templateOptions = {
//     ...options,
//     ...names(options.name),
//     commandParameters,
//     tmpl: '',
//   };
//   generateFiles(
//     tree,
//     join(__dirname, './files'),
//     join(options.projectSrcRoot, 'app', 'commands'),
//     templateOptions
//   );
// }

function updateIndex(tree: Tree, options: NormalizedSchema) {
  console.log(options, tree.children('apps/my-app'));
  const ndxPath = joinPathFragments(
    options.projectSourceRoot,
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
  lines.push(`export * from './${options.fileName}.command';`);
  tree.write(ndxPath, lines.sort().join('\n'));
}

function getDefaultProps(
  names: string[] | undefined
): Record<string, ConfigProp> {
  return (names ?? []).reduce((a, b) => {
    a[b] = { type: 'string', description: `Description of ${b}` };
    return a;
  }, {} as Record<string, ConfigProp>);
}

// export default async function commandGenerator(
//   tree: Tree,
//   options: CommandGeneratorSchema
// ): Promise<void> {
//   const normalizedOptions = normalizeOptions(tree, options);

// }

import type { Tree } from '@nx/devkit';
import {
  formatFiles,
  generateFiles,
  joinPathFragments,
  names,
  output,
} from '@nx/devkit';
// import { addToNgModule } from '../utils';
// import { getInstalledAngularVersionInfo } from '../utils/version-utils';
import {
  // exportComponentInEntryPoint,
  // findModuleFromOptions,
  normalizeOptions,
} from './lib';
import type { NormalizedSchema, Schema } from './schema';
import refreshGenerator from '../refresh/refresh';
// import { NormalizedOptions } from '../application/schema';

// function addFiles(tree: Tree, options: NormalizedCommandSchema) {
//   generateFiles(
//     tree,
//     join(__dirname, './files'),
//     join(options.projectSrcRoot, 'app', 'commands'),
//     templateOptions
//   );
// }

// export async function componentGenerator(tree: Tree, rawOptions: Schema) {
//   await componentGeneratorInternal(tree, {
//     nameAndDirectoryFormat: 'derived',
//     ...rawOptions,
//   });
// }

function updateConfiguration(tree: Tree, options: NormalizedSchema) {
  const config = readCliConfig(tree, options.projectRoot);
  const cmd = {
    description: `Description of ${options.name} command`,
    parameters: getDefaultProps(options.parameter),
    options: getDefaultProps(options.option),
  };
  config.commands[options.name] = cmd;

  writeCliConfig(tree, options.projectRoot, config);
}

export async function commandGenerator(tree: Tree, rawOptions: Schema) {
  const options = await normalizeOptions(tree, rawOptions);

  if (options.parameter?.some((param) => param === 'opts')) {
    throw new Error('"opts" is a reserved parameter name');
  }

  // const { major: angularMajorVersion } = getInstalledAngularVersionInfo(tree);

  const parms = options.parameter ?? [];
  const commandParameters = `{ ${[...parms, 'opts'].join(', ')} }`;
  const templateOptions = {
    ...options,
    ...names(options.name),
    commandParameters,
    tmpl: '',
  };

  // const oldparms = {
  //   name: options.name,
  //   fileName: options.fileName,
  //   symbolName: options.symbolName,
  //   style: options.style,
  //   inlineStyle: options.inlineStyle,
  //   inlineTemplate: options.inlineTemplate,
  //   standalone: options.standalone,
  //   skipSelector: options.skipSelector,
  //   changeDetection: options.changeDetection,
  //   viewEncapsulation: options.viewEncapsulation,
  //   displayBlock: options.displayBlock,
  //   selector: options.selector,
  //   angularMajorVersion,
  //   tpl: '',
  // };

  generateFiles(
    tree,
    joinPathFragments(__dirname, 'files'),
    options.directory,
    templateOptions
  );

  if (options.skipTests) {
    const pathToSpecFile = joinPathFragments(
      options.directory,
      `${options.fileName}.command.spec.ts`
    );

    tree.delete(pathToSpecFile);
  }

  // if (options.inlineTemplate) {
  //   const pathToTemplateFile = joinPathFragments(
  //     options.directory,
  //     `${options.fileName}.html`
  //   );

  //   tree.delete(pathToTemplateFile);
  // }

  // if (options.style === 'none' || options.inlineStyle) {
  //   const pathToStyleFile = joinPathFragments(
  //     options.directory,
  //     `${options.fileName}.${options.style}`
  //   );

  //   tree.delete(pathToStyleFile);
  // }

  // if (!options.skipImport && !options.standalone) {
  //   const modulePath = findModuleFromOptions(
  //     tree,
  //     options,
  //     options.projectRoot
  //   );
  //   addToNgModule(
  //     tree,
  //     options.directory,
  //     modulePath,
  //     options.name,
  //     options.symbolName,
  //     options.fileName,
  //     'declarations',
  //     true,
  //     options.export
  //   );
  // }

  // exportComponentInEntryPoint(tree, options);

  if (options.export) {
    updateIndex(tree, options);
  }
  updateConfiguration(tree, options);

  const refreshCmd = `nx sync ${options.projectName}`;
  output.note({
    title: 'Next steps',
    bodyLines: [
      `1. Replace boilerplate descriptions and types for the new ${output.colors.green(
        options.name
      )} command in ${output.colors.cyan('cli.config.json')} `,
      `2. Run ${output.colors.green(refreshCmd)}`,
    ],
  });

  await refreshGenerator(tree, {
    all: true,
    project: options.projectName,
  });
  // return await formatFiles(tree);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

export default commandGenerator;
