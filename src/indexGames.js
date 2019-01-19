const readDirRec = require("recursive-readdir");
const Queue = require("p-queue");
const Store = require("./models/store");
const Game = require("./models/game");

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
  const queue = new Queue({ concurrency: 1 });
  const loadGames = files.map(file => () => Game.fromDisk(dir, file));
  const games = await queue.addAll(loadGames);
  return games;
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
