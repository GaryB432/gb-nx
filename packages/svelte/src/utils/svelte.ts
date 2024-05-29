import type { ProjectConfiguration, Tree } from '@nx/devkit';
import { joinPathFragments } from '@nx/devkit';
import { tsquery } from '@phenomnomnominal/tsquery';
import {
  SyntaxKind,
  type Identifier,
  type ObjectLiteralExpression,
  type PropertyAssignment,
  type SourceFile,
  type StringLiteral,
  type SyntaxList,
} from 'typescript';
import { readPackageJson, type NamedPath } from './paths';
import semverSatisfies = require('semver/functions/satisfies');

export const SVELTE_CONFIG = 'svelte.config.js';

interface NodeApplicationSchema {
  directory: string;
  name: string;
  skipFormat?: boolean;
  skipPackageJson?: boolean;
  rootProject?: boolean;
}

interface KitFiles {
  lib: string;
  params: string;
  routes: string;
}

const defaultSvelteFiles: KitFiles = {
  lib: 'src/lib',
  params: 'src/params',
  routes: 'src/routes',
};

const SVELTE_CONFIG_KIT_OBJECT_LITERAL_SELECTOR =
  'PropertyAssignment:has(Identifier[name=kit]) ObjectLiteralExpression';

export function getKitLiteral(
  configContents: string
): ObjectLiteralExpression | undefined {
  const ast: SourceFile = tsquery.ast(configContents);
  const qresults = tsquery<ObjectLiteralExpression>(
    ast,
    SVELTE_CONFIG_KIT_OBJECT_LITERAL_SELECTOR,
    { visitAllChildren: true }
  );

  return qresults[0];
}

export function isSvelte(tree: Tree, root: string): boolean {
  return tree.exists(joinPathFragments(root, SVELTE_CONFIG));
}

function namedPathFromPropertyAssignment(node: PropertyAssignment): NamedPath {
  const identifier = node.name as Identifier;
  const name = identifier.text;

  const initializer = node.initializer as StringLiteral;
  const path = initializer.text;

  return { name, path };
}

function getSvelteFilesFromPropertyAssignment(
  filesAssignment: PropertyAssignment
): Partial<KitFiles> {
  const objectLiteral = filesAssignment.getChildren().find((node) => {
    return node.kind === SyntaxKind.ObjectLiteralExpression;
  }) as ObjectLiteralExpression | undefined;

  if (objectLiteral) {
    const syntaxList = objectLiteral.getChildren().find((node) => {
      return node.kind === SyntaxKind.SyntaxList;
    }) as SyntaxList | undefined;

    if (syntaxList) {
      const nps = syntaxList
        .getChildren()
        .filter((node) => node.kind === SyntaxKind.PropertyAssignment)
        .map<NamedPath>((n) =>
          namedPathFromPropertyAssignment(n as PropertyAssignment)
        );

      return nps.reduce(
        (a, np) => {
          a[np.name] = np.path;
          return a;
        },
        { ...defaultSvelteFiles } as Record<string, string>
      );
    }
  }

  return defaultSvelteFiles;
}

export function getSvelteFiles(configContents: string): KitFiles {
  const kitLiteral = getKitLiteral(configContents);

  if (kitLiteral) {
    const syntaxList = kitLiteral.getChildren().find((node) => {
      return node.kind === SyntaxKind.SyntaxList;
    }) as SyntaxList;

    const filesAssignment = syntaxList
      .getChildren()
      .find(
        (node) =>
          node.kind === SyntaxKind.PropertyAssignment &&
          node.getChildAt(0).getText() === 'files'
      ) as PropertyAssignment;

    if (filesAssignment) {
      return {
        ...defaultSvelteFiles,
        ...getSvelteFilesFromPropertyAssignment(filesAssignment),
      };
    }
  }

  return defaultSvelteFiles;
}

export function getSvelteConfig(
  tree: Tree,
  config: ProjectConfiguration
): string | null {
  const buf = tree.read(joinPathFragments(config.root, SVELTE_CONFIG));
  return buf ? buf.toString() : null;
}

export function getSveltePackageVersions(
  tree: Tree,
  config: ProjectConfiguration
): { name: string; version: string | undefined }[] {
  // const fdf = joinPathFragments(config.root, 'package.json');
  // console.log(fdf);
  const pp = readPackageJson(tree, config);
  // if (!pp) return [];

  // console.log(pp);
  return ['@sveltejs/kit', '@sveltejs/vite-plugin-svelte', 'svelte'].map(
    (name) => {
      const version =
        pp && pp.devDependencies ? pp.devDependencies[name] : undefined;
      return { name, version };
    }
  );
}

export function supportsRunes(
  tree: Tree,
  config: ProjectConfiguration
): { supports: boolean; svelte: string | undefined } {
  let supports = false;
  let svelte: string | undefined;
  const sps = getSveltePackageVersions(tree, config);
  const sveltePkg = sps.find((pkg) => pkg.name === 'svelte');
  // console.log(sveltePkg);
  if (sveltePkg && sveltePkg.version) {
    svelte = sveltePkg.version;
    supports = semverSatisfies(svelte, '>=5', {
      includePrerelease: true,
    });
  }
  return { supports, svelte };
}

export function createSvelteKitApp(
  appTree: Tree,
  version: string,
  options: NodeApplicationSchema
): void {
  const config0 = 'const config = { kit: {} };';

  const config = `/** @type {import('@sveltejs/kit').Config} */
  const config = {
    kit: {
      alias: {
        // this will match a file
        'my-file': 'path/to/my-file.js',
   
        // this will match a directory and its contents
        // (my-directory/x resolves to path/to/my-directory/x)
        'my-directory': 'path/to/my-directory',
   
        // an alias ending /* will only match
        // the contents of a directory, not the directory itself
        'my-directory/*': 'path/to/my-directory/*'
      },
      other: {
        'testing': 'yes'
      }
    }
  };`;
  const projectRoot = joinPathFragments(options.directory ?? '.', options.name);

  appTree.write(joinPathFragments(projectRoot, 'svelte.config.js'), config);
  const pacage = {
    name: options.name,
    version: '0.0.0',
    devDependencies: {
      '@sveltejs/adapter-auto': '^3.0.0',
      '@sveltejs/kit': '^2.0.0',
      '@sveltejs/vite-plugin-svelte': '^3.0.0',
      svelte: version,
    },
  };

  appTree.write(
    joinPathFragments(projectRoot, 'package.json'),
    JSON.stringify(pacage)
  );

  return;

  appTree.write(
    joinPathFragments(projectRoot, 'node_modules/@sveltejs/kit/package.json'),
    JSON.stringify({
      name: '@sveltejs/kit',
      version,
    })
  );
  appTree.write(
    joinPathFragments(
      projectRoot,
      'node_modules/@sveltejs/vite-plugin-svelte/package.json'
    ),
    JSON.stringify({
      name: '@sveltejs/vite-plugin-svelte',
      version,
    })
  );
  appTree.write(
    joinPathFragments(projectRoot, 'node_modules/svelte/package.json'),
    JSON.stringify({
      name: 'svelte',
      version,
    })
  );
}
