const path = require('path');
const performFileCheck = require('./checks/file');
const { copySupportingFiles, createReport } = require('./report');
const { getFileCache } = require('./files');

const targetDirectories = process.argv
  .slice(2)
  .map((directory) => path.resolve(directory)); // TODO: filter given paths to only directories

if (targetDirectories.length === 0) {
  console.log('Provide one or more target directories to check');
  process.exit();
}

function performCheck(checkConfiguration, targetDirectory) {
  if (checkConfiguration.type === 'file') {
    return performFileCheck(checkConfiguration, targetDirectory);
  }
}

const checks = require('./checks.json');
const results = targetDirectories.map((directory) => {
  const report = {
    title: path.basename(directory),
    checks: checks
      .map((check) => {
        return performCheck(check, directory);
      })
      .filter(Boolean),
  };
  report.fileContents = getFileCache(directory);
  return report;
});

copySupportingFiles(() => {
  console.log('copied supporting files');
  results.forEach((result) => {
    createReport(result);
    console.log('created report for target: ', result.title);
  });
});
