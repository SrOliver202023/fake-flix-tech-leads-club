/** @jest-config-loader esbuild-register */
import config from './jest.shared';
import { defineConfig } from 'jest';

export default defineConfig({
  ...config,
  // testMatch: ['<rootDir>/src/__test__/e2e/*.spec.ts'],
  testRegex: '.*\\.e2e-spec\\.ts$',
});
