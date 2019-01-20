const path = require("path");
const getRomsForDatFile = require("./src/getRomsForDatFile");
const indexGames = require("./src/indexGames");
const getEntriesFrom7Zip = require("./src/util/getEntriesFrom7Zip");
const get7ZipHeaders = require("./src/util/get7ZipHeaders");

(async () => {
  /* let datFile;
  datFile = `${__dirname}/datfiles/pandora_gngeo_084_filtered.dat`;
  // datFile = `${__dirname}/../datfiles/FB Alpha (ClrMame Pro XML, Neogeo only).dat`;
  // datFile = `${__dirname}/../datfiles/FB Alpha (ClrMame Pro XML, Arcade only).dat`;
  // const datFile = `${__dirname}/../datfiles/FB Alpha v0.2.97.30.dat`;
  const { stats, available, missing } = await getRomsForDatFile(datFile);
  console.log(JSON.stringify(stats, null, 2)); */

  /* await indexGames(
    //"/Users/lbombach/Downloads/Retro/MAME/RETRO_LEGENDS rom pack/Neo Geo/roms"
    //"/Users/lbombach/Downloads/Retro/MAME/MAME (Emulator + 3500 roms)"
    "/Users/lbombach/Downloads/Retro/MAME/MAME_0188u0_Complete_Romset"
  ); */

  await get7ZipHeaders();

  /*  const x = await getEntriesFrom7Zip(file);
  const bytes = getByteArray(file);

  const byte = (begin, end) => bytes.slice(begin, end + 1 || begin + 1);
  const dec = (begin, end) => parseInt(byte(begin, end).join(""), 16);
  const unint64 = (begin, end) =>
    parseInt(
      byte(begin, end)
        .reverse()
        .join(""),
      16
    );

  console.log();

  console.log("Signature       ", byte(0, 5));
  console.log("Version         ", byte(6, 7));
  console.log("StartHeaderCRC  ", byte(8, 9));
  console.log("NextHeaderOffset", byte(10, 17), unint64(10, 17) / 8);
  console.log("NextHeaderSize  ", byte(18, 25), unint64(18, 25) / 8);
  console.log("NextHeaderCRC   ", byte(26, 27));

  console.log();
  console.log(JSON.stringify(bytes));
  console.log();
  console.log(JSON.stringify(x, null, 2));
  console.log(); */

  process.exit(0);
})();

/* function getByteArray(filePath) {
  let fileData = fs.readFileSync(filePath).toString("hex");
  let result = [];
  for (var i = 0; i < fileData.length; i += 2) {
    result.push(`${fileData[i]}${fileData[i + 1]}`);
  }
  return result.map(hex => hex.toUpperCase());
}
 */
