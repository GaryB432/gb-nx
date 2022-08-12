import { output } from '@nrwl/devkit';
import { readFile, writeFile } from 'fs/promises';
import { compileFromFile } from 'json-schema-to-typescript';
import { Workspaces } from 'nx/src/config/workspaces';
import { join, parse, ParsedPath } from 'path';

interface SchemaDefined {
  schema: string;
}

interface PackageConfig {
  generators?: string;
  executors?: string;
}

interface SchemaDefinedList {
  executors: Record<string, SchemaDefined>;
  generators: Record<string, SchemaDefined>;
}

const argv = process.argv.slice(2);
const ws = new Workspaces(process.cwd());
const wsConfig = ws.readWorkspaceConfiguration();

const messages: string[] = [];

function getDefFileName(path: ParsedPath, color = false): string {
  if (!color) {
    return [path.name, ...argv, 'd', 'ts'].join('.');
  }
  const plusArgs = ['', ...argv];
  const parts = [
    output.colors.cyan(join(path.dir, path.name)),
    output.colors.red(plusArgs.map((v) => `${v}`).join('.')),
    output.colors.cyan('.d.ts'),
  ];
  return parts.join('');
}

async function writeSchemaTypeDef(
  root: string,
  sdef: SchemaDefined,
  path: ParsedPath
): Promise<void> {
  const dts = await compileFromFile(join(root, sdef.schema), {
    bannerComment: `/* eslint-disable */
    /* from ${sdef.schema} */`,
    strictIndexSignatures: true,
  });
  messages.push(getDefFileName(path, true));
  void writeFile(join(root, path.dir, getDefFileName(path)), dts);
}

async function handleSchemaDefList(
  root: string,
  defListPath: string | undefined,
  k: keyof SchemaDefinedList
): Promise<void> {
  if (!defListPath) return;
  const buf = await readFile(join(root, defListPath));
  const sds = JSON.parse(buf.toString()) as SchemaDefinedList;
  for (const sdef of Object.values(sds[k])) {
    await writeSchemaTypeDef(root, sdef, parse(sdef.schema));
  }
}

async function main() {
  for (const projName in wsConfig.projects) {
    void messages.splice(0, messages.length);
    const proj = wsConfig.projects[projName];
    const pjb = await readFile(join(proj.root, 'package.json'));
    const pj = JSON.parse(pjb.toString()) as PackageConfig;
    const { root } = proj;
    await handleSchemaDefList(root, pj.executors, 'executors');
    await handleSchemaDefList(root, pj.generators, 'generators');
    output.log({
      title: `Schema definitions generated for project '${projName}'`,
      bodyLines: messages,
    });
  }
}

main();
