const { parse } = require("path");
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
  const query = await getMongoQueryForDatFile(games);
  const findings = await (await collection.find(query)).toArray();
  const uniqueFindings = _.uniqBy(findings, ({ name }) => name);
  const sortedFindings = _.sortBy(uniqueFindings, ["name"]);
  return sortedFindings;
}

async function getMongoQueryForDatFile(games) {
  const basename = { $in: games.map(({ name }) => name) };
  const entries = { $in: games.map(({ roms }) => normalizeRoms(roms)) };
  return { basename, entries };
}

function normalizeRoms(roms) {
  const filteredRoms = roms.filter(({ crc }) => typeof crc !== "undefined");
  const extendedRoms = filteredRoms.map(addFieldsToRom);
  return formatRoms(extendedRoms);
}

function addFieldsToRom({ name, crc, size }) {
  const extension = parse(name).ext.substr(1);
  const basename = parse(name).name;
  return { name, extension, basename, crc, size };
}

function formatRoms(roms) {
  const sortedEntries = _.sortBy(roms, ["name"]);
  const formattedEntries = sortedEntries.map(entry => formatEntry(entry));
  const orderedEntries = formattedEntries.map(entry => ensureOrder(entry));
  return orderedEntries;
}

function formatEntry(entry) {
  try {
    const name = entry.name.toString();
    const extension = entry.extension.toString();
    const basename = entry.basename.toString();
    const crc = entry.crc.toString().padStart(8, "0");
    const size = parseInt(entry.size);
    return { name, extension, basename, crc, size };
  } catch (err) {
    console.log(err);
  }
}

function ensureOrder({ name, extension, basename, crc, size }) {
  return { name, extension, basename, crc, size };
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
