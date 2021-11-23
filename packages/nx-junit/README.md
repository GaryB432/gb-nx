# gb-nx nx-junit

[![CI](https://img.shields.io/github/workflow/status/GaryB432/gb-nx/CI)](https://github.com/GaryB432/gb-nx/actions)
[![latest](https://img.shields.io/npm/v/@gb-nx/nx-junit/latest.svg)](https://www.npmjs.com/package/@gb-nx/nx-junit)

> This plugin will add [Jest Junit Reporter](https://www.npmjs.com/package/jest-junit) to your [Nx](https://nx.dev/) project.

## Prerequisite

If you have not already, [create an Nx workspace](https://github.com/nrwl/nx#creating-an-nx-workspace) with the following:

```
npx create-nx-workspace@^12.0.0
```

## Getting Started

### Install Plugin

```
# npm
npm install @gb-nx/nx-junit --save-dev

# yarn
yarn add @gb-nx/nx-junit --dev
```

### Add Junit reporter to your app

You will need to have an app in your workspace. You can create one with `nx g @nrwl/node:app my-app`.

```
nx g @gb-nx/nx-junit:app my-app
```

## Generators (i.e. code generation)

### Application

`nx g @gb-nx/nx-junit:app <project> [options]`

| Arguments   | Description                  |
| ----------- | ---------------------------- |
| `<project>` | The project to add junit to. |

| Options             | Default   | Description                                |
| ------------------- | --------- | ------------------------------------------ |
| `--tags`            | -         | Tags to use for linting (comma-delimited). |
| `--reporterVersion` | `^13.0.0` | The version of `junit-reporter` to use.    |
| `--skipFormat`      | `false`   | Skip formatting files.                     |
