# Node "exports" field explanation

Node doesn't allow using `.js` extension for both `esm` and `cjs` files in the same project when importing files _from_ that project. This is why this `exports` field is **BAD**:

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

When running this package, you will get an error, depending on it's `type` field:

- run `node cjs/test-esm.js` to get `require() of ES Module` error (if package has no `type` or `type` is `commonjs`)

  - which means you can only use `import` syntax to use this module in Node
  - run `node cjs/test-cjs.mjs` to not get an error

- run `node esm/test-cjs.mjs` to get `The requested module 'test-cjs' is a CommonJS module` error (if package has `"type": "module"`)
  - which means you can only use `require` syntax to use this module in Node
  - run `node esm/test-esm.mjs` to not get an error

To fix this, bundle your files with appropriate extensions:

- if your package doesn't have `"type"` in your `package.json`, use `.cjs`/`.js` extensions, when files have `commonjs` syntax, and `.mjs` extension for files with `esm` syntax
- if your package has `"type": "commonjs"` in your `package.json`, use `.cjs`/`.js` extensions, when files have `commonjs` syntax, and `.mjs` extension for files with `esm` syntax
- if your package has `"type": "module"` in your `package.json`, use `.cjs` extension, when files have `commonjs` syntax, and `.mjs`/`.js` extension for files with `esm` syntax

If you run `node cjs/test-mixed.js` or `node esm/test-mixed.mjs` you will see no errors because it has correct `exports` field.

> Warning: These examples work with Webpack/Rollup/Vite and other bundler's pipelines because they don't _run_ these files, they only read and analyze them, but they will **FAIL** when run inside Node by tools like Vitest.

To build you project correctly, use one of these configs:

## rollup.config.js

```js
export default {
  input: "src/index.ts",
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

> TODO

# See also
- [Dual CommonJS/ES module packages in official Node.js documentation](https://nodejs.org/api/packages.html#dual-commonjses-module-packages)
- [Publish ESM and CJS in a single package](https://antfu.me/posts/publish-esm-and-cjs) by [Anthony Fu](https://github.com/antfu)
