import type {Config} from '@jest/types';
import {compilerOptions} from './tsconfig.json';
import {pathsToModuleNameMapper} from "ts-jest";

const nextJest = require('next/jest');

const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths, {prefix: '<rootDir>/'});

const config: Config.InitialOptions = {
    ...nextJest(),
    moduleDirectories: ['node_modules', '<rootDir>'],
    moduleNameMapper,
    preset: 'ts-jest',
    testEnvironment: 'node',
};

export default config;