import type { ProjectNameAndRootFormat } from '@nx/devkit/src/generators/project-name-and-root-utils';
import type { Linter } from '@nx/linter';

export interface CliGeneratorOptions {
  directory?: string;
  e2eTestRunner?: 'jest' | 'none';
  linter?: Linter;
  name: string;
  rootProject?: boolean;
  setParserOptionsProject?: boolean;
  skipFormat?: boolean;
  skipPackageJson?: boolean;
  strict?: boolean;
  tags?: string;
  unitTestRunner?: 'jest' | 'none';
}

interface NormalizedOptions extends CliGeneratorOptions {
  appProjectName: string;
  appProjectRoot: Path;
}
