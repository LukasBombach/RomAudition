const readDirRec = require("recursive-readdir");
const lsar = require("lsar-native");
const pretty = require("pretty-hrtime");
const chalk = require("chalk");
const Store = require("./src/models/store");

async function indexFolder(path) {
  const collection = await Store.getCollection("files", "files");
  const { baseDir, paths, numGames, time } = await listGames(path);
  const logInterval = Math.floor(numGames / 100);
  const hrstart = process.hrtime();
  console.log(chalk.dim(pretty(time)), `Found ${numGames} games`);
  for (let i = 0; i < numGames; i++) {
    const game = getGame(baseDir, paths[i]);
    const filter = { baseDir, path: game.path };
    await collection.updateOne(filter, { $set: game }, { upsert: true });
    if (i % logInterval === 0) {
      const time = process.hrtime(hrstart);
      const percent = ((i / numGames) * 100).toFixed(2);
      console.log(chalk.dim(pretty(time)), `${percent}%`, `Game ${i} of ${numGames}`);
    }
  }
  await Store.disconnect();
  console.log(`✨  Actually done in ${pretty(time)} (${numGames} games)`);
}

async function listGames(baseDir) {
  const hrstart = process.hrtime();
  const absPaths = await readDirRec(baseDir, [f => f.match(/\/\.[^\/]/)]);
  const paths = absPaths.map(absPath => absPath.slice(baseDir.length));
  const numGames = paths.length;
  const time = process.hrtime(hrstart);
  return { baseDir, paths, numGames, time };
}

function getGame(baseDir, path) {
  const info = lsar(`${baseDir}/${path}`);
  const roms = info.map(({ XADFileName: name, "7zCRC32": crcInt, XADFileSize: size }) => ({ name, crc: crcInt.toString(16), size }));
  const name = path.substring(path.lastIndexOf("/") + 1);
  const crcSignature = roms
    .map(({ crc }) => crc)
    .sort()
    .join(",");
  return { name, baseDir, path, crcSignature, roms };
}

(async () => {
  await indexFolder("/Users/lbombach/Downloads/Retro/MAME/Mame32");
})();
