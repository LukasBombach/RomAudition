const fs = require("fs");
const promisify = require("util").promisify;
const File = require("./file");
const Header = require("./header");

class SevenZip {
  static async fromFile(file) {
    const file = File.open(file);
    return new SevenZip(file);
  }

  constructor(file) {
    this.file = file;
  }

  /* async getEntries() {
    const files = await this.getFileNames();
    const crcs = await this.getCrcs();
    if (files.length !== crcs.length) throw Error("Lengths did not match");
    return files.map((file, i) => ({ ...file, crc: crcs[i] }));
  } */

  async getCrcs() {
    const nextHeaderOffset = await this.file.uInt64(12, 19);
    const nextHeaderPos = 32 + nextHeaderOffset;
    const nextHeader = await Header.fromPosition(this.file, nextHeaderPos);
    return await nextHeader.getCrcs();
  }
}

module.exports = SevenZip;
