const parseFile = require("./src/models/sevenZip");

class File {
  constructor(num) {
    this.num = num;
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
}

(async () => {
  console.log("\x1Bc");
  // const path = `${__dirname}/src/models/sevenZip/7ziptest/btchamp.7z`;
  const path = "/Users/lbombach/Downloads/Retro/MAME/MAME_0188u0_Complete_Romset/roms/2mindril.7z";
  console.time("Execution Time");
  const data = await parseFile(path);
  console.timeEnd("Execution Time");
  console.log("\n", JSON.stringify(data, null, 2), "\n");

  /* const nextHeaderOffset = 0x00000000004c89b1;

  console.log(nextHeaderOffset); */

  process.exit(0);
})();
