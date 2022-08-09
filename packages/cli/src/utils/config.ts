import { joinPathFragments, Tree } from '@nrwl/devkit';
import { Kind, KindThing } from './types';

export interface ConfigProp {
  default?: string | number | boolean;
  description?: string;
  type: Kind;
}

export interface ConfigCommand {
  alias?: string;
  description?: string;
  parameters: Record<string, ConfigProp>;
  options: Record<string, ConfigProp>;
}

export interface Config {
  version: number;
  program?: {
    name: string;
    version: string;
  }
  global?: ConfigCommand;
  commands: Record<string, ConfigCommand>;
}

function configPath(projectRoot: string): string {
  return joinPathFragments(projectRoot, 'cli.config.json');
}

export function getKindTypes(
  subject: Record<string, ConfigProp>,
  init: Record<string, KindThing> = {}
): Record<string, KindThing> {
  return Object.entries(subject).reduce((a, [name, c]) => {
    a[name] = { ...c, kind: c.type };
    return a;
  }, init);
}

export function readCliConfig(tree: Tree, projectRoot: string): Config {
  const buff = tree.read(configPath(projectRoot));
  return buff
    ? (JSON.parse(buff.toString()) as Config)
    : {
        version: 2,
        commands: {},
      };
}

export function writeCliConfig(
  tree: Tree,
  projectRoot: string,
  config: Config
): void {
  return tree.write(configPath(projectRoot), JSON.stringify(config));
}
