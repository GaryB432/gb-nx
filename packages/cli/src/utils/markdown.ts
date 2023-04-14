import type { ConfigCommand } from './config';

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
  const { parameters, options } = command;

  const lns = [`## ${names.name}\n`, `${command.description}\n`];

  const def = (o: string | number | boolean | undefined): string =>
    o ? o.toString() : '';

  if (parameters) {
    const pz = Object.keys(parameters);
    lns.push(
      '### Arguments\n',
      tableHeader('ARGUMENT', 'DESCRIPTION'),
      ...pz.map((p) => {
        if (parameters) {
          return tableRow(
            `\`${p}\``,
            parameters[p].description ?? `Description of ${p} parameter`
          );
        }
        return tableRow();
      }),
      ''
      // `example('${command} src build --dryRun')`,
      // `example('${command} app public -o main.js')`,
    );
  }

  if (options) {
    const os = Object.keys(options);
    lns.push(
      '### Options\n',
      tableHeader('OPTION', 'DESCRIPTION', 'DEFAULT'),
      // ...os.map((o) => getPropRow(o, command.options[o])),
      ...os.map((o) =>
        tableRow(
          `\`--${o}\``,
          options[o].description ?? `Description of ${o}`,
          def(options[o].default)
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
