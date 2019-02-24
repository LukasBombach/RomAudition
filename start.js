const readDirRec = require("recursive-readdir");
const lsar = require("lsar-native");
const pretty = require("pretty-hrtime");
const chalk = require("chalk");
const _ = require("lodash");
const Store = require("./src/models/store");

const includeFiles = "(*.zip|*.7z)";

async function indexFolder(path) {
  const hrstart = process.hrtime();
  const collection = await Store.getCollection("rom-audition", "files");
  const { baseDir, paths, numGames, time } = await listGames(path);
  const chunksSize = Math.floor(numGames / 100);
  const gameChunks = _.chunk(paths, chunksSize);
  const numChunks = gameChunks.length;
  const logInterval = Math.floor(numChunks / 100);
  console.log(chalk.dim(pretty(time)), `Found ${numGames} games. Processing in ${numChunks} chunks with sizes of ${chunksSize}.`);
  for (let i = 0; i < numChunks; i++) {
    const chunkStart = process.hrtime();
    const games = getGames(baseDir, gameChunks[i]);
    await batchUpsertDatabase(collection, games);
    if (i % logInterval === 0) {
      const time = process.hrtime(hrstart);
      const chunkTime = process.hrtime(chunkStart);
      const percent = ((i / numChunks) * 100).toFixed(1);
      console.log(chalk.dim(`${pretty(chunkTime)} (${pretty(time)})`), `${percent}%`, `Chunk ${i} of ${numChunks}`);
    }
  }
  await Store.disconnect();
  const end = process.hrtime(hrstart);
  console.log(`✨  Processed in ${pretty(end)} (${numGames} games)`);
}

async function listGames(baseDir) {
  const hrstart = process.hrtime();
  const absPaths = await readDirRec(baseDir, [includeFiles]);
  const paths = absPaths.map(absPath => absPath.slice(baseDir.length));
  const numGames = paths.length;
  const time = process.hrtime(hrstart);
  return { baseDir, paths, numGames, time };
}

function getGames(baseDir, paths) {
  return paths.map(path => getGame(baseDir, path));
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

async function batchUpsertDatabase(collection, games) {
  const bulk = collection.initializeOrderedBulkOp();
  games.forEach(game => bulk.insert(game));
  await bulk.execute();
}

(async () => {
  await indexFolder("/Users/lbombach/Downloads/Retro/MAME/MAME_0188u0_Complete_Romset");
})();
