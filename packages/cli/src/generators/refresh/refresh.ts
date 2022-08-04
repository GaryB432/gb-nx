import {
  formatFiles,
  getProjects,
  joinPathFragments,
  names,
  readWorkspaceConfiguration,
  Tree,
} from '@nrwl/devkit';
import { getKindTypes, readCliConfig } from '../../utils/config';
import { getCommandMarkdown } from '../../utils/markdown';
import { getCommandTs } from '../../utils/sade';
import { makeCommandDeclarations } from '../../utils/typescript';
import { Schema as RefreshGeneratorSchema } from './schema';

export async function refreshGenerator(
  tree: Tree,
  options: RefreshGeneratorSchema
) {
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

    const config = readCliConfig(tree, project.root);
    if (options.ts) {
      for (const [name, cmd] of Object.entries(config.commands)) {
        tree.write(
          joinPathFragments(
            project.sourceRoot ?? '',
            'app',
            'commands',
            `${names(name).fileName}.types.d.ts`
          ),
          makeCommandDeclarations(
            getKindTypes(cmd.parameters),
            getKindTypes(cmd.options)
          )
        );
      }
    }

    if (options.main) {
      const targets = project.targets;

      if (targets) {
        const buildTarget = targets['build'];
        if (buildTarget && buildTarget.options) {
          const gls = [
            'prog',
            ".version('0.0.1-0')",
            ".option('--dryRun, -d', 'Do not write to disk', false)",
            ".option('--verbose', 'Show extra information', false)",
            ".option('-c, --config', 'Provide path to config file', 'cli.config.js');",
          ];
          const imports = [
            `import { ${Object.keys(config.commands)
              .map((f) => names(f).propertyName)
              .sort((a, b) => a.localeCompare(b))
              .map((f) => `${f}Command`)
              .join()} } from './app/commands';`,
          ];

          const cmds = Object.keys(config.commands).map((name) => {
            return getCommandTs(config.commands[name], names(name));
          });

          const prog = [
            '#!/usr/bin/env node',
            "import sade = require('sade');",
            ...imports,
            `const prog = sade('${projName}');`,
            ...gls,
            ...cmds,
            'prog.parse(process.argv);',
          ];
          const content = prog.join('\n');
          tree.write(buildTarget.options.main, content);
        }
      }
    }

    if (options.markdown) {
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

  return formatFiles(tree);
}
