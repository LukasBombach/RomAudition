const { parse } = require("path");
const fs = require("fs").promises;
const promisify = require("util").promisify;
const xml2js = require("xml2js");
const parseString = promisify(xml2js.parseString);

class DatFile {
  static async get(filePath) {
    const xml = await fs.readFile(filePath);
    const json = await parseString(xml);
    const games = json.datafile.game.map(game => DatFile.getGame(game));
    return games;
  }

  static getGame(game) {
    const name = game.$.name;
    const roms = DatFile.getRoms(game);
    const crcs = DatFile.getCrcFingerprint(roms);
    return { name, roms, crcs };
  }

  static getRoms(game) {
    const roms = game.rom.filter(rom => !!rom.$.crc);
    return roms.map(rom => DatFile.getRom(rom));
  }

  static getRom(rom) {
    const name = parse(rom.$.name).name;
    const extension = parse(rom.$.name).ext.substr(1);
    const crc = rom.$.crc.toString().padStart(8, "0");
    const size = parseInt(rom.$.size, 10);
    return { name, extension, crc, size };
  }

  static getCrcFingerprint(roms) {
    return roms
      .map(({ crc }) => crc)
      .sort()
      .join(",");
  }
}

module.exports = DatFile;
