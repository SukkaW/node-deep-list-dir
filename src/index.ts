import { promises as fsp } from 'fs';
import type fs from 'fs';
import { join } from 'path';

interface ListDirOptions {
  ignoreHidden?: boolean,
  ignorePattern?: RegExp | null
}

function listDir(path: string, options: ListDirOptions = {}): Promise<string[]> {
  const results: string[] = [];
  const { ignoreHidden = true, ignorePattern = null } = options;
  return listDirWalker(path, results, '', ignoreHidden, ignorePattern).then(() => results);
}

type VoidOrVoidArray = void | VoidOrVoidArray[];

function listDirWalker(path: string, results: string[], parent: string, ignoreHidden: boolean, ignorePattern: RegExp | null): Promise<VoidOrVoidArray> {
  return readAndFilterDir(path, ignoreHidden, ignorePattern).then(items => {
    const promises: Array<Promise<VoidOrVoidArray>> = [];

    for (let i = 0, len = items.length; i < len; i++) {
      const item = items[i];
      const currentPath = join(parent, item.name);
      if (item.isDirectory()) {
        promises.push(listDirWalker(join(path, item.name), results, currentPath, ignoreHidden, ignorePattern));
      } else {
        results.push(currentPath);
      }
    }

    return Promise.all(promises);
  });
}

async function readAndFilterDir(path: string, ignoreHidden: boolean, ignorePattern: RegExp | null) {
  const results: fs.Dirent[] = [];

  for await (const item of await fsp.opendir(path)) {
    if (ignoreHidden && item.name[0] === '.') {
      continue;
    }
    if (ignorePattern && ignorePattern.test(item.name)) {
      continue;
    }
    results.push(item);
  }

  return results;
}

export = listDir;
