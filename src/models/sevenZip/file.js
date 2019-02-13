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

  static formatHex(num) {
    try {
      const hexDigits = Math.floor(16 / num) + 1;
      const pad = hexDigits * 2;
      const hex = num.toString(16).padStart(pad, "0");
      return `0x${hex} (${num})"`;
    } catch (err) {
      return "err " + num;
    }
  }

  constructor(fd, position = 0) {
    this.fd = fd;
    this.position = position;
    this.data = {};
  }

  seek(position) {
    this.position = position;
    return this;
  }

  fastForward(offset) {
    this.position += offset;
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

  async bool() {
    const int = await this.int();
    return !!int;
  }

  async hex(len = 1) {
    const buffer = await this.readBytes(len);
    return buffer
      .toString("hex")
      .padStart(len * 2, "0")
      .match(/.{2}/g)
      .reverse()
      .join("");
  }

  async uInt64(log) {
    const firstByte = await this.byte();
    const hasValue = firstByte & 128;
    if (!hasValue) {
      await this.fastForward(7);
      return firstByte & 127;
    }
    const numExtraBytes = this.numExtraBytes(firstByte);
    const extraBytesValue = await this.byte(numExtraBytes);
    const value = (extraBytesValue << 8) + firstByte;
    await this.fastForward(8 - numExtraBytes - 1);
    return value;
  }

  numExtraBytes(byte) {
    const bits = bitwise.byte.read(byte).reverse();
    const zeroIndex = bits.indexOf(0);
    return zeroIndex > -1 ? zeroIndex + 1 : 8;
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

  log(...args) {
    console.log(this.position, ...args);
  }
}

module.exports = File;
