const path = require('path');

const {
  readString,
  writeString,
  cleanContents,
  copyDirectory,
} = require('./fs');

module.exports.createReport = createReport;
module.exports.copySupportingFiles = copySupportingFiles;

const viewerDistDirectory = path.join(__dirname, 'viewer', 'dist');
const resultsDirectory = path.join(__dirname, 'results');

let reportTemplate;
async function getReportTemplate() {
  if (reportTemplate) {
    return reportTemplate;
  }

  try {
    reportTemplate = await readString(
      path.join(viewerDistDirectory, 'index.html')
    );
    return reportTemplate;
  } catch (err) {
    console.error('Unable to report template', err);
    return '';
  }
}

async function createReport(result) {
  const template = await getReportTemplate();
  const report = template
    .replace('$TITLE', result.title)
    .replace('$REPORT', JSON.stringify(result));

  return writeString(
    path.join(resultsDirectory, result.title.trim() + '.html'),
    report
  );
}

async function copySupportingFiles() {
  await cleanContents(resultsDirectory);
  return copyDirectory(viewerDistDirectory, resultsDirectory, {
    filter(stat, filepath) {
      // Don't copy .html files
      if (stat === 'file' && path.extname(filepath) === '.html') {
        return false;
      }
      return true;
    },
  });
}
