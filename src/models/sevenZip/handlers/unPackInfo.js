const foldersHandler = require("./folders");

const kEnd = 0x00;

module.exports = async function unPackInfo(file) {
  const folderMarker = await file.byte(); // ok
  const numFolders = await file.uInt64(); // ok
  const isExternal = await file.byte(); // ok
  if (isExternal !== 0) throw new Error("Not implemented");
  const folders = await foldersHandler(file, numFolders); // invalidated
  const unpacksizeMarker = await file.byte(); // ok
  for (let i = 0; i < folders.length; i++) {
    for (let j = 0; j < folders[i].coders.length; j++) {
      try {
        await file.uInt64(); // omitted UnPackSize
      } catch (err) {
        console.log(err.message);
      }
    }
  }
  const endMarker = await file.byte(); // ok
  if (endMarker !== kEnd) throw new Error("Not implemented");
  return {};
};
