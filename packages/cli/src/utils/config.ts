import type { Tree } from '@nrwl/devkit';
import { joinPathFragments } from '@nrwl/devkit';
import type { Kind, KindThing } from './types';

export interface ConfigProp {
  alias?: string;
  default?: string | number | boolean;
  description?: string;
  type?: Kind;
}

export interface ConfigCommand {
  alias?: string;
  description?: string;
  options?: Record<string, ConfigProp>;
  parameters?: Record<string, ConfigProp>;
}

export interface Config {
  commands: Record<string, ConfigCommand>;
  global?: ConfigCommand;
  program?: {
    name: string;
    version: string;
  };
  version: number;
}

function configPath(projectRoot: string): string {
  return joinPathFragments(projectRoot, 'cli.config.json');
}

export function getKindTypes(
  subject: Record<string, ConfigProp>,
  init: Record<string, KindThing> = {}
): Record<string, KindThing> {
  if (!subject) {
    return {};
  }
  return Object.entries(subject).reduce<Record<string, KindThing>>(
    (a, [name, c]) => {
      a[name] = { ...c, kind: c.type };
      return a;
    },
    init
  );
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
