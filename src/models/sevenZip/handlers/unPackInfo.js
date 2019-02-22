const foldersHandler = require("./folders");

const kEnd = 0x00;
const kCRC = 0x0a;
const kCodersUnPackSize = 0x0c;

module.exports = async function unPackInfo(file) {
  const folderMarker = await file.byte(); // ok
  const numFolders = await file.szUInt64(); // ok
  const isExternal = await file.byte(); // ok
  if (isExternal !== 0) throw new Error("Not implemented");
  const folders = await foldersHandler(file, numFolders); // invalidated
  const unpacksizeMarker = await file.byte(); // ok
  if (unpacksizeMarker !== kCodersUnPackSize) throw new Error("Expected unpacksize Marker");
  const unpackSize = [];
  for (let i = 0; i < folders.length; i++) {
    const unpackSizeEntry = [];
    for (let j = 0; j < folders[i].coders.length; j++) {
      //try {
      const size = await file.szUInt64(); // omitted UnPackSize
      unpackSizeEntry.push(size);
      // } catch (err) {
      //   console.log(err.message);
      // }
    }
    unpackSize.push(unpackSizeEntry);
  }

  file.data.unPackInfo = {
    numFolders,
    isExternal,
    folders,
    unpackSize
  };

  const nextMarker = await file.byte();

  if (nextMarker === kCRC) {
    await digests(file, numFolders);
    const endMarker = await file.byte(); // ok
    if (nextMarker !== kEnd) throw new Error("Expected end marker");
    return;
  } else if (nextMarker === kEnd) {
    return;
  }

  throw new Error("Code should have been terminated before");
};

async function digests(file, num) {
  file.data.unPackInfo.crcs = [];
  for (let i = 0; i < num; i++) {
    const allAreDefined = await file.bool();
    if (!allAreDefined) throw new Error("Not Implemented");
    const crc = await file.hex(4);
    file.data.unPackInfo.crcs.push(crc);
  }
}
