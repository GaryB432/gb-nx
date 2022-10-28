import type { ProjectConfiguration, Tree } from '@nrwl/devkit';
import {
  formatFiles,
  getProjects,
  joinPathFragments,
  offsetFromRoot,
  // output,
  readWorkspaceConfiguration,
} from '@nrwl/devkit';

import { makeAliasName, type NamedPath } from '../../utils/paths';
import { getSvelteConfig } from '../../utils/svelte';
import { addToSvelteConfiguration, getConfiguredAliases } from './alias';
import type { Schema as DependencyGeneratorSchema } from './schema';

function updateSvelteConfig(
  tree: Tree,
  project: ProjectConfiguration,
  alias: NamedPath
): void {
  const fname = joinPathFragments(project.root, 'svelte.config.js');
  const config = tree.read(fname);
  if (!config) {
    return;
  }
  tree.write(fname, addToSvelteConfiguration(config.toString(), alias));
}

export default async function (
  tree: Tree,
  schema: DependencyGeneratorSchema
): Promise<void> {
  const notfound = (p: string) => `project '${p}' was not found in workspace`;
  const notSvelte = (p: string) =>
    `project '${p}' is not configured for svelte`;
  const ws = readWorkspaceConfiguration(tree);
  const projName = schema.project ?? ws.defaultProject;
  const aliasScope = schema.scope ?? ws.npmScope;

  const projects = getProjects(tree);
  const project = projects.get(projName);

  if (!project) {
    throw new Error(notfound(projName));
  }

  const dep = projects.get(schema.dependency);
  if (!dep) {
    throw new Error(notfound(schema.dependency));
  }

  const psrc = project.sourceRoot;
  const dsrc = dep.sourceRoot;

  const config = getSvelteConfig(tree, project);

  if (!config) {
    throw new Error(notSvelte(projName));
  }

  const aliases = getConfiguredAliases(config).slice(0);
  const depName = makeAliasName(schema.dependency, aliasScope);

  if (dsrc && psrc) {
    const path = joinPathFragments(offsetFromRoot(dep.root), dsrc);

    const aliasToAdd = { name: depName, path };
    aliases.push(aliasToAdd);

    // output.log({
    //   title: 'Configured Aliases',
    //   bodyLines: aliases.map(
    //     (p) =>
    //       `${output.colors.white(p.name)}: "${output.colors.green(p.path)}"`
    //   ),
    // });

    updateSvelteConfig(tree, project, aliasToAdd);
  }

  const pjbuff = tree.read(joinPathFragments(project.root, 'package.json'));
  if (pjbuff) {
    const pkg = JSON.parse(pjbuff.toString()) as {
      name: string;
      nx: { implicitDependencies: string[] };
    };
    const ideps = pkg.nx.implicitDependencies ?? [];
    if (!ideps.includes(schema.dependency)) {
      pkg.nx.implicitDependencies = [...ideps, schema.dependency];
      tree.write(
        joinPathFragments(project.root, 'package.json'),
        JSON.stringify(pkg, undefined, 2).concat('\n')
      );
    }
  }
  await formatFiles(tree);
}
