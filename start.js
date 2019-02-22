const readDirRec = require("recursive-readdir");
const lsar = require("lsar-native");
const pretty = require("pretty-hrtime");
const chalk = require("chalk");

async function indexFolder(path) {
  const { baseDir, paths, numGames, time } = await listGames(path);
  const logInterval = Math.floor(numGames / 100);
  const hrstart = process.hrtime();
  console.log(chalk.dim(pretty(time)), `Found ${numGames} games`);
  for (let i = 0; i < numGames; i++) {
    lsar(`${baseDir}/${paths[i]}`);
    if (i % logInterval === 0) {
      const time = process.hrtime(hrstart);
      const percent = ((i / numGames) * 100).toFixed(2);
      console.log(chalk.dim(pretty(time)), `${percent}%`, `Game ${i} of ${numGames}`);
    }
  }
  console.log(`Actually done in ${pretty(time)}`);
}

async function listGames(baseDir) {
  const hrstart = process.hrtime();
  const absPaths = await readDirRec(baseDir, [f => f.match(/\/\.[^\/]/)]);
  const paths = absPaths.map(absPath => absPath.slice(baseDir.length));
  const numGames = paths.length;
  const time = process.hrtime(hrstart);
  return { baseDir, paths, numGames, time };
}

(async () => {
  await indexFolder("/Users/lbombach/Downloads/Retro/MAME/Mame32");
})();
