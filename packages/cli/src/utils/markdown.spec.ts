import type { ConfigCommand } from './config';
import { getCommandMarkdown, tableHeader } from './markdown';

const testCommand: ConfigCommand = {
  description: 'TEST description',
  parameters: {
    start: {
      description: 'The start date in ISO format',
      type: 'number', // ignored. parameters are always strings
    },
    middle: {}, // missing type and description
    End: {
      description: 'Another upper case one for some reason',
      type: 'string',
    },
  },
  options: {
    opta: { type: 'boolean', description: 'Description of opta' },
    optb: { type: 'boolean', description: 'Description of optb' },
    optc: {},
    optd: { type: 'boolean', description: 'A Description of optd' },
    opte: {
      type: 'boolean',
      description: 'Description of opte',
      default: true,
    },
    optf: { type: 'boolean', description: 'Description of optf' },
    opto: { type: 'boolean', description: 'Description of opto' },
    optp: { type: 'boolean', description: 'Description of optp' },
  },
};

describe('markdown', () => {
  it('should get table header', () => {
    expect(tableHeader('a', 'b', 'c')).toMatchInlineSnapshot(`
      "| a | b | c | 
      | ---- | ---- | ---- | "
    `);
  });

  it('should get md', () => {
    expect(
      getCommandMarkdown(testCommand, {
        name: 'UpperCase',
        propertyName: 'upperCase',
      })
    ).toMatchInlineSnapshot(`
      "## UpperCase

      TEST description

      ### Arguments

      | ARGUMENT | DESCRIPTION | 
      | ---- | ---- | 
      | \`start\` | The start date in ISO format | 
      | \`middle\` | Description of middle parameter | 
      | \`End\` | Another upper case one for some reason | 

      ### Options

      | OPTION | DESCRIPTION | DEFAULT | 
      | ---- | ---- | ---- | 
      | \`--opta\` | Description of opta |  | 
      | \`--optb\` | Description of optb |  | 
      | \`--optc\` | Description of optc |  | 
      | \`--optd\` | A Description of optd |  | 
      | \`--opte\` | Description of opte | true | 
      | \`--optf\` | Description of optf |  | 
      | \`--opto\` | Description of opto |  | 
      | \`--optp\` | Description of optp |  | 
      "
    `);
  });
});
