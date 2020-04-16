const path = require('path');

const { getFileCache } = require('./fs');
const { copySupportingFiles, createReport } = require('./report');

const performFileCheck = require('./check-file');
const performCommandCheck = require('./check-command');

async function main() {
  const targetDirectories = getTargetDirectories();
  const checks = getChecks();
  const results = [];

  for (directory of targetDirectories) {
    const tasks = checks.map((check) => {
      return performCheck(check, directory);
    });

    const checkResults = await Promise.all(tasks);

    results.push({
      title: path.basename(directory),
      checks: checkResults.filter(Boolean),
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

async function performCheck(checkConfiguration, targetDirectory) {
  switch (checkConfiguration.type) {
    case 'file':
      return performFileCheck(checkConfiguration, targetDirectory);
    case 'command':
      return performCommandCheck(checkConfiguration, targetDirectory);
  }
}
