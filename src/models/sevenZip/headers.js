const bitwise = require("bitwise");
const File = require("./file");

const kEnd = 0x00;
const kMainStreamsInfo = 0x04;
const kPackInfo = 0x06;
const kUnPackInfo = 0x07;

const handlers = {
  [kMainStreamsInfo.toString()]: "mainStreamsInfo",
  [kPackInfo.toString()]: "packInfo",
  [kUnPackInfo.toString()]: "unPackInfo"
};

class Headers {
  static async get(path) {
    const file = await File.open(path);
    const headerPosition = await Headers.getHeaderPosition(file);
    await file.seek(headerPosition);
    return await Headers.readHeaders(file);
  }

  static async getHeaderPosition(file) {
    await file.seek(12);
    const nextHeaderOffset = await file.uInt64();
    return 32 + 1 + nextHeaderOffset;
  }

  static async readHeaders(file) {
    const marker = await file.int();
    const handler = handlers[marker.toString()];
    if (marker === kEnd) return [];
    if (!handler) return `No handler for ${marker}`; // throw new Error(`No handler for ${marker}`);
    const header = await Headers[handler](file);
    return [header, ...(await Headers.readHeaders(file))];
  }

  static async mainStreamsInfo(file) {
    return await Headers.readHeaders(file);
  }

  static async packInfo(file) {
    return {
      packPos: await file.uInt64(),
      numPackStreams: await file.uInt64(),
      sizeMarker: await file.byte(), // or kCRC
      packSize: await file.uInt64(),
      endMarker: await file.byte()
    };
  }

  static async unPackInfo(file) {
    const folderMarker = await file.byte(); // ok
    const numFolders = await file.uInt64(); // ok
    const isExternal = await file.byte(); // ok
    if (isExternal !== 0) throw new Error("Not implemented");
    const folders = await Headers.folders(file, numFolders); // invalidated
    const unpacksizeMarker = await file.byte(); // ok

    return {};
  }

  static async folders(file, numFolders) {
    for (let i = 0; i < numFolders; i++) {
      const numCoders = await file.uInt64(); // ok
      const coders = await Headers.coders(file, numCoders);
    }
  }

  static async coders(file, numCoders) {
    for (let i = 0; i < numCoders; i++) {
      const info = await file.bits();
      const codecIdSize = bitwise.byte.write(new Array(4).fill(0).concat(info.slice(0, 3)));
      const isComplexCoder = !!info[4];
      const hasAttributes = !!info[5];
      const codecId = await file.byte(codecIdSize);
      if (isComplexCoder) {
        const numInStreams = file.uInt64();
        const numOutStreams = file.uInt64();
      }
      if (hasAttributes) {
        const propertiesSize = file.uInt64();
        const properties = await file.byte(propertiesSize);
      }
      if (isComplexCoder) {
        throw new Error("Not implemented");
      }
    }
    return "omitted information";
  }
}

module.exports = Headers;
