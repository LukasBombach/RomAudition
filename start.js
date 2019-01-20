const path = require("path");
const getRomsForDatFile = require("./src/getRomsForDatFile");
const indexGames = require("./src/indexGames");

(async () => {
  /* let datFile;
  datFile = `${__dirname}/datfiles/pandora_gngeo_084_filtered.dat`;
  // datFile = `${__dirname}/../datfiles/FB Alpha (ClrMame Pro XML, Neogeo only).dat`;
  // datFile = `${__dirname}/../datfiles/FB Alpha (ClrMame Pro XML, Arcade only).dat`;
  // const datFile = `${__dirname}/../datfiles/FB Alpha v0.2.97.30.dat`;
  const { stats, available, missing } = await getRomsForDatFile(datFile);
  console.log(JSON.stringify(stats, null, 2)); */

  await indexGames(
    //"/Users/lbombach/Downloads/Retro/MAME/RETRO_LEGENDS rom pack/Neo Geo/roms"
    //"/Users/lbombach/Downloads/Retro/MAME/MAME (Emulator + 3500 roms)"
    "/Users/lbombach/Downloads/Retro/MAME/MAME_0188u0_Complete_Romset"
  );
  process.exit(0);
})();
