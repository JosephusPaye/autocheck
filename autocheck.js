const path = require('path');

const { getFileCache, fileExists } = require('./fs');
const { copySupportingFiles, createReport } = require('./report');

const performFileCheck = require('./check-file');
const performCommandCheck = require('./check-command');
const performMatchCheck = require('./check-match');

async function main() {
  const checksFile = await findChecksFile();
  const checks = getChecks(checksFile);

  println('running checks in: ', checksFile);
  println();

  const targetDirectories = getTargetDirectories();
  const results = [];

  for (directory of targetDirectories) {
    println('checking directory: ', directory);

    const completedCheckStatuses = {};
    const checkResults = [];

    for (const check of checks) {
      println('  running check: ', check.label);
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

    results.push({
      title: path.basename(directory),
      checks: checkResults,
      fileContents: getFileCache(directory),
    });
  }

  println();
  println('generating reports...');
  println();

  const resultsDirectory = path.join(process.cwd(), 'autocheck-reports');
  await copySupportingFiles(resultsDirectory);

  for (const result of results) {
    const reportFilePath = await createReport(result, resultsDirectory);
    println('generated report: ', reportFilePath);
  }

  println();
  println('done');
}

main();

function getTargetDirectories() {
  const targetDirectories = process.argv
    .slice(3)
    .map((directory) => path.resolve(directory)); // TODO: filter given paths to only directories

  if (targetDirectories.length === 0) {
    println('Provide one or more target directories to check');
    process.exit();
  }

  return targetDirectories;
}

async function findChecksFile() {
  const checksFile = process.argv[2];
  const checksFilePath = path.isAbsolute(checksFile)
    ? checksFile
    : path.join(process.cwd(), checksFile);

  if (!(await fileExists(checksFilePath))) {
    console.log('Checks file not found:', checksFilePath);
    process.exit();
  }

  return checksFilePath;
}

function getChecks(filePath) {
  try {
    return require(filePath);
  } catch (err) {
    console.log('Unable to read checks file:', err);
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
