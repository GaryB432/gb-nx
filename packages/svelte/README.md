# @gb-nx/svelte

This library was generated with [Nx](https://nx.dev).

[![CI](https://img.shields.io/github/actions/workflow/status/GaryB432/gb-nx/main.yml?branch=master)](https://github.com/GaryB432/gb-nx/actions)
[![npm version](https://img.shields.io/npm/v/@gb-nx/svelte?style=flat-square)](https://www.npmjs.com/package/@gb-nx/svelte)

See the [NX Discussion of first class support for Sveltekit](https://github.com/sveltejs/svelte/discussions/10425). You may not need this plugin.

> Nx Plugin for managing svelte-kit applications in your Nx workspace

## Features

Here is a list of some of the coolest features of the plugin:

- ✅ You work with the routes and components and the plugin manages boilerplate
- ✅ Building, testing, linting your projects

## Prerequisite

If you have not already, [create an Nx workspace](https://nx.dev/getting-started/intro) with the following:

```
# npm
npx create-nx-workspace@latest

# yarn
yarn create nx-workspace@latest
```

## Getting Started

Then you need to install the plugin in order to work with svelte applications later on.

### Installing Plugin

```
nx add @gb-nx/svelte
```

### Generating Project

The plugin will create an Nx project for an existing svelte-kit application. Do so with commands similar to the following

```shell
npx create-nx-workspace@latest sample-workspace --preset apps
cd sample-workspace/apps
npm create svelte@latest web
cd web
npm install
cd ..\..
nx g @gb-nx/svelte:application web
nx build web
nx lint web
nx test web
```

### Add a route

```
nx g @gb-nx/svelte:route admin/[area] --project web
```

| Option     | Type    | Description                                     |
| ---------- | ------- | ----------------------------------------------- |
| name       | string  | The name of the route.                          |
| project    | string  | The Svelte project to target.                   |
| directory  | string  | Directory where the generated files are placed. |
| skipFormat | boolean | Skip formatting files.                          |
| skipTests  | boolean | Do not create 'spec' test file for the route.   |
| language   | string  | Route script language (ts/js).                  |
| style      | string  | Route style language (css/scss).                |
| load       | string  | Source of data for your load function           |
| runes      | boolean | Use svelte runes (requires svelte >=5)          |

### Add a component

```
nx g @gb-nx/svelte:component SocialMedia --project web
```

| Option     | Type    | Description                                                                          |
| ---------- | ------- | ------------------------------------------------------------------------------------ |
| name       | string  | The name of the component.                                                           |
| project    | string  | The Svelte project to target.                                                        |
| directory  | string  | Directory where the component is placed, relative to your Svelte project lib folder. |
| skipFormat | boolean | Skip formatting files.                                                               |
| language   | string  | Component script language (ts/js).                                                   |
| style      | string  | Component style language (css/scss).                                                 |
| runes      | boolean | Use svelte runes (requires svelte >=5)                                               |

### Add a lib dependency

The generator will

- add an alias to your `svelte.config.js` for importing a workspace library in your SvelteKit application
- add an implicit dependency to the SvelteKit project

```
nx g @gb-nx/svelte:dependency --project web --dependency my-lib
```

| Option     | Type    | Description                                                                    |
| ---------- | ------- | ------------------------------------------------------------------------------ |
| project    | string  | The project to add the dependency src to                                       |
| dependency | string  | The dependent project to add                                                   |
| scope      | string  | The scope to prepend to the dependency name for the alias name (without the @) |
| skipFormat | boolean | Skip formatting files.                                                         |

## Migrations

This plugin supports Nx migrations and provides necessary version and code updates. So instead of bumping plugin version manually in package.json it's recommended to run `nx migrate @gb-nx/svelte` command, that includes bumping the version of the @gb-nx/svelte plugin, related dependencies and running code migrations.

## @gb-nx/svelte & Nx Compatibility Chart

| @gb-nx/svelte version | Nx version |
| --------------------- | ---------- |
| ^8.0.0                | >=17.0.0   |
| ^6.0.0                | ^17.0.0    |
| ^5.0.0                | ^16.0.0    |
| <5.0.0                | ^15.0.0    |

## License

MIT
