const fs = require("fs-ext");
const bitwise = require("bitwise");
const promisify = require("util").promisify;
const open = promisify(fs.open);
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

  async byte(len = 1) {
    const buffer = await this.readBytes(len);
    return buffer.readUIntLE(0, len);
  }

  async bits() {
    const byte = await this.byte();
    return bitwise.byte.read(byte);
  }

  async int() {
    const buffer = await this.readBytes(1);
    return buffer.readUIntLE(0, 1);
  }

  async hex() {
    const buffer = await this.readBytes(1);
    return buffer.toString("hex");
  }

  async uInt64() {
    const buffer = await this.readBytes(1);
    const byteAsNum = buffer.readUIntLE(0, 1);
    const hasValue = byteAsNum & 128;
    if (hasValue) throw new Error("uhm, not implemented");
    return byteAsNum & 127;
  }

  async readBytes(length) {
    const buffer = Buffer.alloc(length);
    await fs.read(this.fd, buffer, 0, length);
    return buffer;
  }
}

module.exports = File;
