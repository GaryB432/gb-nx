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

See `nx g @gb-nx/workspace --help` for all options

| OPTION            | DESCRIPTION                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| --name            | The name of the module.                                                                                         |
| --project         | The project to target.                                                                                          |
| --skipFormat      | Skip formatting files.                                                                                          |
| --pascalCaseFiles | Use Pascal case for `class` type module file names.                                                             |
| --directory       | The directory to create the module, relative to your project source.                                            |
| --kind            | The kind of module. `class` for a class or `values` for a general module to export expressions or functions etc |
| --skipTests       | Do not create "spec.ts" test files for the new module.                                                          |

### Add [junit reporter](https://www.npmjs.com/package/jest-junit) to a [@nx/jest](https://nx.dev/nx-api/jest) project

`nx g @gb-nx/workspace:junit <project> [options]`

| Arguments   | Description                  |
| ----------- | ---------------------------- |
| `<project>` | The project to add junit to. |

| Options             | Default   | Description                                |
| ------------------- | --------- | ------------------------------------------ |
| `--tags`            | -         | Tags to use for linting (comma-delimited). |
| `--reporterVersion` | `^16.0.0` | The version of `junit-reporter` to use.    |
| `--skipFormat`      | `false`   | Skip formatting files.                     |

## Migrations

This plugin supports Nx migrations and provides necessary version and code updates. So instead of bumping plugin version manually in package.json it's recommended to run `nx migrate @gb-nx/workspace` command, that includes bumping the version of the @gb-nx/workspace plugin, related dependencies and running code migrations.

## @gb-nx/workspace & Nx Compatibility Chart

| @gb-nx/workspace version | Nx version |
| ------------------------ | ---------- |
| ^5.0.0                   | ^18.0.0    |
| ^4.0.0                   | ^17.0.0    |
| ^3.0.0                   | ^16.0.0    |
| <3.0.0                   | ^15.0.0    |

## License

MIT
