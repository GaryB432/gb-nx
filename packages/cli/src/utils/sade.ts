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

export function getCommandExamples(
  command: ConfigCommand,
  names: { name: string; propertyName: string }
): string[] {
  const parameters = command.parameters ?? {};
  const options = command.options ?? {};
  const pz = Object.keys(parameters);
  const os = Object.keys(options);
  const ppz = pz.map((p) => `${p}1`);
  const osz = os
    .map((o) => {
      const oo = options[o];
      switch (oo.type) {
        case 'boolean': {
          return oo.default ? undefined : `--${o}=false`;
        }
        case 'number': {
          return `--${o}=1`;
        }
        default: {
          return `--${o}=${o}1`;
        }
      }
    })
    .filter((o) => !!o);
  return [[names.name, ...ppz, ...osz].join(' ')];
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
    ...getCommandExamples(command, names).map((e) => `example('${e}')`),
    `action(async (${argz}) => { ${checks.join('')}await ${
      names.propertyName
    }Command({ ${argz} }); })`,
  ];
  const code = ['prog', ...lns].join('\n.') + ';';
  return code;
}
