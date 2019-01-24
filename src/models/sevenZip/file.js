const fs = require("fs");
const promisify = require("util").promisify;
const Header = require("./header");
const open = promisify(fs.open);
const read = promisify(fs.read);

class File {
  static async open(file) {
    const fd = await open(file, "r");
    return new File(fd);
  }

  constructor(fd) {
    this.fd = fd;
  }

  async uInt64(begin, end) {
    const buffer = await this.readBytes(begin, end);
    const byteAsNum = buffer.readUIntLE(0, 1);
    const hasValue = byteAsNum & 128;
    if (hasValue) throw new Error("uhm, not implemented");
    return byteAsNum & 127;
  }

  async hex(begin, end) {
    if (!end) end = begin;
    const buffer = await this.readBytes(begin, end);
    return buffer.toString("hex");
  }

  async readBytes(begin, end) {
    const numBytes = end + 1 - begin;
    const buffer = Buffer.alloc(numBytes);
    await read(this.fd, buffer, 0, numBytes, begin);
    return buffer;
  }

  expect(val, expectedVal, errorMessage) {
    if (val !== expectedVal) throw new Error(errorMessage);
  }
}

module.exports = File;
