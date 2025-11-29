import stylistic from "@stylistic/eslint-plugin";
import globals from "globals";
import * as tsParser from "@typescript-eslint/parser";

/** @type {import("eslint").Linter.Config} */
export default [
    {
        ignores: ["script/**/*.js", "coverage"],
    },
    stylistic.configs.customize({
        indent: 4,
        quotes: "double",
        semi: true,
    }),
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 6,
        },
        ...stylistic.configs.customize({
            indent: 4,
            quotes: "double",
            semi: true,
        }),
    },
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            globals: {
                console: globals.browser.console,
            },
        },
    },
];
