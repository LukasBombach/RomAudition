const { parse } = require("path");
const _ = require("lodash");
const getEntriesFromZip = require("../util/getEntriesFromZip");
const getEntriesFrom7Zip = require("../util/getEntriesFrom7Zip");

const getRomsHandlers = {
  zip: getEntriesFromZip,
  "7z": getEntriesFrom7Zip,
  default: () => undefined
};

class Game {
  static async fromDisk(dir, file) {
    const path = dir + file;
    const name = parse(path).name;
    const extension = parse(path).ext.substr(1);
    const roms = await Game.getRoms(path, extension);
    const crcs = Game.getCrcFingerprint(roms);
    return { name, extension, roms, crcs, dir, file };
  }

  static async getRoms(path, extension) {
    const handler = getRomsHandlers[extension] || getRomsHandlers.default;
    const entries = await handler(path);
    const roms = entries.map(entry => Game.getRom(entry));
    const sortedRoms = _.sortBy(roms, "name");
    return sortedRoms;
  }

  static getRom(entry) {
    const name = entry.name.toString();
    const extension = entry.extension.toString();
    const crc = entry.crc.toString().padStart(8, "0");
    const size = parseInt(entry.size);
    return { name, extension, crc, size };
  }

  static getCrcFingerprint(roms) {
    return roms
      .map(({ crc }) => crc)
      .sort()
      .join(",");
  }
}

module.exports = Game;
