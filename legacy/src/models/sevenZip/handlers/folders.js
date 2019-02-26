const codersHandler = require("./coders");

module.exports = async function folders(file, numFolders) {
  const folders = [];
  for (let i = 0; i < numFolders; i++) {
    const numCoders = await file.szUInt64(); // ok
    const coders = await codersHandler(file, numCoders);
    folders.push({ numCoders, coders });
  }
  return folders;
};
