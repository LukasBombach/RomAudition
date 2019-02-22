var cp = require("child_process");

const paths = [
  `${__dirname}/src/models/sevenZip/7ziptest/btchamp.7z`,
  "/Users/lbombach/Downloads/Retro/MAME/MAME_0188u0_Complete_Romset/roms/2mindril.7z",
  "/Users/lbombach/Downloads/Retro/MAME/MAME_0188u0_Complete_Romset/roms/garou.7z",
  "/Users/lbombach/Downloads/Retro/MAME/MAME_0188u0_Complete_Romset/roms/hbf700s.7z",
  "/Users/lbombach/Downloads/Retro/MAME/MAME_0188u0_Complete_Romset/roms/j6camelta.7z",
  "/Users/lbombach/Downloads/Retro/MAME/MAME_0188u0_Complete_Romset/roms/mslugx.7z"
];

(async () => {
  console.time("Execution Time");
  const json = await lsar(paths[2]);
  console.timeEnd("Execution Time");
  console.log(json);
})();

function lsar(path) {
  return new Promise((resolve, reject) => {
    cp.exec(`./lsar -j ${path}`, (error, stdout) => {
      if (error) return reject(error);
      try {
        resolve(JSON.parse(stdout));
      } catch (error) {
        reject(error);
      }
    });
  });
}
