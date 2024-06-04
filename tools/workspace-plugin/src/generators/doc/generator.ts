import {
  formatFiles,
  getProjects,
  joinPathFragments,
  readJson,
  type GeneratorsJson,
  type Tree,
} from '@nx/devkit';
import { type JSONSchema } from 'json-schema-to-typescript';
import { type PackageJson } from 'nx/src/utils/package-json';
import { Document, h1, h2, h3, table } from '../../markdown';
import { type Schema as DocGeneratorSchema } from './schema';

export async function docGenerator(
  tree: Tree,
  _options: DocGeneratorSchema
): Promise<void> {
  for (const [, b] of getProjects(tree)) {
    const pj = joinPathFragments(b.root, 'package.json');
    if (tree.exists(pj)) {
      const pkg = readJson<PackageJson>(tree, pj);
      const lines = [
        h1(pkg.name),
        '',
        `See \`nx list ${pkg.name}\` for more information.`,
        '',
      ];
      if (pkg.generators) {
        const generatorsf = joinPathFragments(b.root, pkg.generators);
        if (tree.exists(generatorsf)) {
          lines.push(h2('Generators'));
          const jgens = readJson<GeneratorsJson>(tree, generatorsf);

          for (const [gn, generator] of Object.entries(
            jgens.generators ?? {}
          )) {
            const tbody: [string, string, string][] = [];
            const schm = readJson<JSONSchema>(
              tree,
              joinPathFragments(b.root, generator.schema)
            );
            if (schm.properties) {
              for (const [n, prop] of Object.entries(schm.properties)) {
                if (typeof prop.type === 'string') {
                  tbody.push([`${n}`, prop.type, prop.description ?? '']);
                }
              }
              lines.push(
                h3(gn),
                schm.title ?? '',
                '',
                generator.description ?? '',
                '',
                ...table(['Option', 'Type', 'Description'], tbody)
              );
            }
          }
        }
      }
      tree.write(
        joinPathFragments(b.root, 'commands.md'),
        new Document(lines).print().join('\n')
      );
    }
  }
  await formatFiles(tree);
}

export default docGenerator;
