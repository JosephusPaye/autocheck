const path = require('path');

const {
  readString,
  writeString,
  cleanDirectoryContent,
  copyDirectory,
} = require('./fs');

module.exports.createReport = createReport;
module.exports.copySupportingFiles = copySupportingFiles;

const viewerDistDirectory = path.join(__dirname, 'viewer', 'dist');

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

async function createReport(result, resultsDirectory) {
  const template = await getReportTemplate();
  const report = template
    .replace('$TITLE', result.title)
    .replace('$REPORT', JSON.stringify(result));

  const reportFilePath = path.join(
    resultsDirectory,
    result.title.trim() + '.html'
  );

  await writeString(reportFilePath, report);

  return reportFilePath;
}

async function copySupportingFiles(resultsDirectory) {
  await cleanDirectoryContent(resultsDirectory);
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
