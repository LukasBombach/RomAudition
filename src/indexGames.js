const readDirRec = require("recursive-readdir");
const Queue = require("p-queue");
const Game = require("./models/game");

async function indexGames(dir) {
  const files = await getFiles(dir);
  const games = await getGames(dir, files);
  // write games to datase (with each game)
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

module.exports = indexGames;
