module.exports = () => {
  const AdmZip = require("adm-zip");
  const zip = new AdmZip(path);
  return zip.getEntries();
};
