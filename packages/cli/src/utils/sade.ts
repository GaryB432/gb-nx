import type { ConfigCommand, ConfigProp } from './config';

function enQuote(s: string): string {
  return s.match("'") ? `"${s}"` : `'${s}'`;
}

function makeCommandOption(name: string, opt: ConfigProp): string {
  const args: (string | number)[] = [
    enQuote(opt.alias ? `-${opt.alias}, --${name}` : `--${name}`),
    enQuote(opt.description ?? `description of ${name} option`),
  ];
  const def = opt.default;
  if (def) {
    if (typeof def === opt.type) {
      args.push(typeof def === 'string' ? enQuote(def) : def.toString());
    } else {
      throw new Error(`type mismatch ${name} ${opt.type}`);
    }
  }
  return ['option(', args.join(), ')'].join('');
}

export function getCommandTs(
  command: ConfigCommand,
  names: { name: string; propertyName: string }
): string {
  const parameters = command.parameters ?? {};
  const options = command.options ?? {};
  const pz = Object.keys(parameters);
  const os = Object.keys(options);

  const argz = [...pz, 'opts'].join();
  const line = [names.name, ...pz.map((p) => `<${p}>`)].join(' ');

  const checks = os
    .filter((o) => options[o].type === 'number')
    .map(
      (o) =>
        `if (opts.${o} && typeof opts.${o} !== 'number') throw new Error('${o} must be a number');`
    );

  const lns = [
    `command('${line}')`,
    `describe(${enQuote(command.description ?? 'tbd')})`,
    ...os.map((o) => makeCommandOption(o, options[o])),

    // `example('${command} src build --dryRun')`,
    // `example('${command} app public -o main.js')`,
    //

    `action(async (${argz}) => { ${checks.join('')}await ${
      names.propertyName
    }Command({ ${argz} }); })`,
  ];
  const code = ['prog', ...lns].join('\n.') + ';';
  return code;
}
