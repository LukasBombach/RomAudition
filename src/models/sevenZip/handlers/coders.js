const bitwise = require("bitwise");

module.exports = async function coders(file, numCoders) {
  const coders = [];

  for (let i = 0; i < numCoders; i++) {
    const info = await file.bits();
    const codecIdSize = bitwise.byte.write(new Array(4).fill(0).concat(info.slice(0, 4).reverse()));
    const isComplexCoder = !!info[4];
    const hasAttributes = !!info[5];
    const codecId = await file.byte(codecIdSize);
    if (isComplexCoder) {
      const numInStreams = file.uInt64();
      const numOutStreams = file.uInt64();
    }
    if (hasAttributes) {
      const propertiesSize = await file.uInt64();
      const properties = await file.byte(propertiesSize);
    }
    if (isComplexCoder) {
      throw new Error("Not implemented");
    }
    coders.push("Omitted information");
  }
  return coders;
};
