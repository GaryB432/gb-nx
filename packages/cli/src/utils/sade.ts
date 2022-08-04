import { ConfigCommand, ConfigProp } from './config';

function enQuote(s: string): string {
  return `'${s}'`;
}

function makeCommandOption(name: string, opt: ConfigProp): string {
  const args: (string | number)[] = [
    enQuote(`--${name}`),
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
  const pz = Object.keys(command.parameters);
  const os = Object.keys(command.options);

  const argz = [...pz, 'opts'].join();
  const line = [names.name, ...pz.map((p) => `<${p}>`)].join(' ');

  const lns = [
    `command('${line}')`,
    `describe('${command.description}')`,
    ...os.map((o) => makeCommandOption(o, command.options[o])),

    // `example('${command} src build --dryRun')`,
    // `example('${command} app public -o main.js')`,
    `action(async (${argz}) => { await ${names.propertyName}Command({ ${argz} }); })`,
  ];
  const code = ['prog', ...lns].join('\n.') + ';';
  return code;
}
