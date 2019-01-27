const File = require("./file");
const packInfo = require("./handlers/packInfo");
const subStreamsInfo = require("./handlers/subStreamsInfo");
const unPackInfo = require("./handlers/unPackInfo");

const kEnd = 0x00;
const kMainStreamsInfo = 0x04;
const kPackInfo = 0x06;
const kUnPackInfo = 0x07;
const kSubStreamsInfo = 0x08;

class Headers {
  static async get(path) {
    const file = await File.open(path);
    const headerPosition = await Headers.getHeaderPosition(file);
    console.log(headerPosition, "headerPosition");
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
    if (!handler) return [`No handler for ${marker}. Stopping.`];
    console.log(marker, handler.name);
    const header = await handler(file);
    return [header, ...(await Headers.readHeaders(file))];
  }

  static async mainStreamsInfo(file) {
    return await Headers.readHeaders(file);
  }
}

const handlers = {
  [kMainStreamsInfo.toString()]: Headers.readHeaders,
  [kPackInfo.toString()]: packInfo,
  [kUnPackInfo.toString()]: unPackInfo,
  [kSubStreamsInfo.toString()]: subStreamsInfo
};

module.exports = Headers;
