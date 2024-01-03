import {
  joinPathFragments,
  type ExecutorContext,
  type TargetConfiguration,
  output,
} from '@nx/devkit';
import { type WebpackExecutorOptions } from '@nx/webpack';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { type ZipExecutorSchema } from './schema';
import AdmZip = require('adm-zip');

interface Manifest {
  manifest_version: number;
  name: string;
  version: string;
}

export default async function runExecutor(
  options: ZipExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  // console.log('Executor ran for Zip', options);
  // console.log(Object.keys(context));
  // console.log(context.isVerbose);
  let success = false;
  if (context.workspace && context.projectName) {
    const { targets } = context.workspace.projects[context.projectName];
    // console.log(JSON.stringify(targets, null, 2));
    if (targets) {
      const build: TargetConfiguration<WebpackExecutorOptions> =
        targets['build'];
      if (build && build.executor === '@nx/webpack:webpack' && build.options) {
        options.outputFileName ??= '';
        console.log(options.outputFileName);
        const manifestName = joinPathFragments(
          // context.workspace.
          build.options.outputPath,
          'manifest.json'
        );
        // console.log(
        //   joinPathFragments(root, build.options.outputPath, 'manifest.json')
        // );
        const manifestString = readFileSync(manifestName, {
          encoding: 'utf-8',
        });
        const manifest: Manifest = JSON.parse(manifestString);
        if (manifest.manifest_version === 3) {
          const zipName = options.outputFileName.replace(
            '{manifestVersion}',
            manifest.version
          );
          console.log(zipName);
          const zip = new AdmZip();
          zip.addLocalFolder(build.options.outputPath);
          zip.writeZip(zipName);
          const tagb = execSync(
            `git tag -a v${manifest.version} -m "${zipName}"`,
            {
              cwd: process.cwd(),
              stdio: [0, 1, 2],
            }
          );
          output.success({
            title: `Created ${zipName} successfully`,
            bodyLines: [tagb ? tagb.toString() : 'tagged'],
          });
          success = true;
        }
      }
    }
  }
  return { success };
}
