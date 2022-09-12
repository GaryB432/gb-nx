# @gb-nx/workspace

This library was generated with [Nx](https://nx.dev).

[![CI](https://img.shields.io/github/workflow/status/GaryB432/gb-nx/CI)](https://github.com/GaryB432/gb-nx/actions)
[![npm version](https://img.shields.io/npm/v/@gb-nx/svelte?style=flat-square)](https://www.npmjs.com/package/@gb-nx/svelte)

> Nx Plugin for workspace utilities in your Nx workspace

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

```json
// apps/svelte-app/tsconfig.json
...
	"paths": {
			"$lib": ["src/lib"],
			"$lib/*": ["src/lib/*"],
      "@example/vector": ["../../libs/vector/src/index.ts"]
		}
```

```javascript
// apps/svelte-app/vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "src/variables.scss" as *;',
      },
    },
  },
  resolve: {
    alias: {
      '@example/vector': path.resolve('../../libs/vector/src/index.ts'),
    },
  },
};

export default config;
```

## License

Copyright (c) 2021-2022 Gary Bortosky. Licensed under the MIT License (MIT)
