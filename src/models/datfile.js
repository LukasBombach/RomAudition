const { parse } = require("path");
const fs = require("fs").promises;
const promisify = require("util").promisify;
const xml2js = require("xml2js");
const _ = require("lodash");
const parseString = promisify(xml2js.parseString);

class DatFile {
  static async get(filePath) {
    const xml = await fs.readFile(filePath);
    const json = await parseString(xml);
    return DatFile.formatDatJson(json);
  }

  static formatDatJson(json) {
    return json.datafile.game.map(game => DatFile.formatGame(game));
  }

  static formatGame(game) {
    const name = game.$.name;
    const roms = game.rom.map(rom => DatFile.formatRom(rom));
    const normalizedRoms = DatFile.normalizeRoms(roms);
    return { name, roms: normalizedRoms };
  }

  static formatRom(rom) {
    const name = rom.$.name;
    const size = parseInt(rom.$.size, 10);
    const crc = rom.$.crc;
    const merge = rom.$.merge;
    const status = rom.$.status;
    return { name, crc, size, merge, status };
  }

  static normalizeRoms(roms) {
    const romsWithCrc = roms.filter(({ crc }) => typeof crc !== "undefined");
    const romsWithoutMerge = romsWithCrc.filter(
      ({ merge }) => typeof merge === "undefined"
    );
    const extendedRoms = romsWithoutMerge.map(rom =>
      DatFile.addFieldsToRom(rom)
    );
    return DatFile.formatRoms(extendedRoms);
  }

  static addFieldsToRom({ name, crc, size }) {
    const extension = parse(name).ext.substr(1);
    const basename = parse(name).name;
    return { name, extension, basename, crc, size };
  }

  static formatRoms(roms) {
    const sortedEntries = _.sortBy(roms, ["name"]);
    const formattedEntries = sortedEntries.map(entry =>
      DatFile.formatEntry(entry)
    );
    const orderedEntries = formattedEntries.map(entry =>
      DatFile.ensureOrder(entry)
    );
    return orderedEntries;
  }

  static formatEntry(entry) {
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

  static ensureOrder({ name, extension, basename, crc, size }) {
    return { name, extension, basename, crc, size };
  }
}

module.exports = DatFile;
