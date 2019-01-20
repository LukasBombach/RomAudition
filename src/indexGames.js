const readDirRec = require("recursive-readdir");
const Queue = require("p-queue");
const Store = require("./models/store");
const Game = require("./models/game");
const Progress = require("./models/progress");

let gamesProgress;

async function indexGames(dir) {
  const files = await getFiles(dir);
  const games = await getGames(dir, files);
  await writeGamesToDatabase(games);
  return games;
}

async function getFiles(dir) {
  const absPaths = await readDirRec(dir, [f => f.match(/\/\.[^\/]/)]);
  const paths = absPaths.map(absPath => absPath.slice(dir.length));
  return paths;
}

async function getGames(dir, files) {
  gamesProgress = new Progress(files.length);
  const queue = new Queue({ concurrency: 1 });
  const loadGames = files.map((file, i) => () => readGame(dir, file, i));
  const games = await queue.addAll(loadGames);
  return games;
}

async function readGame(dir, file, i) {
  await Game.fromDisk(dir, file);
  if (i % 100 === 0) logStatus(i);
}

function logStatus(i) {
  const max = gamesProgress.max;
  const percent = ((i / max) * 100).toFixed(2);
  const { took, remaining } = gamesProgress.lap(i);
  const remainingMinutes = (remaining / 60).toFixed(2);
  console.log(`${percent}% ${i} / ${max} (${took}s / ${remainingMinutes})`);
}

async function writeGamesToDatabase(games) {
  const collection = await Store.getCollection("games", "files");
  const bulk = collection.initializeOrderedBulkOp();
  games.forEach(game => addGameToBulk(bulk, game));
  await bulk.execute();
}

function addGameToBulk(bulk, $set) {
  const { dir, file } = $set;
  bulk
    .find({ dir, file })
    .upsert()
    .updateOne({ $set });
}

module.exports = indexGames;
