#!/usr/bin/env node

import sade from 'sade';
import { main } from './autocheck';

const pkg = require('../package.json');

const prog = sade('autocheck <checks-file> <target-directory>')
  .version(pkg.version)
  .describe('Run the checks in the given file against the given target directory')
  .option('-s, --subfolders', 'Run the checks against each child folder of the target directory')
  .example('./checks.json ./submissions/123456/')
  .example('./checks.json ./submissions/ --subfolders')
  .action(
    (
      checksFile: string,
      targetDirectory: string,
      options: { _: string[]; subfolders: boolean }
    ) => {
      main(checksFile, [targetDirectory].concat(options._), options.subfolders);
    }
  );

prog.parse(process.argv);
