import {
  joinPathFragments,
  output,
  type ExecutorContext,
  type TargetConfiguration,
} from '@nx/devkit';
import { type WebpackExecutorOptions } from '@nx/webpack';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { getParts, schemaValidate } from '../../manifest/manifest';
import { type ZipExecutorSchema } from './schema';
import AdmZip = require('adm-zip');

export default async function runExecutor(
  options: ZipExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  let success = false;
  if (context.workspace && context.projectName) {
    const { targets } = context.workspace.projects[context.projectName];
    if (targets) {
      const build: TargetConfiguration<WebpackExecutorOptions> =
        targets['build'];
      if (build && build.executor === '@nx/webpack:webpack' && build.options) {
        options.outputFileName ??= `zip/${context.projectName}-{manifest-version}.zip`;
        const manifestName = joinPathFragments(
          build.options.outputPath,
          'manifest.json'
        );
        const manifestString = readFileSync(manifestName, {
          encoding: 'utf-8',
        });
        const sv = schemaValidate(manifestString);
        if (!sv.success) {
          throw new Error('Manifest is not valid');
        }
        if (sv.manifest.manifest_version === 3) {
          const zipName = options.outputFileName.replace(
            '{manifestVersion}',
            sv.manifest.version
          );

          for (const fn of getParts(sv.manifest).keys()) {
            const fullName = joinPathFragments(build.options.outputPath, fn);
            if (context.isVerbose) {
              console.log('checking', fullName);
            }
            if (!existsSync(fullName)) {
              throw new Error(`${fn} does not exist`);
            }
          }

          const bodyLines: string[] = [];
          const zip = new AdmZip();
          zip.addLocalFolder(build.options.outputPath);
          zip.writeZip(zipName);

          if (options.tagGit) {
            const tagb = execSync(
              `git tag -a v${sv.manifest.version} -m "${zipName}"`,
              {
                cwd: process.cwd(),
                stdio: [0, 1, 2],
              }
            );
            bodyLines.push(tagb ? tagb.toString() : 'tagged');
          }
          output.success({
            title: `Created ${zipName} successfully`,
            bodyLines,
          });
          success = true;
        }
      }
    }
  }
  return { success };
}
