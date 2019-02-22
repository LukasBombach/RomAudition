const ua = require("all-unpacker");

const paths = [
  `${__dirname}/src/models/sevenZip/7ziptest/btchamp.7z`,
  "/Users/lbombach/Downloads/Retro/MAME/MAME_0188u0_Complete_Romset/roms/2mindril.7z",
  "/Users/lbombach/Downloads/Retro/MAME/MAME_0188u0_Complete_Romset/roms/garou.7z",
  "/Users/lbombach/Downloads/Retro/MAME/MAME_0188u0_Complete_Romset/roms/hbf700s.7z",
  "/Users/lbombach/Downloads/Retro/MAME/MAME_0188u0_Complete_Romset/roms/j6camelta.7z",
  "/Users/lbombach/Downloads/Retro/MAME/MAME_0188u0_Complete_Romset/roms/mslugx.7z"
];

console.time("Execution Time");

ua.list(paths[0], { json: true }, function cb(err, files, text) {
  console.timeEnd("Execution Time");
  if (err) return console.error(err);
  const filesString = files.join("").replace(/,\s*\}/, "}");
  const json = JSON.parse(filesString);
  console.log("json", json);
});
