const fs = require("fs");
const bitwise = require("bitwise");
const promisify = require("util").promisify;
const open = promisify(fs.open);
const read = promisify(fs.read);

class File {
  static async open(file) {
    const fd = await open(file, "r");
    return new File(fd);
  }

  constructor(fd, position = 0) {
    this.fd = fd;
    this.position = position;
  }

  seek(position) {
    this.position = position;
    return this;
  }

  async byte(len = 1) {
    const buffer = await this.readBytes(len);
    return buffer.readUIntLE(0, len);
  }

  async bits() {
    const byte = await this.byte();
    return bitwise.byte.read(byte).reverse();
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
    const firstByte = await this.byte();
    const hasValue = firstByte & 128;
    if (!hasValue) return firstByte & 127;
    const numExtraBytes = this.numExtraBytes(firstByte);
    const extraBytesValue = await this.byte(numExtraBytes);
    const firstByteValue = this.firstByteValue(firstByte);
    return (firstByteValue << (8 * numExtraBytes)) + extraBytesValue;
  }

  numExtraBytes(byte) {
    const bits = bitwise.byte.read(byte);
    const zeroIndex = bits.indexOf(0);
    return zeroIndex > -1 ? zeroIndex : 8;
  }

  firstByteValue(byte) {
    const bits = bitwise.byte.read(byte);
    const zeroIndex = bits.indexOf(0);
    const zeros = new Array(zeroIndex).fill(0);
    const ones = new Array(8 - zeroIndex).fill(1);
    const maskBits = [...zeros, ...ones];
    const maskByte = bitwise.byte.write(maskBits);
    return byte & maskByte;
  }

  async readBytes(length) {
    const buffer = Buffer.alloc(length);
    await read(this.fd, buffer, 0, length, this.position);
    this.position += length;
    return buffer;
  }
}

module.exports = File;
