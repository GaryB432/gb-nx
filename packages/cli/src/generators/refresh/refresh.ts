import {
  formatFiles,
  getProjects,
  joinPathFragments,
  names,
  type Tree,
} from '@nx/devkit';
import {
  type ConfigCommand,
  getKindTypes,
  readCliConfig,
} from '../../utils/config';
import { getCommandMarkdown } from '../../utils/markdown';
import { getCommandTs } from '../../utils/sade';
import { makeCommandDeclarations } from '../../utils/typescript';
import type { Schema as RefreshGeneratorSchema } from './schema';

export default async function refreshGenerator(
  tree: Tree,
  options: RefreshGeneratorSchema
): Promise<void> {
  // const ws = readNxJson(tree);
  const projects = getProjects(tree);
  if (projects) {
    const projName = options.project;
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
        writeTsFiles(project.sourceRoot, name, projName, cmd);
      }
    }

    if (options.all || options.main) {
      const targets = project.targets;
      const cmdNames = Object.keys(config.commands);

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
          const cmdimports = `import { ${cmdNames
            .map((f) => names(f).propertyName)
            .sort((a, b) => a.localeCompare(b))
            .map((f) => `${f}Command`)
            .join(',')} } from './app/commands';`;
          const cmds = cmdNames.map((name) =>
            getCommandTs(config.commands[name], names(name))
          );

          const sheBanger = [
            '#!/usr/bin/env node',
            `/* This is a generated file. Make changes to cli.config.json and run "nx sync ${project.name}" */`,
          ];

          const sadeProg = [
            "import sade = require('sade');",
            cmdimports,
            `const prog = sade('${program.name}');`,
            ...gls,
            ...cmds,
          ];

          const prog = [
            ...sheBanger,
            ...sadeProg,
            'const argv = [...process.argv];',
            'if (argv.length < 3) {',
            "  argv.push('--help');",
            '}',
            'prog.parse(argv);',
          ];
          const noCommands = [
            ...sheBanger,
            "import {noCommands} from '@gb-nx/cli';",
            'noCommands();',
          ];
          const content = cmdNames.length === 0 ? noCommands : prog;
          tree.write(buildTarget.options.main, content.join('\n'));
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

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  function writeTsFiles(
    sourceRoot: string | undefined,
    commandName: string,
    projName: string,
    cmd: ConfigCommand
  ) {
    tree.write(
      joinPathFragments(
        sourceRoot ?? '',
        'app',
        'commands',
        `${names(commandName).fileName}.types.d.ts`
      ),
      makeCommandDeclarations(
        projName,
        getKindTypes(cmd.parameters ?? {}),
        getKindTypes(cmd.options ?? {})
      )
    );
  }
}
