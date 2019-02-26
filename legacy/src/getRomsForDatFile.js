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
  const collection = await Store.getCollection("games", "files");
  const name = { $in: games.map(({ name }) => name) };
  const crcs = { $in: games.map(({ crcs }) => crcs) };
  const query = { name, crcs };
  const results = await (await collection.find(query)).toArray();
  const available = _.sortBy(_.uniqBy(results, ({ name }) => name), "name");
  return available;
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
