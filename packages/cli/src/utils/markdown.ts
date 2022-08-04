import { ConfigCommand } from './config';

export function tableHeader(...cells: string[]): string {
  const row = tableRow(...cells);
  const underline = tableRow(...cells.map(() => '----'));
  return [row, underline].join('\n');
}

export function tableRow(...cells: string[]): string {
  return ['', ...cells, ''].join(' | ').slice(1);
}

export function getCommandMarkdown(
  command: ConfigCommand,
  names: { name: string; propertyName: string }
): string {
  const pz = Object.keys(command.parameters);
  const os = Object.keys(command.options);

  const lns = [`## ${names.name}\n`, `${command.description}\n`];

  const def = (o: string | number | boolean | undefined): string =>
    o ? o.toString() : '';

  if (pz.length > 0) {
    lns.push(
      '### Arguments\n',
      tableHeader('ARGUMENT', 'DESCRIPTION'),
      ...pz.map((p) =>
        tableRow(`\`${p}\``, command.parameters[p].description ?? '')
      ),
      ''
      // `example('${command} src build --dryRun')`,
      // `example('${command} app public -o main.js')`,
    );
  }

  if (os.length > 0) {
    lns.push(
      '### Options\n',
      tableHeader('OPTION', 'DESCRIPTION', 'DEFAULT'),
      // ...os.map((o) => getPropRow(o, command.options[o])),
      ...os.map((o) =>
        tableRow(
          `\`--${o}\``,
          command.options[o].description ?? '',
          def(command.options[o].default)
        )
      ),
      ''
      // `example('${command} src build --dryRun')`,
      // `example('${command} app public -o main.js')`,
    );
  }
  const code = [...lns].join('\n');
  return code;
}
