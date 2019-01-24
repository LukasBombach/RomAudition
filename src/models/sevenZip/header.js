const fs = require("fs");
const promisify = require("util").promisify;
const read = promisify(fs.read);

const kHeader = 0x01;
const kMainStreamsInfo = 0x04;
const kFilesInfo = 0x05;

class Header {
  static async fromPosition(file, startPos) {
    const value = await file.hex(startPos);
    const errorMessage = "Did not find a header marker at next header position";
    file.expect(value, "01", errorMessage);
    return new Header(file, startPos);
  }

  constructor(file, startPos) {
    this.file = file;
    this.startPos = startPos;
  }

  async getCrcs() {}
}

module.exports = Header;
