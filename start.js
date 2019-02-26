const indexFolder = require("./src/indexFolder");

(async () => {
  await Store.setupDatabase();
  await indexFolder("/Users/lbombach/Downloads/Retro/MAME");
})();
