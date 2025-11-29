import { createDefaultPreset } from "ts-jest";

/** @type {import("jest").Config} */
export default {
    collectCoverage: true,
    coverageDirectory: "coverage",
    collectCoverageFrom: ["src/**"],
    testMatch: ["<rootDir>/spec/unit/**/*Spec.ts"],
    testEnvironment: "@yasshi2525/jest-environment-akashic",
    ...createDefaultPreset({
        tsconfig: "spec/unit/tsconfig.json",
    }),
};
