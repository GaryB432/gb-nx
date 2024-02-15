# @gb-nx/svelte

This library was generated with [Nx](https://nx.dev).

[![CI](https://img.shields.io/github/actions/workflow/status/GaryB432/gb-nx/main.yml?branch=master)](https://github.com/GaryB432/gb-nx/actions)
[![npm version](https://img.shields.io/npm/v/@gb-nx/svelte?style=flat-square)](https://www.npmjs.com/package/@gb-nx/svelte)

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
# npm
npm install @gb-nx/svelte --save-dev

# yarn
yarn add @gb-nx/svelte --dev
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
