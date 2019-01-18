const _ = require("lodash");
const DatFile = require("./models/datfile");
const Store = require("./models/store");

async function getRomsForDatFile(filePath) {
  const games = await DatFile.get(filePath);
  const available = await getGamesMatchingDatFile(games);
  const missing = games.filter(game => isIn(game, available));
  const stats = getStats(games, available, missing);
  return { stats, available, missing };
}

async function getGamesMatchingDatFile(games) {
  const collection = await Store.getCollection("roms", "files");
  const queries = games.map(getMongoQueryForDatFile);
  const results = await Promise.all(queries.map(q => collection.findOne(q)));
  const findings = results.filter(g => g !== null);
  const sortedFindings = _.sortBy(findings, ["name"]);
  return sortedFindings;
}

function getMongoQueryForDatFile(game) {
  const basename = game.name;
  const $all = game.roms.map(({ crc }) => ({ $elemMatch: { crc } }));
  const entries = { $all };
  return { basename, entries };
}

function isIn(game, available) {
  return !available.find(f => f.basename === game.name);
}

function getStats(games, availableGames, missingGames) {
  const total = games.length;
  const available = availableGames.length;
  const missing = missingGames.length;
  return { total, available, missing };
}

module.exports = getRomsForDatFile;
