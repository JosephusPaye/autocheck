const path = require('path');
const rimraf = require('rimraf');
const copydir = require('copy-dir');

const { readString, writeString } = require('./files');

const viewerDistDirectory = path.join(__dirname, 'viewer', 'dist');
const resultsDirectory = path.join(__dirname, 'results');

let reportTemplate;
function getReportTemplate() {
  if (reportTemplate) {
    return reportTemplate;
  }

  try {
    reportTemplate = readString(path.join(viewerDistDirectory, 'index.html'));

    return reportTemplate;
  } catch (err) {
    console.error('Unable to report template', err);
    return '';
  }
}

module.exports.createReport = function createReport(result) {
  const template = getReportTemplate();
  const report = template
    .replace('$TITLE', result.title)
    .replace('$REPORT', JSON.stringify(result));

  writeString(
    path.join(resultsDirectory, result.title.trim() + '.html'),
    report
  );
};

module.exports.copySupportingFiles = function copySupportingFiles(callback) {
  rimraf(resultsDirectory + '/*', () => {
    copydir(
      viewerDistDirectory,
      resultsDirectory,
      {
        filter(stat, filepath) {
          // Don't copy .html files
          if (stat === 'file' && path.extname(filepath) === '.html') {
            return false;
          }
          return true;
        },
      },
      () => {
        callback();
      }
    );
  });
};
