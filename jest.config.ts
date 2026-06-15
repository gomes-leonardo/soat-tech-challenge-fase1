import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';

const config: Config = {
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/test/unit/**/*.spec.ts'],
      transform: {
        '^.+\\.ts$': 'ts-jest',
      },
      moduleNameMapper: pathsToModuleNameMapper(
        {
          '@domain/*': ['src/domain/*'],
          '@application/*': ['src/application/*'],
          '@infrastructure/*': ['src/infrastructure/*'],
          '@interfaces/*': ['src/interfaces/*'],
        },
        { prefix: '<rootDir>/' },
      ),
      moduleFileExtensions: ['ts', 'js', 'json'],
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/test/integration/**/*.spec.ts'],
      transform: {
        '^.+\\.ts$': 'ts-jest',
      },
      moduleNameMapper: pathsToModuleNameMapper(
        {
          '@domain/*': ['src/domain/*'],
          '@application/*': ['src/application/*'],
          '@infrastructure/*': ['src/infrastructure/*'],
          '@interfaces/*': ['src/interfaces/*'],
        },
        { prefix: '<rootDir>/' },
      ),
      moduleFileExtensions: ['ts', 'js', 'json'],
    } as any,
    {
      displayName: 'e2e',
      testMatch: ['<rootDir>/test/e2e/**/*.spec.ts'],
      transform: {
        '^.+\\.ts$': 'ts-jest',
      },
      moduleNameMapper: pathsToModuleNameMapper(
        {
          '@domain/*': ['src/domain/*'],
          '@application/*': ['src/application/*'],
          '@infrastructure/*': ['src/infrastructure/*'],
          '@interfaces/*': ['src/interfaces/*'],
        },
        { prefix: '<rootDir>/' },
      ),
      moduleFileExtensions: ['ts', 'js', 'json'],
    } as any,
  ],
};

export default config;
