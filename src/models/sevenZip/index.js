const File = require("./file");
const packInfo = require("./handlers/packInfo");
const subStreamsInfo = require("./handlers/subStreamsInfo");
const unPackInfo = require("./handlers/unPackInfo");

const kEnd = 0x00;
const kMainStreamsInfo = 0x04;
const kPackInfo = 0x06;
const kUnPackInfo = 0x07;
const kSubStreamsInfo = 0x08;

const handlers = {
  [kMainStreamsInfo.toString()]: readHeaders,
  [kPackInfo.toString()]: packInfo,
  [kUnPackInfo.toString()]: unPackInfo,
  [kSubStreamsInfo.toString()]: subStreamsInfo
};

module.exports = async path => {
  const file = await File.open(path);
  await jumpToHeaders(file);
  await readHeaders(file);
  return file.data;
};

async function jumpToHeaders(file) {
  await file.seek(12);
  const nextHeaderOffset = await file.uInt64();
  const headerPosition = 32 + 1 + nextHeaderOffset;
  await file.seek(headerPosition);
}

async function readHeaders(file) {
  while (true) {
    const marker = await file.int();
    const handler = handlers[marker.toString()];
    if (marker === kEnd) break;
    if (!handler) throw new Error(`No handler for ${marker}`);
    await handler(file);
  }
}
