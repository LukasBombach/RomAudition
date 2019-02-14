const parseFile = require("./src/models/sevenZip");

(async () => {
  console.log("\x1Bc");

  const paths = [
    `${__dirname}/src/models/sevenZip/7ziptest/btchamp.7z`,
    "/Users/lbombach/Downloads/Retro/MAME/MAME_0188u0_Complete_Romset/roms/2mindril.7z",
    "/Users/lbombach/Downloads/Retro/MAME/MAME_0188u0_Complete_Romset/roms/garou.7z",
    "/Users/lbombach/Downloads/Retro/MAME/MAME_0188u0_Complete_Romset/roms/hbf700s.7z",
    "/Users/lbombach/Downloads/Retro/MAME/MAME_0188u0_Complete_Romset/roms/j6camelta.7z",
    "/Users/lbombach/Downloads/Retro/MAME/MAME_0188u0_Complete_Romset/roms/mslugx.7z"
  ];

  console.time("Execution Time");

  const data = await parseFile(paths[3]);

  console.timeEnd("Execution Time");
  console.log("\n", JSON.stringify(data, null, 2), "\n");

  process.exit(0);
})();
