import { output, readNxJson, updateNxJson, type Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import applicationGenerator from '../application/application';
import commandGenerator from '../command/command';
import refreshGenerator from './refresh';

let noted: unknown;
jest.spyOn(output, 'note').mockImplementation((m) => {
  noted = { ...m };
});

describe('command', () => {
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

  it('should generate command in commands directory', async () => {
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
});
