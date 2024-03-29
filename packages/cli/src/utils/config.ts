import type { Tree } from '@nx/devkit';
import { joinPathFragments } from '@nx/devkit';
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
  if (!buff) {
    throw new Error('not a cli project');
  }
  return JSON.parse(buff.toString()) as Config;
}

export function writeCliConfig(
  tree: Tree,
  projectRoot: string,
  config: Config
): void {
  return tree.write(configPath(projectRoot), JSON.stringify(config));
}
