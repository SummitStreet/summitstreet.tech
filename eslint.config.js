/**
 * @license
 * The MIT License (MIT)
 *
 * Copyright (c) 2025 David Padgett/Summit Street Technologies.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @file
 * ESLint configuration for the summitstreet.tech-svelte project.
 */

import globals from "globals";
import html from "@html-eslint/eslint-plugin";
import htmlParser from "@html-eslint/parser";
import js from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";
import markdown from "@eslint/markdown";
import prettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import svelteConfig from "./svelte.config.js";
import svelteParser from "svelte-eslint-parser";
import sveltePlugin from "eslint-plugin-svelte";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [".svelte-kit/**", "build/**", "coverage/**", "dist/**", "node_modules/**", "test-results/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...sveltePlugin.configs.recommended,
  ...sveltePlugin.configs.prettier,
  prettier,
  {
    files: ["**/*.html"],
    plugins: { html },
    languageOptions: {
      parser: htmlParser,
      globals: globals.browser,
    },
    rules: {
      ...html.configs.recommended.rules,
      "html/indent": "off",
      "html/attrs-newline": "off",
      "html/no-extra-spacing-attrs": "off",
      "html/no-extra-spacing-tags": "off",
      "html/require-closing-tags": "off",
      "html/require-lang": "error",
      "no-console": ["warn", { allow: ["error", "warn"] }],
      "no-undef": "error",
      "no-unused-vars": "warn",
    },
  },
  {
    // app.html is a SvelteKit shell template; the <title> element is intentionally
    // omitted here and managed via <svelte:head> in +layout.svelte instead.
    files: ["src/app.html"],
    rules: {
      "html/require-title": "off",
    },
  },
  {
    files: ["**/*.md"],
    plugins: { markdown },
    processor: "markdown/markdown",
    rules: {
      "markdown/no-invalid-label-refs": "error",
    },
  },
  {
    files: ["**/*.md/*.js", "**/*.md/*.ts", "**/*.md/*.svelte"],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.md/*.js", "*.md/*.ts", "*.md/*.svelte"],
        },
      },
    },
    rules: {
      "no-console": "off",
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: svelteParser,
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        projectService: { allowDefaultProject: ["*.md/*.ts", "*.md/*.js", "*.md/*.svelte"] },
        extraFileExtensions: [".svelte"],
        parser: tseslint.parser,
        svelteConfig,
      },
    },
    plugins: {
      svelte: sveltePlugin,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  {
    files: ["src/**/*.ts", "scripts/**/*.ts", "tests/**/*.ts", "*.ts"],
    plugins: { jsdoc, "simple-import-sort": simpleImportSort },
    languageOptions: {
      parser: tseslint.parser,
      globals: { ...globals.node, ...globals.vitest, ...globals.browser },
    },
    rules: {
      ...jsdoc.configs["flat/contents-typescript-error"].rules,
      "jsdoc/require-file-overview": "error",

      "jsdoc/require-description": "error",
      "jsdoc/require-jsdoc": "error",
      "jsdoc/text-escaping": "off",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "max-len": [
        "error",
        {
          code: 120,
          comments: 80,
          ignoreRegExpLiterals: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreUrls: true,
        },
      ],
    },
  },
];
