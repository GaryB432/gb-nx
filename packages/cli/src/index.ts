import { output } from '@nrwl/devkit';

export function noCommands(): void {
  const nx = 'npx nx';
  const generator = output.colors.cyan('@gb-nx/cli:command');
  const bodyLines = [
    'Create a command with',
    [nx, generator, 'my-command', '--parameter your-paramter'].join(' '),
    'see also',
    [nx, generator, '--help'].join(' '),
  ];
  output.warn({ title: 'No Commands', bodyLines });
}
