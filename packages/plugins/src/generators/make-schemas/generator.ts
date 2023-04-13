import { formatFiles, getProjects, output, type Tree } from '@nrwl/devkit';
import { compile, type JSONSchema } from 'json-schema-to-typescript';
import { join, parse, type ParsedPath } from 'path';

interface SchemaDefined {
  schema: string;
}

interface PackageConfig {
  executors?: string;
  generators?: string;
}

interface SchemaDefinedList {
  executors: Record<string, SchemaDefined>;
  generators: Record<string, SchemaDefined>;
}

const messages: string[] = [];

async function writeSchemaTypeDef(
  tree: Tree,
  root: string,
  sdef: SchemaDefined,
  path: ParsedPath
): Promise<void> {
  const schemaContent = tree.read(join(root, sdef.schema));
  if (!schemaContent) {
    throw new Error('no schema content');
  }
  try {
    const schemaObj = JSON.parse(schemaContent.toString()) as JSONSchema;
    schemaObj.title = 'Schema';
    const dts = await compile(schemaObj, 'schema', {
      bannerComment: '/* eslint-disable */',
      strictIndexSignatures: true,
      style: { singleQuote: true },
    });
    const message = output.colors.cyan(join(root, path.dir, 'schema.d.ts'));
    messages.push(message);
    tree.write(join(root, path.dir, 'schema.d.ts'), dts);
  } catch (e) {
    messages.push(output.colors.red(`Error in "${path.dir}"`));
  }
}

async function handleSchemaDefList(
  tree: Tree,
  root: string,
  defListPath: string | undefined,
  k: keyof SchemaDefinedList
): Promise<void> {
  if (!defListPath) return;
  const buf = tree.read(join(root, defListPath));
  if (!buf) {
    throw new Error('no deflistpath');
  }
  const sds = JSON.parse(buf.toString()) as SchemaDefinedList;
  for (const sdef of Object.values(sds[k])) {
    await writeSchemaTypeDef(tree, root, sdef, parse(sdef.schema));
  }
}

export default async function (tree: Tree, _options: unknown): Promise<void> {
  const projects = getProjects(tree);
  for (const projName of projects.keys()) {
    void messages.splice(0, messages.length);
    const proj = projects.get(projName);
    if (!proj) {
      throw new Error('no proj hmmm');
    }
    const pjn = join(proj.root, 'package.json');
    const buf = tree.read(pjn);
    if (buf) {
      const pj = JSON.parse(buf.toString()) as PackageConfig;
      const { root } = proj;
      await handleSchemaDefList(tree, root, pj.executors, 'executors');
      await handleSchemaDefList(tree, root, pj.generators, 'generators');
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

  await formatFiles(tree);
}
