import fs from 'fs';
import { join } from 'path';

interface ListDirOptions {
  ignoreHidden?: boolean,
  ignorePattern?: RegExp | null
}

function listDir(path: string, options?: ListDirOptions): Promise<string[]> {
  const results: string[] = [];

  options = {
    ignoreHidden: true,
    ignorePattern: null,
    ...options
  };

  return listDirWalker(path, results, '', options).then(() => results);
}

function listDirWalker(path: string, results: string[], parent: string, options: ListDirOptions): Promise<any[]> {
  const promises: Array<Promise<any[]>> = [];

  return readAndFilterDir(path, options).then(items => {
    items.forEach(item => {
      const currentPath = join(parent, item.name);

      if (item.isDirectory()) {
        promises.push(listDirWalker(join(path, item.name), results, currentPath, options));
      } else {
        results.push(currentPath);
      }
    });
  }).then(() => Promise.all(promises));
}

function readAndFilterDir(path: string, options: ListDirOptions) {
  const { ignoreHidden = true, ignorePattern } = options;

  return fs.promises.readdir(path, { ...options, withFileTypes: true })
    .then(results => {
      if (ignoreHidden) {
        results = results.filter(({ name }) => !name.startsWith('.'));
      }
      if (ignorePattern) {
        results = results.filter(({ name }) => !ignorePattern.test(name));
      }

      return results;
    });
}

export = listDir;
