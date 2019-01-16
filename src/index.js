const path = require("path");
const getRomsForDatFile = require("./getRomsForDatFile");

(async () => {
  const datFile = `${__dirname}/../datfiles/pandora_gngeo_084_filtered.dat`;
  const { stats, available, missing } = await getRomsForDatFile(datFile);
  console.log(JSON.stringify(stats, null, 2));
})();
