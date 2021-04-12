// @ts-check

const path = require('path');
const fs = require('fs');
const url = require('url');

const {
  readString,
  writeString,
  cleanDirectoryContent,
  copyDirectory,
} = require('./fs');

module.exports.createReport = createReport;
module.exports.copySupportingFiles = copySupportingFiles;
module.exports.generateReportsIndex = generateReportsIndex;

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
    console.error('Unable to get report template', err);
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

function generateReportsIndex(resultsDirectory) {
  const files = fs
    .readdirSync(resultsDirectory)
    .filter((name) => name.endsWith('.html') && name !== 'index.html')
    .map((name) => {
      const reportPath = path.join(resultsDirectory, name);
      return {
        name: name.replace('.html', ''),
        path: reportPath,
        url: url.pathToFileURL(reportPath),
      };
    });

  const links = files.map((file) => {
    return `<a href="${file.url}" target="viewer">${file.name}</a>`;
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Autocheck Reports</title>
    <style>
      html {
        overflow-x: hidden;
      }

      html,
      body,
      body > div {
        margin: 0;
        padding: 0;
        height: 100vh;
        width: 100vh;
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      }

      .sidebar a {
        display: block;
        fong-size: 18px;
        padding: 6px 16px;
        border-top: 1px solid #ccc;
        text-decoration: none !important;
      }

      .sidebar a:first-child {
        border-top: 0;
      }

      .sidebar a:hover {
        background-color: #ddd;
      }

      .sidebar a.active {
        font-weight: 600;
        color: white !important;
        background-color: #3f51b5;
      }
    </style>
  </head>
  <body>
    <div style="display: flex; width: 100vw; height: 100vh">
      <div class="sidebar" style="width: 200px; background-color: #eee">
        ${links.join('\n')}
      </div>
      <iframe
        style="width: calc(100vw - 200px); height: 100vh;"
        name="viewer"
        frameborder="0"
      ></iframe>
    </div>

    <script>
      const links = Array.from(document.querySelectorAll('.sidebar a'));
      links.forEach((el) => {
        el.addEventListener('click', activateLink);
      });
      function activateLink(e) {
        links.forEach((el) => {
          el.className = '';
        });
        e.target.className = 'active';
      }
    </script>
  </body>
</html>
`;

  fs.writeFileSync(path.join(resultsDirectory, 'index.html'), html);
}
