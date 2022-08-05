# @gb-nx/cli

This library was generated with [Nx](https://nx.dev).

[![CI](https://img.shields.io/github/workflow/status/GaryB432/gb-nx/CI)](https://github.com/GaryB432/gb-nx/actions)
[![npm version](https://img.shields.io/npm/v/@gb-nx/cli?style=flat-square)](https://www.npmjs.com/package/@gb-nx/cli)

> Nx Plugin adding command line applications in your Nx workspace

## Features

Here is a list of some of the coolest features of the plugin:

- ✅ Generation of command line applications
- ✅ You work with the commands and the plugin manages boilerplate
- ✅ Building, testing, etc your projects

## Prerequisite

If you have not already, [create an Nx workspace](https://github.com/nrwl/nx#creating-an-nx-workspace) with the following:

```
# npm
npx create-nx-workspace@latest

# yarn
yarn create nx-workspace@latest
```

## Getting Started

Then you need to install the plugin in order to generate extension applications later on.

### Installing Plugin

```
# npm
npm install @gb-nx/cli --save-dev

# yarn
yarn add @gb-nx/cli --dev
```

### Generating Project

Simply run the `application` generator with the following command:

```
nx g @gb-nx/cli:application my-app
```

### Working with your Project

> nx build my-app

Add a command to the project with the `command` generator

```
nx g @gb-nx/cli:command <name> --project my-app
```

You'll want to edit the generated `cli.config.json` file to document your command. The values from the config file are used to generated the boilerplate for your project.

The `refersh` generator can refresh your `my-app/src/main.ts`, command reference file, `my-app/commands.md` and the type definitions for your commands. Run this command when you change your `cli.config.json` file.

```
nx g @gb-nx/cli:refresh --project my-app --main --ts --markdown
```

## License

Copyright (c) 2021-2022 Gary Bortosky. Licensed under the MIT License (MIT)
