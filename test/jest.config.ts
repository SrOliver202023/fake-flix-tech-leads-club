/** @jest-config-loader esbuild-register */
import config from './jest.shared';
import { defineConfig } from 'jest';

export default defineConfig({
  ...config,
  testRegex: '.*\\.spec\\.ts$',
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
});
