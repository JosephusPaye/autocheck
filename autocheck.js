const path = require('path');

const { getFileCache } = require('./fs');
const { copySupportingFiles, createReport } = require('./report');

const performFileCheck = require('./check-file');
const performCommandCheck = require('./check-command');
const performMatchCheck = require('./check-match');

async function main() {
  const targetDirectories = getTargetDirectories();
  const checks = getChecks();
  const results = [];

  for (directory of targetDirectories) {
    const completedCheckStatuses = {};
    const checkResults = [];

    for (const check of checks) {
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
          }
        } else {
          checkResult = {
            config: check,
            status: 'skipped',
            error: `Check skipped because the check it depends on, ${quote(
              check.if
            )}, was not found. Make sure the referenced check exists and appears before this check.`,
          };
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
      }
    }

    results.push({
      title: path.basename(directory),
      checks: checkResults,
      fileContents: getFileCache(directory),
    });
  }

  await copySupportingFiles();
  console.log('copied supporting files');

  for (const result of results) {
    await createReport(result);
    console.log('created report for target: ', result.title);
  }
}

main();

function getTargetDirectories() {
  const targetDirectories = process.argv
    .slice(2)
    .map((directory) => path.resolve(directory)); // TODO: filter given paths to only directories

  if (targetDirectories.length === 0) {
    console.log('Provide one or more target directories to check');
    process.exit();
  }

  return targetDirectories;
}

function getChecks() {
  try {
    // TODO: take checks.json path as an argument
    return require('./checks.json');
  } catch (err) {
    console.log('Unable to read checks.json file:', err);
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
