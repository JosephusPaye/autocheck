#!/usr/bin/env node

import sade from 'sade';
import { main } from './autocheck';

const pkg = require('../package.json');

const prog = sade('autocheck <checks-file> <target-directory>')
  .version(pkg.version)
  .describe('Run the checks in the given file against the given target directory')
  .option('-s, --subfolders', 'Run the checks against each child folder of the target directory')
  .option('-o, --output-suffix', 'Append the given string as a suffix to all output files', '')
  .option('-c, --clean', 'Delete all files in the output directory before writing results')
  .example('./checks.json ./submissions/123456/')
  .example('./checks.json ./submissions/ --subfolders')
  .action(
    (
      checksFile: string,
      targetDirectory: string,
      options: { _: string[]; subfolders: boolean; 'output-suffix': string; clean: boolean }
    ) => {
      main(
        checksFile,
        [targetDirectory].concat(options._),
        options.subfolders,
        options['output-suffix'],
        options.clean
      );
    }
  );

prog.parse(process.argv);
