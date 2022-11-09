# @gb-nx/browser

This library was generated with [Nx](https://nx.dev).

[![CI](https://img.shields.io/github/workflow/status/GaryB432/gb-nx/CI)](https://github.com/GaryB432/gb-nx/actions)
[![npm version](https://img.shields.io/npm/v/@gb-nx/browser?style=flat-square)](https://www.npmjs.com/package/@gb-nx/browser)

> Nx Plugin adding first class support for [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/) Browser Extension applications in your Nx workspace

## Features

Here is a list of some of the coolest features of the plugin:

- ✅ Generation of browser extensions applications
- ✅ Building, testing, etc your extension projects

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
npm install @gb-nx/browser --save-dev

# yarn
yarn add @gb-nx/browser --dev
```

### Generating Project

Simply run the `extension` generator with the following command:

```
nx g @gb-nx/browser:extension my-extension
```

### Working with your Project

> nx run my-extension:build

> nx run my-extension:build-scripts

Load (or reload) the unpacked extension from `dist/apps/my-extension` with `Manage Extensions`

Refresh a browser page

Observe changes

Make changes to `my-extension\src`

Repeat

### Useful resources

- [Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
- [Chrome Web Store - Chrome Developers](https://developer.chrome.com/docs/webstore/?hl=en)
- [Chrome Web Store - Extensions](https://chrome.google.com/webstore/category/extensions)
- [Resize a PNG - Online PNG Maker](https://onlinepngtools.com/resize-png)

## License

Copyright (c) 2021-2023 Gary Bortosky. Licensed under the MIT License (MIT)
