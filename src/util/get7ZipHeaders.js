const fs = require("fs");
const promisify = require("util").promisify;
const getEntriesFrom7Zip = require("./getEntriesFrom7Zip");
const open = promisify(fs.open);
const read = promisify(fs.read);

module.exports = async () => {
  const file = "/Users/lbombach/Desktop/7ziptest/btchamp.7z";
  const entries = await getEntriesFrom7Zip(file);
  const fd = await open(file, "r");

  console.log("Signature     ", (await str(fd, 0, 1)) + (await crc(fd, 2, 5)));
  console.log("Version       ", await version(fd));
  console.log("startHeaderCRC", await crc(fd, 8, 11));

  const nextHeaderOffset = await uIint64(fd, 12, 12);
  const nextHeaderSize = await uIint64(fd, 13, 13);
  const nextHeaderCRC = await crc(fd, 14, 17);

  console.log(JSON.stringify(entries, null, 2));
};

async function readBytes(fd, begin, end) {
  const bytes = end + 1 - begin;
  const buffer = Buffer.alloc(bytes);
  await read(fd, buffer, 0, bytes, begin);
  return buffer;
}

async function str(fd, begin, end) {
  const buffer = await readBytes(fd, begin, end);
  return buffer.toString("utf8");
}

async function crc(fd, begin, end) {
  const buffer = await readBytes(fd, begin, end);
  return buffer.toString("hex").toUpperCase();
}

async function uIint64(fd, begin, end) {
  const buffer = await readBytes(fd, begin, end);
  const byteAsNum = buffer.readUIntLE(0, 1);
  const hasValue = byteAsNum & 128;
  return !hasValue ? byteAsNum & 127 : "uhm, not implemented";
}

async function version(fd) {
  const buffer = await readBytes(fd, 6, 6);
  const buffer2 = await readBytes(fd, 7, 7);
  return buffer.readUIntBE().toString() + buffer2.readUIntBE().toString();
}

async function startHeader(fd) {}
