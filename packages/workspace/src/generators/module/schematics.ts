import { type ProjectConfiguration } from '@nrwl/devkit';
import { type Schema } from './schema';

export function directoryName(
  ws: { appsDir: string; libsDir: string },
  project: ProjectConfiguration,
  options: Schema
): string {
  if (options.directory) {
    return options.directory;
  }
  return project.projectType === 'application' ? ws.appsDir : ws.libsDir;
}
