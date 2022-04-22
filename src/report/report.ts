import path from 'path';
import fs from 'fs';
import url from 'url';
import filenamify from 'filenamify';

import { writeString, copyDirectory, readStringAndCache } from '../util/fs';
import { Result } from '../autocheck';

const viewerDistDirectory = path.join(__dirname, '..', '..', 'viewer', 'dist');

const reportTemplatePath = path.join(viewerDistDirectory, 'index.html');
export async function createReport(
  result: Result,
  resultsDirectory: string,
  fileNamePrepend: string = ''
): Promise<string> {
  const template = await getTemplate(reportTemplatePath);

  const report = template
    .replace('$TITLE', result.title)
    .replace('$REPORT', JSON.stringify(result));

  const reportFilePath = path.join(
    resultsDirectory,
    filenamify(fileNamePrepend + result.title.trim()) + '.html'
  );

  await writeString(reportFilePath, report);

  return reportFilePath;
}

export async function copySupportingFiles(resultsDirectory: string) {
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

const indexTemplatePath = path.join(__dirname, 'index-template.html');
export async function generateReportsIndex(
  resultsDirectory: string,
  reportTitle = 'Autocheck Reports'
) {
  const files = fs
    .readdirSync(resultsDirectory)
    .filter((name) => name.endsWith('.html') && name !== 'index.html')
    .map((name) => {
      const reportPath = path.join(resultsDirectory, name);
      return {
        name: name.replace('.html', ''),
        path: reportPath,
        url: name,
      };
    });

  const links = files.map((file) => {
    return `<a href="${file.url}" target="viewer">${file.name}</a>`;
  });

  const template = await getTemplate(indexTemplatePath);
  const html = template
    .replace('{{ $TITLE }}', reportTitle)
    .replace('{{ $REPORT_LINKS }}', links.join('\n'));

  const fileName = path.join(resultsDirectory, 'index.html');

  await writeString(fileName, html);

  return fileName;
}

const reportFilesNamespace = '__autocheck-report-templates';
async function getTemplate(filePath: string): Promise<string> {
  const parsed = path.parse(filePath);

  try {
    return await readStringAndCache(filePath, parsed.base, reportFilesNamespace);
  } catch (err) {
    console.error(`unable to read template file: ${filePath}`, err);
    return '';
  }
}
