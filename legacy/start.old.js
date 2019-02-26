const fs = require("fs");
// const read = require("fs").promises.read;
const promisify = require("util").promisify;
const lzma = require("lzma-native");
const open = promisify(fs.open);
const read = promisify(fs.read);

const parseFile = require("./src/models/sevenZip");
const File = require("./src/models/sevenZip/file");

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

  const fd = await open(paths[2], "r");
  /* const headerLength = 32;
  const buffer = Buffer.alloc(headerLength);
  const header = await read(fd, buffer, 0, headerLength, null); */

  //const header = await readHeader(fd);

  const info = await new Promise((res, rej) => {
    parseFileIndexFD(fd, 32, 65601755, function(err, info) {
      console.log("info", JSON.stringify(info, null, 2));
      //fs.close(fd);
      if (err) {
        rej(err);
        throw err;
      }
      res(info);
    });
  });

  console.log("info2", info);

  // const data = await parseFile(paths[2]);

  console.timeEnd("Execution Time");
  // console.log("\n", JSON.stringify(data, null, 2), "\n");

  process.exit(0);
})();

const parseFileIndexFD = function(fd, hdrOffset, size, callback) {
  return fs.fstat(fd, function(err, stats) {
    if (err) {
      return callback(err, null);
    }

    const magicNumber = 0xfd + 0x37 + 0x7a + 0x58 + 0x5a + 0x00;
    const firstRead = true;

    lzma.parseFileIndex(
      {
        fileSize: size,
        read: function(count, offset, cb) {
          var buffer = Buffer.allocUnsafe(count);

          fs.read(fd, buffer, 0, count, offset + hdrOffset, async function(err, bytesRead, buffer) {
            if (err) {
              return cb(err, null);
            }

            if (bytesRead !== count) {
              return cb(new Error("Truncated file!"), null);
            }

            const file = new File(fd);

            const hex = buffer
              .toString("hex")
              .match(/.{2}/g)
              .reverse()
              .join("");

            const hex2 = await file.readHexFromPos(offset + hdrOffset, 4);

            console.log(hex);
            console.log(hex2);

            cb(null, buffer);
          });
        }
      },
      callback
    );
  });
};

function readHeader(fd) {
  return new Promise((res, rej) => {
    const headerLength = 32;
    const buffer = Buffer.alloc(headerLength);
    fs.read(fd, buffer, 0, headerLength, -1, (err, bytesRead, buffer) => {
      if (err) {
        rej(err);
        throw err;
      }
      res(buffer);
    });
  });
}
