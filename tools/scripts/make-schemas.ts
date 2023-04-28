import { output, Workspaces } from '@nx/devkit';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { compile, JSONSchema } from 'json-schema-to-typescript';
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

async function writeSchemaTypeDef(
  root: string,
  sdef: SchemaDefined,
  path: ParsedPath
): Promise<void> {
  const schemaContent = await readFile(join(root, sdef.schema));
  try {
    const schemaObj = JSON.parse(schemaContent.toString()) as JSONSchema;
    schemaObj.title = 'Schema';
    const dts = await compile(schemaObj, 'schema', {
      bannerComment: '/* eslint-disable */',
      strictIndexSignatures: true,
      style: { singleQuote: true },
    });
    if (argv.includes('-d')) {
      const message =
        output.colors.cyan(join(root, path.dir, 'schema.d.ts')) +
        output.colors.gray(' DRY RUN');
      messages.push(message);
    } else {
      const message = output.colors.cyan(join(root, path.dir, 'schema.d.ts'));
      messages.push(message);
      void writeFile(join(root, path.dir, 'schema.d.ts'), dts);
    }
  } catch (e) {
    messages.push(output.colors.red(`Error in "${path.dir}"`));
  }
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
    const pjn = join(proj.root, 'package.json');
    if (existsSync(pjn)) {
      const pj = JSON.parse((await readFile(pjn)).toString()) as PackageConfig;
      const { root } = proj;
      await handleSchemaDefList(root, pj.executors, 'executors');
      await handleSchemaDefList(root, pj.generators, 'generators');
      output.log({
        title: `Schema definitions generated for project '${projName}'`,
        bodyLines: messages,
      });
    } else {
      output.log({
        title: `No package for project '${projName}'`,
        color: 'yellow',
      });
    }
  }
}

// main();
output.log({
  title: `Deprecated`,
  bodyLines: ['use nx generator make-schemas'],
});
