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
import { type Schema as ZipExecutorSchema } from './schema';
import AdmZip = require('adm-zip');

export default async function runExecutor(
  options: ZipExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  let success = false;
  if (context.workspace && context.projectName) {
    const { targets } = context.workspace.projects[context.projectName];
    if (targets) {
      const buildTarget: TargetConfiguration<WebpackExecutorOptions> =
        targets['build'];
      if (
        buildTarget &&
        buildTarget.executor === '@nx/webpack:webpack' &&
        buildTarget.options
      ) {
        options.outputFileName ??= `zip/${context.projectName}-{manifest-version}.zip`;
        const manifestPath = joinPathFragments(
          buildTarget.options.outputPath,
          'manifest.json'
        );
        const sv = schemaValidate(
          readFileSync(manifestPath, {
            encoding: 'utf-8',
          })
        );
        if (!sv.success) {
          throw new Error('Manifest is not valid');
        }
        if (sv.manifest.manifest_version === 3) {
          const zipName = options.outputFileName.replace(
            '{manifestVersion}',
            sv.manifest.version
          );

          if (existsSync(zipName)) {
            throw new Error(`${zipName} already exists.`);
          }

          for (const filePart of getParts(sv.manifest).keys()) {
            const fullName = joinPathFragments(
              buildTarget.options.outputPath,
              filePart
            );
            if (context.isVerbose) {
              console.log('checking', fullName);
            }
            if (!existsSync(fullName)) {
              throw new Error(`${filePart} does not exist.`);
            }
          }

          const bodyLines: string[] = [];
          const zip = new AdmZip();

          zip.addLocalFolder(buildTarget.options.outputPath);
          zip.writeZip(zipName, (e) => {
            if (e) {
              console.log(e.message);
              success = false;
            }
          });

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
