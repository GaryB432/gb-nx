import { readFile, writeFile } from 'fs/promises';
import { compileFromFile } from 'json-schema-to-typescript';
import { join, parse, ParsedPath, posix } from 'path';
import { Workspaces } from '@nrwl/tao/src/shared/workspace';

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
  void writeFile(
    join(root, path.dir, [path.name, ...argv, 'd', 'ts'].join('.')),
    dts
  );
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
    console.log(root, sdef.schema);
    await writeSchemaTypeDef(root, sdef, parse(sdef.schema));
  }
}

async function main() {
  for (const projName in wsConfig.projects) {
    const proj = wsConfig.projects[projName];
    const pjb = await readFile(join(proj.root, 'package.json'));
    const pj = JSON.parse(pjb.toString()) as PackageConfig;
    const { root } = proj;
    await handleSchemaDefList(root, pj.executors, 'executors');
    await handleSchemaDefList(root, pj.generators, 'generators');
  }
}

main();
