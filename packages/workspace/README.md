# @gb-nx/workspace

This library was generated with [Nx](https://nx.dev).

[![CI](https://img.shields.io/github/actions/workflow/status/GaryB432/gb-nx/main.yml?branch=master)](https://github.com/GaryB432/gb-nx/actions)
[![npm version](https://img.shields.io/npm/v/@gb-nx/workspace?style=flat-square)](https://www.npmjs.com/package/@gb-nx/workspace)

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

Then you need to install the plugin in order to work with applications later on.

### Installing Plugin

```
# npm
npm install @gb-nx/workspace --save-dev

# yarn
yarn add @gb-nx/workspace --dev
```

### Add a module

```
nx g @nx/node:application payroll

nx g @gb-nx/workspace:module employee --kind class --project payroll
```

| OPTION       | DESCRIPTION                                                                                                     |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| --name       | The name of the module.                                                                                         |
| --project    | The project to target.                                                                                          |
| --skipFormat | Skip formatting files.                                                                                          |
| --directory  | The directory to create the module, relative to your project source.                                            |
| --kind       | The kind of module. `class` for a class or `values` for a general module to export expressions or functions etc |
| --skipTests  | Do not create "spec.ts" test files for the new module.                                                          |

## License

Copyright (c) 2021-2023 Gary Bortosky. Licensed under the MIT License (MIT)
