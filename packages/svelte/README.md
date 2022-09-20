# @gb-nx/svelte

This library was generated with [Nx](https://nx.dev).

[![CI](https://img.shields.io/github/workflow/status/GaryB432/gb-nx/CI)](https://github.com/GaryB432/gb-nx/actions)
[![npm version](https://img.shields.io/npm/v/@gb-nx/svelte?style=flat-square)](https://www.npmjs.com/package/@gb-nx/svelte)

> Nx Plugin for managing svelte-kit applications in your Nx workspace

## Features

Here is a list of some of the coolest features of the plugin:

- ✅ You work with the routes and components and the plugin manages boilerplate
- ✅ Building, testing, linting your projects

## Prerequisite

If you have not already, [create an Nx workspace](https://github.com/nrwl/nx#creating-an-nx-workspace) with the following:

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
# npm
npm install @gb-nx/svelte --save-dev

# yarn
yarn add @gb-nx/svelte --dev
```

### Generating Project

The plugin will create an Nx project for an existing svelte-kit application. Do so with commands similar to the following

```shell
npx create-nx-workspace@latest sample-workspace
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

### Add a component

```
nx g @gb-nx/svelte:component SocialMedia --project web
```

### Add a lib dependency

The generator will

- add an alias to your `svelte.config.js` for importing a workspace library in your SvelteKit application
- add an implicit dependency to the SvelteKit project

```
nx g @gb-nx/svelte:dependency --project web --dependency my-lib
```

| OPTION         | DESCRIPTION                                                    |
| -------------- | -------------------------------------------------------------- |
| `--project`    | The name of the depending project, your SvelteKit application  |
| `--dependency` | The name of the project to depend on                           |
| `--scope`      | A scope to prepend to the dependency's name for the alias name |

## License

Copyright (c) 2021-2022 Gary Bortosky. Licensed under the MIT License (MIT)
