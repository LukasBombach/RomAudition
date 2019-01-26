const fs = require("fs-ext");
const promisify = require("util").promisify;
const open = promisify(fs.open);
const read = promisify(fs.read);
const seek = promisify(fs.seek);

class File {
  static async open(file) {
    const fd = await open(file, "r");
    return new File(fd);
  }

  constructor(fd) {
    this.fd = fd;
  }

  async seek(position) {
    return await seek(this.fd, position, 0);
  }

  async byte(position) {
    const buffer = await this.readBytes(position, position + 1);
    return buffer.readUIntLE(0, 1);
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

  async expectByte(position, expectedValue, name) {
    const value = await this.byte(position);
    if (value !== expectedValue) {
      throw new Error(`Expected ${name} (0x${expectedValue.toString("hex")}) at position ${position} but got 0x${value.toString("hex")}`);
    }
  }
}

module.exports = File;
