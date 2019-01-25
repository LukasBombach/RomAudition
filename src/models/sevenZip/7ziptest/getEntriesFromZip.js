const AdmZip = require("adm-zip");
const { parse } = require("path");

module.exports = path => {
  const zip = new AdmZip(path);
  const entries = zip.getEntries();
  const roms = entries.map(formatZipEntry);
  return roms;
};

function formatZipEntry(entry) {
  const name = parse(entry.name).name;
  const extension = parse(entry.name).ext.substr(1);
  const crc = entry.header.crc.toString(16).padStart(8, "0");
  const size = entry.header.size;
  return { name, extension, crc, size };
}
