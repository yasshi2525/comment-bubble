import { createDefaultPreset } from "ts-jest";

/** @type {import("jest").Config} */
export default {
    collectCoverage: true,
    coverageDirectory: "coverage",
    collectCoverageFrom: ["src/**"],
    testMatch: ["<rootDir>/spec/unit/**/*.spec.ts"],
    setupFilesAfterEnv: ["<rootDir>/spec/env/unit.cjs"],
    ...createDefaultPreset({
        tsconfig: "spec/unit/tsconfig.json",
    }),
};
