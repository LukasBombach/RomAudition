const fs = require("fs");
const File = require("./file");
const promisify = require("util").promisify;
const read = promisify(fs.read);
const PackInfo = require("./packInfo");

const kEnd = 0x00;
const kHeader = 0x01;
const kMainStreamsInfo = 0x04;
const kFilesInfo = 0x05;
const kPackInfo = 0x06;
const kUnPackInfo = 0x07;
const kSubStreamsInfo = 0x08;

const handlers = {
  [kPackInfo.toString("hex")]: "packInfo"
};

class Headers {
  static async get(path) {
    const file = File.open(path);
    const headerPosition = Headers.getHeaderPosition(file);
    await file.seek(headerPosition);
    return await Headers.readHeaders(file);
  }

  static async getHeaderPosition(file) {
    const nextHeaderOffset = await file.uInt64(12, 19);
    return 32 + nextHeaderOffset;
  }

  static async readHeaders(file) {
    const marker = await file.hex();
    const handler = handlers[marker];
    if (marker === kEnd.toString("hex")) return [];
    if (!handler) return `No handler for ${marker}`; // throw new Error(`No handler for ${marker}`);
    const header = await Headers[handler](file);
    return [header, ...(await Headers.readHeaders(file))];
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
}

module.exports = Headers;
