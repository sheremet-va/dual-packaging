# Node "exports" field explanation

Node doesn't allow using `.js` extension for both `esm` and `commonjs` files in the same project when importing files _from_ that project. This is why this `exports` field is **BAD**:

```json
{
  "exports": {
    ".": {
      "import": "./index.esm.js",
      "require": "./index.cjs.js"
    }
  }
}
```

> Run `pnpm install` before running examples

## Prerequisite

We have 3 packages:

- **test-cjs** is a commonjs package that has incorrect `exports` field for "import" files (has `.js` extension)
- **test-esm** is a esm pckage that has incorrect `exports` field for "require" files (has `.js` extension)
- **test-mixed** is commonjs package that has correct `exports` field for "import" and "require" files (has `.mjs` and `.cjs` extensions)
- **test-folder** is a commonjs package that has correct `exports` field for "import" and "require" files (has `.js` extension, but `esm` is inside `/esm` folder with near `package.json` having `"type": "module"`)

## Examples

When running this package, you will get an error, depending on it's `type` field:

- run `node cjs/test-esm.js` to get `require() of ES modules is not supported` error (cjs `requires` cjs-like file inside esm package)

  - which means you can only use `import` syntax with this module in Node
  - example: when running `node esm/test-esm.mjs`, you will not get an error (esm `imports` esm)

- run `node esm/test-cjs.mjs` to get `The requested module 'test-cjs' is a CommonJS module` error (esm `imports` esm-like file inside cjs package)

  - which means you can only use `require` syntax with this module in Node
  - example: when running `node cjs/test-cjs.js`, you will not get an error (cjs `requires` cjs)

- if you run `node cjs/test-mixed.js` or `node esm/test-mixed.mjs` you will see no errors because it has correct `exports` field.
- if you run `node cjs/test-folder.js` or `node esm/test-folder.mjs` you will see no errors because it has correct `exports` field, and `esm` file has a `package.json` near it with `"type": "module"`.

To fix this, bundle your files with appropriate extensions:

1. If your package doesn't have `"type"` in your `package.json`, use `.cjs`/`.js` extensions, when files have `commonjs` syntax, and `.mjs` extension for files with `esm` syntax

```jsonc
{
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.js" // or "./index.cjs"
    }
  }
}
```

2. If your package has `"type": "commonjs"` in your `package.json`, use `.cjs`/`.js` extensions, when files have `commonjs` syntax, and `.mjs` extension for files with `esm` syntax

```jsonc
{
  "type": "commonjs",
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.js" // or "./index.cjs"
    }
  }
}
```

3. If your package has `"type": "module"` in your `package.json`, use `.cjs` extension, when files have `commonjs` syntax, and `.mjs`/`.js` extension for files with `esm` syntax

```jsonc
{
  "type": "module",
  "exports": {
    ".": {
      "import": "./index.js", // or "./index.mjs"
      "require": "./index.cjs"
    }
  }
}
```

4. If your bundler doesn't allow mixing extensions, you can build `esm` files inside `/esm` folder and put a `package.json` with `"type": "module"` inside.

`package.json` in the root:

```jsonc
{
  "exports": {
    ".": {
      "import": "./esm/index.js",
      "require": "./index.js"
    }
  }
}
```

`package.json` in `/esm`:

```jsonc
{
  "type": "module"
}
```

> Warning: These examples work with Webpack/Rollup/Vite and other bundler's pipelines because they don't _run_ these files, they only read and analyze them, but they will **FAIL** when run inside Node by tools like Vitest, SSR or manually.

To build you project correctly, use one of these configs (you can see this in `examples` folder):

## rollup.config.js

```js
export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/index.cjs",
      format: "cjs",
    },
    {
      file: "dist/index.mjs",
      format: "esm",
    },
  ],
};
```

## webpack.config.js

> TODO

## vite.config.js

```js
export default {
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.js"),
      name: "MyName",
      fileName: (format) => `index.${format == "es" ? "mjs" : "js"}`,
    },
  },
};
```

## tsup.config.js

```js
export default {
  entry: ["src/index.js"],
  format: ["esm", "cjs"],
};
```

## using tsc

This will create `dist` folder with commonjs files, and `esm` folder inside with esm files.

You will need two `tsconfig.json` configs:

```jsonc
// tsconfig.cjs.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "outDir": "dist",
    "target": "es2015"
  }
}
```

```jsonc
// tsconfig.esm.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "esnext",
    "outDir": "dist/esm",
    "target": "esnext"
  }
}
```

Run these command to generate `dist`:

```bash
$ tsc -p tsconfig.cjs.json
$ tsc -p tsconfig.esm.json
```

Then you need to put `package.json` with `"type": "module"` inside `dist/esm` folder. You can do it in several ways, but the easiest would be running this command:

```bash
$ echo >dist/esm/package.json "{\"type\":\"module\"}"
```

# See also

- [Dual CommonJS/ES module packages in official Node.js documentation](https://nodejs.org/api/packages.html#dual-commonjses-module-packages)
- [Publish ESM and CJS in a single package](https://antfu.me/posts/publish-esm-and-cjs) by [Anthony Fu](https://github.com/antfu)
- [How to Create a Hybrid NPM Module for ESM and CommonJS](https://www.sensedeep.com/blog/posts/2021/how-to-create-single-source-npm-module.html) on SenseDeep
