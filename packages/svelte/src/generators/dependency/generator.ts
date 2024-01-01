import {
  formatFiles,
  getProjects,
  joinPathFragments,
  readNxJson,
  updateJson,
  type ProjectConfiguration,
  type Tree,
} from '@nx/devkit';
import { type PackageJson } from 'nx/src/utils/package-json';
import {
  dependencySourceRoot,
  makeAliasName,
  type NamedPath,
} from '../../utils/paths';
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
  const ws = readNxJson(tree);
  const projName = schema.project ?? ws?.defaultProject;
  const aliasScope = schema.scope;

  const projects = getProjects(tree);
  const project = projects.get(projName);

  if (!project) {
    throw new Error(notfound(projName));
  }

  const dep = projects.get(schema.dependency);
  if (!dep) {
    throw new Error(notfound(schema.dependency));
  }

  if (project.projectType !== 'application' || dep.projectType !== 'library') {
    throw new Error(
      'dependency may only be from application to library projectType'
    );
  }

  const config = getSvelteConfig(tree, project);

  if (!config) {
    throw new Error(notSvelte(projName));
  }

  const aliases = getConfiguredAliases(config).slice(0);
  const depName = makeAliasName(schema.dependency, aliasScope);

  const aliasToAdd = {
    name: depName,
    path: dependencySourceRoot(project, dep),
  };
  aliases.push(aliasToAdd);

  // output.log({
  //   title: 'Configured Aliases',
  //   bodyLines: aliases.map(
  //     (p) =>
  //       `${output.colors.white(p.name)}: "${output.colors.green(p.path)}"`
  //   ),
  // });

  updateSvelteConfig(tree, project, aliasToAdd);

  updateJson<PackageJson, PackageJson>(
    tree,
    joinPathFragments(project.root, 'package.json'),
    (json) => {
      json.nx = json.nx ?? {};
      const ideps = json.nx.implicitDependencies ?? [];
      if (!ideps.includes(schema.dependency)) {
        json.nx.implicitDependencies = [...ideps, schema.dependency];
      }
      return json;
    }
  );
  if (!schema.skipFormat) {
    await formatFiles(tree);
  }
}
