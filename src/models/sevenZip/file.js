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
      const hex = num.toString(16);
      return `0x${hex} (${num})`;
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
    const a = await this.byte(4);
    const b = await this.byte(4);
    return b + a;
  }

  async szUInt64(log) {
    let value = 0;
    let mask = 0x80;
    let nextByte;
    log && this.log("reading firstbyte", await this.readHexFromPos(5016019, 3));
    const firstByte = await this.byte();
    log && this.log("firstByte", File.formatHex(firstByte));
    for (let i = 0; i < 8; i++) {
      if (!(firstByte & mask)) {
        value += (firstByte & (mask - 1)) << (8 * i);
        log && this.log("break", File.formatHex(value));
        break;
      }
      nextByte = await this.byte();
      value = value | (nextByte << (8 * i));
      log && this.log("nextByte", File.formatHex(nextByte));
      mask = mask >> 1;
    }
    log && this.log("return", File.formatHex(value));
    return value;
  }

  async uInt64old(log) {
    log && this.log("--");

    const firstByte = await this.byte();
    const hasValue = firstByte & 128;

    if (!hasValue) {
      // this.log("direct value", File.formatHex(firstByte & 127));
      await this.fastForward(7);
      return firstByte & 127;
    }
    const num = this.numExtraBytes(firstByte, log) + 1;
    const val = await this.byte(num);

    const firstByteValue = this.firstByteValue(firstByte, log);

    const uint64Val = (val << (8 * (num - 1))) + firstByte;

    console.log("1", File.formatHex(firstByte));
    console.log("2", num, File.formatHex(val));
    console.log("3", File.formatHex(uint64Val));

    await this.fastForward(8 - num - 1);

    /* log && this.log("expected", await this.readHexFromPos(12, 3));
    const firstByteValue = this.firstByteValue(firstByte, log);
    const extraBytesValue = await this.byte(numExtraBytes + 1);

    const value = (extraBytesValue << 8) + firstByte;
    await this.fastForward(8 - numExtraBytes - 1);

    log && this.log("value          ", File.formatHex(value)); */

    /* const value = (extraBytesValue << 8) + firstByte;
    const realInt = (firstByteValue << (8 * numExtraBytes)) + extraBytesValue;
    const tryint = (extraBytesValue << 8) + value;

    await this.fastForward(8 - numExtraBytes - 1);

    log && this.log("numExtraBytes  ", File.formatHex(numExtraBytes));
    log && this.log("extraBytesValue", File.formatHex(extraBytesValue));
    log && this.log("value          ", File.formatHex(value));
    log && this.log("realInt        ", File.formatHex(realInt));
    log && this.log("tryint         ", File.formatHex(tryint));
    log && this.log("expected       ", await this.readHexFromPos(12, 3));
    */
    log && this.log("--");

    return uint64Val;

    /* const a = await this.byte(6);
    const b = await this.byte(1);

    console.log([a, b].map(File.formatHex));
    console.log(File.formatHex(((b + a) << 8) + firstByte));

    return ((b + a) << 8) + firstByte; */
  }

  numExtraBytes(byte, log) {
    const bits = bitwise.byte.read(byte);
    const zeroIndex = bits.indexOf(0);
    log && this.log("bits", bits);
    log && this.log("zeroIndex", zeroIndex);
    return zeroIndex;
  }

  firstByteValue(byte, log) {
    const bits = bitwise.byte.read(byte);
    const zeroIndex = bits.indexOf(0);
    const zeros = new Array(zeroIndex + 1).fill(0);
    const valueBits = [...zeros, ...bits.slice(zeroIndex + 1)];
    const value = bitwise.byte.write(valueBits);
    log && this.log("firstByte ", File.formatHex(byte), bits);
    log && this.log("firstValue", File.formatHex(value), valueBits);
    return value;
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

  async readHexFromPos(position, length) {
    const buffer = Buffer.alloc(length);
    await read(this.fd, buffer, 0, length, position);
    const num = buffer.readUIntLE(0, length);
    return File.formatHex(num);
  }
}

module.exports = File;
