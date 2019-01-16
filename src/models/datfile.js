const fs = require("fs").promises;
const promisify = require("util").promisify;
const xml2js = require("xml2js");
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
    return { name, roms };
  }

  static formatRom(rom) {
    const name = rom.$.name;
    const size = parseInt(rom.$.size, 10);
    const crc = rom.$.crc;
    return { name, crc, size };
  }
}

module.exports = DatFile;
