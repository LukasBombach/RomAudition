const { parse } = require("path");
const spawn = require("child_process").spawn;
const path7za = require("7zip-bin").path7za;

module.exports = async function getEntriesFrom7Zip(path) {
  const rawHeader = await readRawHeaders(path);
  const blockStr = rawHeader.split("----------")[1].trim();
  const rawBlocks = blockStr.split("\n\n");
  const parsedBlocks = rawBlocks.map(parseBlock);
  return parsedBlocks.map(formatBlock);
};

function formatBlock(block) {
  const name = block.Path;
  const basename = parse(block.Path).name;
  const extension = parse(block.Path).ext.substr(1);
  const crc = block.CRC.toString(16)
    .toLowerCase()
    .padStart(8, "0");
  const size = block.Size;
  return { name, extension, basename, crc, size };
}

function parseBlock(block) {
  const rawLines = block.split("\n");
  const parsedLines = rawLines.map(parseLine);
  return parsedLines.reduce(
    (parsedBlock, parsedLine) => Object.assign(parsedBlock, parsedLine),
    {}
  );
}

function parseLine(line) {
  const match = line.match(/(\w+) = (.*)/);
  return match ? { [match[1]]: match[2] } : line;
}

function readRawHeaders(path) {
  return new Promise((resolve, reject) => {
    const child = spawn(path7za, ["l", "-slt", path]);
    let headerString = "";

    child.stdout.on("data", data => {
      headerString += data.toString("utf8");
    });

    child.stderr.on("data", data => {
      reject(data);
    });

    child.on("close", code => {
      resolve(headerString);
    });
  });
}
