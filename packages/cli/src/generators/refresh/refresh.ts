import type { Tree } from '@nrwl/devkit';
import {
  formatFiles,
  getProjects,
  joinPathFragments,
  names,
  readWorkspaceConfiguration,
} from '@nrwl/devkit';
import { getKindTypes, readCliConfig } from '../../utils/config';
import { getCommandMarkdown } from '../../utils/markdown';
import { getCommandTs } from '../../utils/sade';
import { makeCommandDeclarations } from '../../utils/typescript';
import type { Schema as RefreshGeneratorSchema } from './schema';

export default async function refreshGenerator(
  tree: Tree,
  options: RefreshGeneratorSchema
): Promise<void> {
  const fun = true;
  const ws = readWorkspaceConfiguration(tree);
  const projects = getProjects(tree);
  if (projects) {
    const projName = options.project ?? ws.defaultProject;
    if (!projName) {
      throw new Error('no project');
    }
    const project = projects.get(projName);

    if (!project) {
      throw new Error(`Project "${projName}" not found`);
    }

    if (!(options.all || options.main || options.markdown || options.ts)) {
      throw new Error('choose an option');
    }

    const config = readCliConfig(tree, project.root);

    const program = config.program ?? {
      name: projName,
      version: '0.0.0',
    };

    if (options.all || options.ts) {
      for (const [name, cmd] of Object.entries(config.commands)) {
        tree.write(
          joinPathFragments(
            project.sourceRoot ?? '',
            'app',
            'commands',
            `${names(name).fileName}.types.d.ts`
          ),
          makeCommandDeclarations(
            projName,
            getKindTypes(cmd.parameters ?? {}),
            getKindTypes(cmd.options ?? {})
          )
        );
      }
    }

    if (options.all || options.main) {
      const targets = project.targets;

      if (targets) {
        const buildTarget = targets['build'];
        if (buildTarget && buildTarget.options && buildTarget.options.main) {
          const gls = [
            'prog',
            `.version('${program.version}')`,
            ".option('--dryRun, -d', 'Do not write to disk')",
            ".option('--verbose', 'Show extra information')",
            ".option('-c, --config', 'Provide path to config file', 'cli.config.js');",
          ];
          const imports =
            Object.keys(config.commands).length > 0
              ? [
                  `import { ${Object.keys(config.commands)
                    .map((f) => names(f).propertyName)
                    .sort((a, b) => a.localeCompare(b))
                    .map((f) => `${f}Command`)
                    .join()} } from './app/commands';`,
                ]
              : [];

          const cmds = Object.keys(config.commands).map((name) => {
            return getCommandTs(config.commands[name], names(name));
          });

          const prog = [
            '#!/usr/bin/env node',
            `/* This is a generated file. Make changes to cli.config.json and run "nx sync ${program.name}" */`,
            "import sade = require('sade');",
            ...imports,
            `const prog = sade('${program.name}');`,
            ...gls,
            ...cmds,
            'prog.parse(process.argv);',
          ];
          const content = prog.join('\n');
          tree.write(buildTarget.options.main, content);
        } else {
          throw new Error('no build options main');
        }
      }
    }

    if (options.all || options.markdown) {
      const prog = [
        '# Command Reference\n',
        ...Object.keys(config.commands).map((name) => {
          return getCommandMarkdown(config.commands[name], names(name));
        }),
      ];
      const content = prog.join('\n');
      tree.write(joinPathFragments(project.root, 'commands.md'), content);
    }
  }

  await formatFiles(tree);
}
