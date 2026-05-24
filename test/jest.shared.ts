/** @jest-config-loader esbuild-register */
import { defineConfig } from 'jest';

export default defineConfig({
  verbose: true,
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../',
  testEnvironment: 'node',

  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@database/(.*)$': '<rootDir>/database/$1',
    '^@testInfra/(.*)$': '<rootDir>/test/$1',
  },

  preset: 'ts-jest',

  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  setupFiles: ['<rootDir>/test/setup.ts'],
  resetMocks: true,
});
