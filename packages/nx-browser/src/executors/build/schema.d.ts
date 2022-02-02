import { ExecutorContext } from '@nrwl/devkit';
import { ParsedPath } from 'path';
import { Logger } from '../../utils/logger';

export type AssetPattern =
  | {
      glob: string;
      input: string;
      ignore?: string[];
      output: string;
    }
  | string;

export interface BuildExecutorSchema {
  manifest: string;
  outputPath: string;
  watch?: boolean;
}

export interface InOutInfo {
  in: ParsedPath;
  out: ParsedPath;
}

export interface BuildExecutorOptions extends BuildExecutorSchema {
  textToEcho: string;
}

export interface BuildExecutorContext extends ExecutorContext {
  logger: Logger;
}
