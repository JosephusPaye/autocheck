import fs from 'fs';
import path from 'path';
import picomatch from 'picomatch';
import upath from 'upath';
import rimraf from 'rimraf';
import copydir, { CopyDirOptions } from 'copy-dir';

export const createReadStream = fs.createReadStream;

export async function readString(filePath: string) {
  return fs.promises.readFile(filePath, 'utf8');
}

const fileCache: Map<string, Map<string, string>> = new Map();

export async function readStringAndCache(
  filePath: string,
  key: string,
  namespace: string
): Promise<string> {
  const content = await fs.promises.readFile(filePath, 'utf8');

  const namespaceContent = fileCache.get(namespace) ?? new Map<string, string>();

  namespaceContent.set(key, content);

  fileCache.set(namespace, namespaceContent);

  return content;
}

export function getFileCache(namespace: string): Record<string, string> {
  const cache = fileCache.get(namespace) ?? new Map<string, string>();
  const output: Record<string, string> = {};

  cache.forEach((value, key) => {
    output[key] = value;
  });

  return output;
}

export async function writeString(filePath: string, string: string) {
  return fs.promises.writeFile(filePath, string);
}

type FileList = { path: string; relativePath: string }[];

export async function listFiles(
  currentDirectory: string,
  rootDirectory: string
): Promise<FileList> {
  const files: FileList = [];
  const names = await fs.promises.readdir(currentDirectory);

  for (const file of names) {
    const filePath = path.join(currentDirectory, file);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      files.push(...(await listFiles(filePath, rootDirectory)));
    } else {
      files.push({
        path: filePath,
        relativePath: upath
          .toUnix(filePath)
          .replace(upath.toUnix(path.join(rootDirectory, path.sep)), ''),
      });
    }
  }

  return files;
}

export async function listDirectories(
  currentDirectory: string,
  rootDirectory: string,
  options = { recursive: true }
): Promise<string[]> {
  const directories: string[] = [];
  const names = await fs.promises.readdir(currentDirectory);

  for (const name of names) {
    const fullPath = path.join(currentDirectory, name);
    const stat = await fs.promises.stat(fullPath);

    if (stat.isDirectory()) {
      directories.push(fullPath);

      if (options.recursive) {
        directories.push(...(await listDirectories(fullPath, rootDirectory, options)));
      }
    }
  }

  return directories;
}

export async function expandGlobs(rootDirectory: string, globs: string[]): Promise<FileList> {
  const files = await listFiles(rootDirectory, rootDirectory);
  const isMatch = picomatch(globs);

  return files.filter((file) => isMatch(file.relativePath));
}

export function cleanDirectoryContent(directory: string): Promise<void> {
  return new Promise((resolve, reject) => {
    rimraf(path.join(directory, '*'), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export function copyDirectory(
  source: string,
  destination: string,
  options: CopyDirOptions
): Promise<void> {
  return new Promise((resolve, reject) => {
    copydir(source, destination, options, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    return (await fs.promises.stat(filePath)).isFile();
  } catch {
    return false;
  }
}

export async function directoryExists(directoryPath: string): Promise<boolean> {
  try {
    return (await fs.promises.stat(directoryPath)).isDirectory();
  } catch {
    return false;
  }
}

export function isTextFile(extension: string) {
  return [
    'txt',
    'md',
    'c',
    'cpp',
    'cs',
    'h',
    'hpp',
    'makefile',
    'java',
    'py',
    'html',
    'css',
    'js',
    'json',
    'xml',
    'svg',
  ].includes(extension);
}
