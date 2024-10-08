import {
  formatFiles,
  getProjects,
  joinPathFragments,
  names,
  readNxJson,
  updateNxJson,
  type ProjectConfiguration,
  type Tree,
} from '@nx/devkit';
import {
  getSvelteConfig,
  getSvelteFiles,
  supportsRunes,
} from '../../utils/svelte';
import type { Schema } from './schema';

interface NormalizedSchema extends Schema {
  project: string;
  routePath: string;
}

function getRouteParam(typedParam: string): [string, string] {
  const r = typedParam.split('=', 2);
  return [r[0], r[1]];
}

function normalizeOptions(host: Tree, options: Schema): NormalizedSchema {
  const ws = readNxJson(host);
  options.project = options.project ?? ws?.defaultProject;
  options.directory = options.directory ?? '';

  if (!options.project) {
    throw new Error('Project or defaultProject required');
  }

  return {
    ...options,
    project: options.project,
    routePath: joinPathFragments(options.directory ?? '', options.name),
  };
}

interface Segment {
  isParam: boolean;
  paramType: string | undefined;
  path: string;
}

export function getSegments(
  options: Pick<NormalizedSchema, 'routePath'>
): Segment[] {
  return options.routePath.split('/').map<Segment>((part) => {
    const isParam = part.startsWith('[');
    const [path, paramType] = getRouteParam(
      isParam ? part.slice(1, part.length - 1) : part
    );

    return { isParam, path, paramType };
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
      
      export const load = (async ({ params }) => {
        return {
          subject: await demo(params)
        };
      }) satisfies PageServerLoad;
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
    case 'universal': {
      const fname = joinPathFragments(
        proj.root,
        locations.routes,
        options.routePath,
        options.language === 'ts' ? '+page.ts' : '+page.js'
      );

      const ts = `import type { PageLoad, RouteParams } from './$types';
      export const load = (async ({ params }) => {
        ${paramDeclaration}
        return {
          subject: \`${answer}\`
        };
      }) satisfies PageLoad;`;
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
  options: NormalizedSchema
): void {
  const fname = joinPathFragments(
    proj.root,
    locations.routes,
    options.routePath,
    '+page.svelte'
  );

  const scriptsRecord: Record<
    string,
    { none: string; server: string; universal: string }
  > = {
    js: {
      none: `<script>
        ${
          options.runes
            ? `let data = $state({ subject: '${options.name}' })`
            : `let data = { subject: '${options.name}' }`
        };
      </script>`,
      server: `<script>
        /** @type {import('./$types').PageData} */
        ${options.runes ? 'let { data } = $props()' : 'export let data'};
      </script>`,
      universal: `<script>
        /** @type {import('./$types').PageData} */
        ${options.runes ? 'let { data } = $props()' : 'export let data'};
        </script>`,
    },
    ts: {
      none: `<script lang="ts">
        ${
          options.runes
            ? `let data = $state({ subject: '${options.name}' })`
            : `export let data = { subject: '${options.name}' }`
        };
        </script>`,
      server: `<script lang="ts">
        import type { PageData } from './$types';
        ${
          options.runes
            ? 'let { data }: { data: PageData } = $props()'
            : 'export let data: PageData'
        };
      </script>`,
      universal: `<script lang="ts">
        import type { PageData } from './$types';
        ${
          options.runes
            ? 'let { data }: { data: PageData } = $props()'
            : 'export let data: PageData'
        };
      </script>`,
    },
  };

  const script =
    scriptsRecord[options.language ?? 'js'][options.load ?? 'none'];

  const html = `<svelte:head>
  <title>${options.project} - ${options.name}</title>
</svelte:head>

<article class="container">
	{data.subject} works
</article>
`;

  // TODO add sass devdep in project if selected
  const styles = `<style${options.style === 'scss' ? ' lang="scss"' : ''}>
  .container {
    padding: 1em;
    border: thin solid silver;
  }
  @media screen and (min-width: 576px) { /* landscape phones */ }
  @media screen and (min-width: 768px) { /* tablets */ }
  @media screen and (min-width: 992px) { /* desktops */ }
  @media screen and (min-width: 1200px) { /* large desktops */ }
  @media screen and (min-width: 1400px) { /* larger desktops */ }
</style>`;

  tree.write(fname, [script, html, styles].join('\n\n'));
}
function addPlaywrightPage(
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
    await page.textContent('article.container')
  ).toContain('works');
});
`;
  tree.write(fname, content);
}
function addGeneratorDefaults(tree: Tree, options: NormalizedSchema): void {
  const nxJson = readNxJson(tree);

  if (!nxJson) {
    return;
  }

  const { directory, language, style } = options;
  nxJson.generators = nxJson.generators ?? {};
  nxJson.generators['@gb-nx/svelte:route'] = {
    directory,
    language,
    style,
    ...(nxJson.generators['@gb-nx/svelte:route'] || {}),
  };

  updateNxJson(tree, nxJson);
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

  const { supports, svelte } = supportsRunes(tree, proj);
  // const runesOk = supportsRunes(tree, proj);
  if (schema.runes === void 0) {
    options.runes = supports;
  }

  if (options.runes && !supports) {
    throw new Error(
      `runes feature requires svelte >= 5 (currently '${svelte}')`
    );
  }

  const configContent = getSvelteConfig(tree, proj);

  if (!configContent) {
    throw new Error(notSvelte(options.project));
  }

  const locations = getSvelteFiles(configContent);

  addLoadPage(tree, proj, locations, options);

  addSveltePage(tree, proj, locations, options);

  addGeneratorDefaults(tree, options);

  if (!options.skipTests) {
    addPlaywrightPage(tree, proj, { tests: 'tests' }, options);
  }
  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

export default routeGenerator;
