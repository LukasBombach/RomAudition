const path = require("path");
const getRomsForDatFile = require("./getRomsForDatFile");
const indexGames = require("./indexGames");

(async () => {
  /* let datFile;
  datFile = `${__dirname}/../datfiles/pandora_gngeo_084_filtered.dat`;
  datFile = `${__dirname}/../datfiles/FB Alpha (ClrMame Pro XML, Neogeo only).dat`;
  datFile = `${__dirname}/../datfiles/FB Alpha (ClrMame Pro XML, Arcade only).dat`;
  // const datFile = `${__dirname}/../datfiles/FB Alpha v0.2.97.30.dat`;
  const { stats, available, missing } = await getRomsForDatFile(datFile);
  console.log(JSON.stringify(stats, null, 2));
  // console.log("missing", JSON.stringify(missing.map(({ name }) => name)));
  // console.log(JSON.stringify(missing[0], null, 2));
  process.exit(0); */

  await indexGames(
    "/Users/lbombach/Downloads/Retro/MAME/RETRO_LEGENDS rom pack/Neo Geo/roms"
  );
})();
