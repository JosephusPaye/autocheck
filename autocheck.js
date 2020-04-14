const path = require('path');
const performEmbedCheck = require('./checks/embed');
const { readString } = require('./files');
const { copySupportingFiles, createReport } = require('./report');

const targetDirectories = process.argv
  .slice(2)
  .map((directory) => path.resolve(directory)); // TODO: filter given paths to only directories

if (targetDirectories.length === 0) {
  console.log('Provide one or more target directories to check');
  process.exit();
}

function performCheck(check, targetDirectory) {
  if (check.type === 'embed') {
    return performEmbedCheck(check, targetDirectory);
  }
}

let reportTemplate;
function getReportTemplate() {
  if (reportTemplate) {
    return reportTemplate;
  }

  reportTemplate = readString;
}

const checks = require('./checks.json');
const results = targetDirectories.map((directory) => {
  return {
    title: path.basename(directory),
    checks: checks
      .map((check) => {
        return performCheck(check, directory);
      })
      .filter(Boolean),
  };
});

// console.dir(results, { colors: true, depth: 999 });

copySupportingFiles(() => {
  console.log('copied supporting files');
  results.forEach((result) => {
    createReport(result);
    console.log('created report for target: ', result.title);
  });
});
