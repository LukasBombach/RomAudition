const File = require("./file");
const packInfo = require("./handlers/packInfo");
const subStreamsInfo = require("./handlers/subStreamsInfo");
const unPackInfo = require("./handlers/unPackInfo");
const encodedHeader = require("./handlers/encodedHeader");

const kEnd = 0x00;
const kHeader = 0x01;
const kMainStreamsInfo = 0x04;
const kPackInfo = 0x06;
const kUnPackInfo = 0x07;
const kSubStreamsInfo = 0x08;
const kEncodedHeader = 0x17;

const handlers = {
  [kHeader.toString()]: readHeaders,
  [kMainStreamsInfo.toString()]: readHeaders,
  [kPackInfo.toString()]: packInfo,
  [kUnPackInfo.toString()]: unPackInfo,
  [kSubStreamsInfo.toString()]: subStreamsInfo,
  [kEncodedHeader.toString()]: encodedHeader
};

async function parseFile(path) {
  const file = await File.open(path);
  try {
    await readSignature(file);
    await jumpToHeaders(file);
    await readHeaders(file);
  } catch (err) {
    console.log("\n", err.stack, "\n");
  }
  return file.data;
}

async function readSignature(file) {
  file.data.signature = {
    signature: await file.hex(6),
    majorVersion: await file.int(),
    minorVersion: await file.int(),
    startHeaderCrc: await file.hex(4),
    nextHeaderOffset: await file.uInt64(true),
    nextHeaderSize: await file.uInt64(),
    nextHeaderCrc: await file.hex(4)
  };
}

async function jumpToHeaders(file) {
  await file.fastForward(file.data.signature.nextHeaderOffset);
}

async function readHeaders(file) {
  while (true) {
    file.log("Marker position");
    const marker = await file.int();
    const handler = handlers[marker.toString()];
    if (marker === kEnd) break;
    if (!handler) throw new Error(`No handler for ${File.formatHex(marker)}`);
    file.log("Header Marker", File.formatHex(marker), handler.name);
    await handler(file);
  }
}

module.exports = parseFile;
