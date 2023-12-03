import chai from 'chai';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

import listDir from '../src';

chai.should();

function createDummyFolder(path: string): void {
  const filesMap = {
    // Normal files in a hidden folder
    [join('.hidden', 'a.txt')]: 'a',
    [join('.hidden', 'b.js')]: 'b',
    // Normal folder in a hidden folder
    [join('.hidden', 'c', 'd')]: 'd',
    // Top-class files
    'e.txt': 'e',
    'f.js': 'f',
    // A hidden file
    '.g': 'g',
    // Files in a normal folder
    [join('folder', 'h.txt')]: 'h',
    [join('folder', 'i.js')]: 'i',
    // A hidden files in a normal folder
    [join('folder', '.j')]: 'j'
  };

  Object.entries(filesMap).map(([fileKey, fileContent]) => writeFileSync(join(path, fileKey), fileContent));
}

describe('@sukka/listdir', () => {
  const tmpDir = join(__dirname, 'fs_tmp');
  const target = join(tmpDir, 'test');

  before(() => {
    mkdirSync(join(target, 'folder'), { recursive: true });
    mkdirSync(join(target, '.hidden', 'c'), { recursive: true });
    createDummyFolder(target);
  });
  after(() => rmSync(tmpDir, { recursive: true, force: true }));

  it('list dir', async () => {
    const expected = [
      'e.txt',
      'f.js',
      join('folder', 'h.txt'),
      join('folder', 'i.js')
    ];

    const dir = await listDir(target);
    dir.should.eql(expected);

    // await fs.rmdir(target);
  });

  it('listDir() - ignoreHidden off', async () => {
    const filenames = [
      join('.hidden', 'a.txt'),
      join('.hidden', 'b.js'),
      join('.hidden', 'c', 'd'),
      'e.txt',
      'f.js',
      '.g',
      join('folder', 'h.txt'),
      join('folder', 'i.js'),
      join('folder', '.j')
    ];

    const dir = await listDir(target, { ignoreHidden: false });
    dir.should.have.members(filenames);
  });

  it('listDir() - ignorePattern', async () => {
    const target = join(tmpDir, 'test');

    const dir = await listDir(target, { ignorePattern: /\.js/ });
    dir.should.eql(['e.txt', join('folder', 'h.txt')]);
  });
});
