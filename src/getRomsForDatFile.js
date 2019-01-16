const { parse } = require("path");
const _ = require("lodash");
const DatFile = require("./models/datfile");
const Store = require("./models/store");

async function getRomsForDatFile(filePath) {
  const games = await DatFile.get(filePath);
  const available = getGamesMatchingDatFile(games);
  const missing = games.filter(game => isIn(game, available));
  const stats = getStats(games, available, missing);
  return { stats, available, missing };
}

async function getGamesMatchingDatFile(games) {
  const collection = await Store.getCollection("roms", "files");
  const query = getMongoQueryForDatFile(games);
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
  const extendedRoms = roms.map(addFieldsToRom);
  return sortRoms(extendedRoms);
}

function addFieldsToRom({ name, crc, size }) {
  const extension = parse(name).ext.substr(1);
  const basename = parse(name).name;
  return { name, extension, basename, crc, size };
}

function sortRoms(entries) {
  const sortedEntries = File.sortEntries(entries);
  const formattedEntries = sortedEntries.map(entry => File.formatEntry(entry));
  const orderedEntries = formattedEntries.map(entry => File.ensureOrder(entry));
  return orderedEntries;
}

function isIn(game, available) {
  return !available.find(f => f.basename === game.name);
}

function getStats(games, available, missing) {
  const total = games.length;
  const available = available.length;
  const missing = missing.length;
  return { total, available, missing };
}
