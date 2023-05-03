import { output } from '@nx/devkit';

export function noCommands(): void {
  const nxgcli = ['nx', 'generate', output.colors.cyan('@gb-nx/cli:command')];
  const bodyLines = [
    'Create a command with',
    [...nxgcli, 'my-command', '--parameter your-paramter'].join(' '),
    'see also',
    [...nxgcli, '--help'].join(' '),
  ];
  output.warn({ title: 'No Commands', bodyLines });
}
