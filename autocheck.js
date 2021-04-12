#!/usr/bin/env node

const path = require('path');
const yargs = require('yargs-parser');

const {
  getFileCache,
  fileExists,
  directoryExists,
  listDirectories,
} = require('./fs');
const {
  copySupportingFiles,
  createReport,
  generateReportsIndex,
} = require('./report');

const performFileCheck = require('./check-file');
const performCommandCheck = require('./check-command');
const performMatchCheck = require('./check-match');
const performSearchCheck = require('./check-search');

async function main() {
  const checksFile = await findChecksFile();
  const checks = getChecks(checksFile);

  println('running checks from ', checksFile);
  println();

  const targetDirectories = await getTargetDirectories();
  const results = [];

  const resultsDirectory = path.join(process.cwd(), 'autocheck-reports');
  await copySupportingFiles(resultsDirectory);

  let i = 1;
  for (directory of targetDirectories) {
    println(
      `checking directory (${i++}/${targetDirectories.length}): `,
      directory
    );

    const completedCheckStatuses = {};
    const checkResults = [];

    let j = 1;
    for (const check of checks) {
      println(`  running check (${j++}/${checks.length}): `, check.label);
      let checkResult;

      if (check.if) {
        const dependency = completedCheckStatuses[check.if];

        if (dependency) {
          if (dependency.status === 'passed') {
            checkResult = await performCheck(
              check,
              directory,
              completedCheckStatuses
            );
          } else {
            checkResult = {
              config: check,
              status: 'skipped',
              error: `Check skipped because the check it depends on, ${quote(
                check.if
              )}, ${
                dependency.status === 'skipped' ? 'was skipped' : 'failed'
              }.`,
            };
            println(
              `    check skipped because ${quote(check.if)} ${
                dependency.status === 'skipped' ? 'was skipped' : 'failed'
              }.`
            );
          }
        } else {
          checkResult = {
            config: check,
            status: 'skipped',
            error: `Check skipped because the check it depends on, ${quote(
              check.if
            )}, was not found. Make sure the referenced check exists and appears before this check.`,
          };
          println(`    check skipped because ${quote(check.if)} was not found`);
        }
      } else {
        checkResult = await performCheck(check, directory);
      }

      if (checkResult) {
        completedCheckStatuses[check.label] = {
          status: checkResult.status,
          output: checkResult.output,
        };
        checkResults.push(checkResult);

        if (checkResult.status !== 'skipped') {
          print('    check ' + checkResult.status);
          println(checkResult.error ? ': ' + checkResult.error : '');
        }
      } else {
        println('    check has no result');
      }
    }

    const result = {
      title: path.basename(directory),
      checks: checkResults,
      fileContents: getFileCache(directory),
    };

    results.push(result);

    const reportFilePath = await createReport(result, resultsDirectory);
    println('generated report: ', reportFilePath);

    println();
  }

  if (results.length > 0) {
    println('generating index...');

    generateReportsIndex(resultsDirectory);

    println(
      `open ${path.join(resultsDirectory, 'index.html')} in a browser to view reports`
    );
    println();
  }

  println('done');
}

main();

async function getTargetDirectories() {
  const targetDirectories = [];

  const args = yargs(process.argv.slice(3), {
    boolean: ['subfolders'],
  });

  for (const arg of args._) {
    const directory = path.isAbsolute(arg)
      ? arg
      : path.join(process.cwd(), arg);

    if (await directoryExists(directory)) {
      if (args.subfolders) {
        const directories = await listDirectories(directory, directory, {
          recursive: false,
        });
        targetDirectories.push(...directories);
      } else {
        targetDirectories.push(directory);
      }
    } else {
      console.log('target directory not found, ignoring: ', directory);
    }
  }

  if (targetDirectories.length === 0) {
    println('provide one or more target directories to check');
    process.exit();
  }

  return targetDirectories;
}

async function findChecksFile() {
  const checksFile = process.argv[2];

  if (!checksFile) {
    console.log('provide a JSON file of checks to run');
    process.exit();
  }

  const checksFilePath = path.isAbsolute(checksFile)
    ? checksFile
    : path.join(process.cwd(), checksFile);

  if (!(await fileExists(checksFilePath))) {
    console.log('checks file not found:', checksFilePath);
    process.exit();
  }

  return checksFilePath;
}

function getChecks(filePath) {
  try {
    return require(filePath);
  } catch (err) {
    console.log('unable to read checks file:', err);
    process.exit();
  }
}

async function performCheck(checkConfiguration, targetDirectory, context) {
  switch (checkConfiguration.type) {
    case 'file':
      return performFileCheck(checkConfiguration, targetDirectory, context);
    case 'command':
      return performCommandCheck(checkConfiguration, targetDirectory, context);
    case 'match':
      return performMatchCheck(checkConfiguration, targetDirectory, context);
    case 'search':
      return performSearchCheck(checkConfiguration, targetDirectory, context);
  }
}

function quote(text, delimiter = '`') {
  return delimiter + text + delimiter;
}

function print(...values) {
  for (const value of values) {
    process.stdout.write(value);
  }
}

function println(...values) {
  for (const value of values) {
    process.stdout.write(value);
  }
  process.stdout.write('\n');
}
