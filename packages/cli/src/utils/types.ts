export type Kind = 'string' | 'number' | 'boolean' | 'unknown';

export interface KindThing {
  alias?: string;
  description?: string;
  kind: Kind;
}

export type Argument = KindThing;
export type Option = KindThing;

export interface Command {
  alias?: string;
  options?: Record<string, Option>;
  parameters?: Record<string, Argument>;
}
