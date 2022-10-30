import {
  formatFiles,
  getProjects,
  joinPathFragments,
  names,
  readWorkspaceConfiguration,
  type ProjectConfiguration,
  type Tree,
} from '@nrwl/devkit';
import { getSvelteConfig, getSvelteFiles } from '../../utils/svelte';
import type { Schema } from './schema';

interface NormalizedSchema extends Schema {
  routePath: string;
}

function normalizeOptions(
  host: Tree,
  options: Schema
): Required<NormalizedSchema> {
  const ws = readWorkspaceConfiguration(host);
  options.project = options.project ?? ws.defaultProject;
  options.directory = options.directory ?? '';

  if (!options.project) {
    throw new Error('Project or defaultProject required');
  }

  const defaultOptions: Required<NormalizedSchema> = {
    directory: options.directory,
    language: 'js',
    load: 'none',
    name: options.name,
    project: options.project,
    skipFormat: false,
    skipTests: false,
    style: 'css',
    routePath: options.name,
  };
  return {
    ...defaultOptions,

    ...options,
    routePath: joinPathFragments(options.directory ?? '', options.name),
  };
}

interface Segment {
  isParam: boolean;
  path: string;
}

export function getSegments(
  options: Pick<NormalizedSchema, 'routePath'>
): Segment[] {
  return options.routePath.split('/').map<Segment>((part) => {
    const isParam = part.startsWith('[');
    const path = isParam ? part.slice(1, part.length - 1) : part;
    return { isParam, path };
  });
}

function addLoadPage(
  tree: Tree,
  proj: ProjectConfiguration,
  locations: { routes: string },
  options: NormalizedSchema
): void {
  const segments = getSegments(options);
  const routeParams = segments.filter((s) => s.isParam).map((p) => p.path);
  const paramDeclaration =
    routeParams.length > 0
      ? `const { ${routeParams.join(', ')} } = params;`
      : '';

  const answer = segments
    .map((s) => (s.isParam ? `\${${s.path}}` : s.path))
    .join('/');

  switch (options.load) {
    case 'server': {
      const fname = joinPathFragments(
        proj.root,
        locations.routes,
        options.routePath,
        options.language === 'ts' ? '+page.server.ts' : '+page.server.js'
      );

      const ts = `import type { PageServerLoad, RouteParams } from './$types';
      async function demo(params: RouteParams): Promise<string> {
        ${paramDeclaration}
        return Promise.resolve(\`${answer}\`);
      }
      
      export const load: PageServerLoad = async({ params }) => {
        return {
          subject: await demo(params)
        };
      }
      `;

      const js = `async function demo(params) {
        ${paramDeclaration}
        return Promise.resolve('${options.name}');
      }
      /** @type {import('./$types').PageServerLoad} */
      export async function load({ params }) {
        return {
          subject: await demo(params)
        };
      }
      `;
      tree.write(fname, options.language === 'ts' ? ts : js);
      break;
    }
    case 'shared': {
      const fname = joinPathFragments(
        proj.root,
        locations.routes,
        options.routePath,
        options.language === 'ts' ? '+page.ts' : '+page.js'
      );

      const ts = `import type { PageLoad, RouteParams } from './$types';
      export const load: PageLoad = async({ params }) => {
        ${paramDeclaration}
        return {
          subject: \`${answer}\`
        };
      }`;
      const js = `/** @type {import('./$types').PageLoad} */
      export function load({ params }) {
        ${paramDeclaration}
        return {
          subject: \`${answer}\`
        };
      }`;

      tree.write(fname, options.language === 'ts' ? ts : js);
      break;
    }
  }
}

function addSveltePage(
  tree: Tree,
  proj: ProjectConfiguration,
  locations: { routes: string },
  options: Required<NormalizedSchema>
): void {
  const fname = joinPathFragments(
    proj.root,
    locations.routes,
    options.routePath,
    '+page.svelte'
  );

  const scripts: Record<
    string,
    { none: string; server: string; shared: string }
  > = {
    js: {
      none: `<script>
        let data = { subject: '${options.name}' };
      </script>`,
      server: `<script>
        /** @type {import('./$types').PageData} */
        export let data;
      </script>`,
      shared: `<script>
        /** @type {import('./$types').PageData} */
        export let data;
      </script>`,
    },
    ts: {
      none: `<script lang="ts">
        let data = { subject: '${options.name}' };
      </script>`,
      server: `<script lang="ts">
        import type { PageData } from './$types';
        export let data: PageData;
      </script>`,
      shared: `<script lang="ts">
        import type { PageData } from './$types';
        export let data: PageData;
      </script>`,
    },
  };

  const script = scripts[options.language][options.load];

  const html = `<article class="a">
	{data.subject} works
</article>
`;

  const styles = `<style${options.style === 'scss' ? ' lang="scss"' : ''}>
  article.a {
    padding: 1em;
    border: thin solid silver;
  }
</style>`;

  tree.write(fname, [script, html, styles].join('\n\n'));
}
function addTestPage(
  tree: Tree,
  proj: ProjectConfiguration,
  locations: { tests: string },
  options: NormalizedSchema
): void {
  const fname = joinPathFragments(
    proj.root,
    locations.tests,
    options.directory ?? '',
    `${names(options.name).fileName}.spec.ts`
  );
  // const routePath = joinPathFragments(options.directory ?? '', options.name);

  const routePath = getSegments(options)
    .map((f) => (f.isParam ? `_${f.path}_` : f.path))
    .join('/');

  const content = `import { expect, test } from '@playwright/test';

test('has generated article', async ({ page }) => {
  await page.goto('/${routePath}');
  expect(
    await page.textContent('article.a')
  ).toContain('works');
});
`;
  tree.write(fname, content);
}

export async function routeGenerator(
  tree: Tree,
  schema: Schema
): Promise<void> {
  const notfound = (p: string) => `project '${p}' was not found in workspace`;
  const notSvelte = (p: string) =>
    `project '${p}' is not configured for svelte`;

  const options = normalizeOptions(tree, schema);

  const projects = getProjects(tree);
  const proj = projects.get(options.project);
  if (!proj) {
    throw new Error(notfound(options.project));
  }

  const configContent = getSvelteConfig(tree, proj);

  if (!configContent) {
    throw new Error(notSvelte(options.project));
  }

  const locations = getSvelteFiles(configContent);

  addLoadPage(tree, proj, locations, options);

  addSveltePage(tree, proj, locations, options);

  if (!options.skipTests) {
    addTestPage(tree, proj, { tests: 'tests' }, options);
  }
  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

export default routeGenerator;
