import type { ProjectNameAndRootFormat } from '@nx/devkit/src/generators/project-name-and-root-utils';
import type { Linter } from '@nx/linter';

export interface ExtensionGeneratorOptions {
  directory?: string;
  linter?: Linter;
  name: string;
  projectNameAndRootFormat?: ProjectNameAndRootFormat;
  rootProject?: boolean;
  setParserOptionsProject?: boolean;
  skipFormat?: boolean;
  strict?: boolean;
  tags?: string;
  unitTestRunner?: 'jest' | 'none';
}

interface NormalizedOptions extends ExtensionGeneratorOptions {
  appProjectName: string;
  appProjectRoot: Path;
}
