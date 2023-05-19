import { output, readNxJson, updateNxJson, type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import applicationGenerator from '../application/application';
import commandGenerator from '../command/command';
import refreshGenerator from './refresh';

let noted: unknown;
jest.spyOn(output, 'note').mockImplementation((m) => {
  noted = { ...m };
});

describe('refresh', () => {
  let tree: Tree;
  const projectName = 'my-app';
  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    await applicationGenerator(tree, {
      name: projectName,
    });
    const workspace = readNxJson(tree);
    if (!workspace) throw new Error('no nx');
    workspace.defaultProject = projectName;
    updateNxJson(tree, workspace);
    await commandGenerator(tree, {
      name: 'apple',
      parameter: ['a', 'b'],
      option: ['c', 'd'],
    });
    await commandGenerator(tree, {
      name: 'banana',
      parameter: ['e', 'f'],
      option: ['g', 'h'],
    });
  });

  it('should generate markdown', async () => {
    await refreshGenerator(tree, { markdown: true });

    expect(tree.read('apps/my-app/commands.md', 'utf-8'))
      .toMatchInlineSnapshot(`
      "# Command Reference

      ## apple

      Description of apple command

      ### Arguments

      | ARGUMENT | DESCRIPTION      |
      | -------- | ---------------- |
      | \`a\`      | Description of a |
      | \`b\`      | Description of b |

      ### Options

      | OPTION | DESCRIPTION      | DEFAULT |
      | ------ | ---------------- | ------- |
      | \`--c\`  | Description of c |         |
      | \`--d\`  | Description of d |         |

      ## banana

      Description of banana command

      ### Arguments

      | ARGUMENT | DESCRIPTION      |
      | -------- | ---------------- |
      | \`e\`      | Description of e |
      | \`f\`      | Description of f |

      ### Options

      | OPTION | DESCRIPTION      | DEFAULT |
      | ------ | ---------------- | ------- |
      | \`--g\`  | Description of g |         |
      | \`--h\`  | Description of h |         |
      "
    `);
  });

  it('should generate stuff', async () => {
    await refreshGenerator(tree, { main: true });

    expect(tree.read('apps/my-app/src/main.ts', 'utf-8'))
      .toMatchInlineSnapshot(`
      "#!/usr/bin/env node
      /* This is a generated file. Make changes to cli.config.json and run "nx sync my-app" */
      import sade = require('sade');
      import { appleCommand, bananaCommand } from './app/commands';
      const prog = sade('my-app');
      prog
        .version('0.0.1-0')
        .option('--dryRun, -d', 'Do not write to disk')
        .option('--verbose', 'Show extra information')
        .option('-c, --config', 'Provide path to config file', 'cli.config.js');
      prog
        .command('apple <a> <b>')
        .describe('Description of apple command')
        .option('--c', 'Description of c')
        .option('--d', 'Description of d')
        .example('apple a1 b1 --c=c1 --d=d1')
        .action(async (a, b, opts) => {
          await appleCommand({ a, b, opts });
        });
      prog
        .command('banana <e> <f>')
        .describe('Description of banana command')
        .option('--g', 'Description of g')
        .option('--h', 'Description of h')
        .example('banana e1 f1 --g=g1 --h=h1')
        .action(async (e, f, opts) => {
          await bananaCommand({ e, f, opts });
        });
      const argv = [...process.argv];
      if (argv.length < 3) {
        argv.push('--help');
      }
      prog.parse(argv);
      "
    `);
  });
});

describe('refresh no commands', () => {
  let tree: Tree;
  const projectName = 'my-app';
  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    await applicationGenerator(tree, {
      name: projectName,
    });
    const workspace = readNxJson(tree);
    if (!workspace) throw new Error('no nx');
    workspace.defaultProject = projectName;
    updateNxJson(tree, workspace);
  });

  it('should generate markdown', async () => {
    await refreshGenerator(tree, { markdown: true });

    expect(tree.read('apps/my-app/commands.md', 'utf-8'))
      .toMatchInlineSnapshot(`
      "# Command Reference
      "
    `);
  });

  it('should generate stuff', async () => {
    await refreshGenerator(tree, { main: true });

    expect(tree.read('apps/my-app/src/main.ts', 'utf-8'))
      .toMatchInlineSnapshot(`
      "#!/usr/bin/env node
      /* This is a generated file. Make changes to cli.config.json and run "nx sync my-app" */
      import { noCommands } from '@gb-nx/cli';
      noCommands();
      "
    `);
  });
});
