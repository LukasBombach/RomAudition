const readDirRec = require("recursive-readdir");

module.exports = async function() {
  const hrstart = process.hrtime();
  const absPaths = await readDirRec(baseDir, [f => f.match(/\/\.[^\/]/)]);
  const paths = absPaths.map(absPath => absPath.slice(baseDir.length));
  const time = process.hrtime(hrstart);
  const stats = { baseDir, paths, time };
  return [absPaths, stats];
};
