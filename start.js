const Headers = require("./src/models/sevenZip/headers");

(async () => {
  console.log("\x1Bc");
  const path = `${__dirname}/src/models/sevenZip/7ziptest/btchamp.7z`;
  const headers = await Headers.get(path);

  console.log(JSON.stringify(headers, null, 2));

  process.exit(0);
})();
