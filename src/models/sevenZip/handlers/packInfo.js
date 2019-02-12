module.exports = async function packInfo(file) {
  const packInfo = {
    packPos: await file.uInt64(),
    numPackStreams: await file.uInt64(),
    sizeMarker: await file.byte(), // or kCRC
    packSize: await file.uInt64(),
    endMarker: await file.byte()
  };
  file.data.packInfo = packInfo;
  return packInfo;
};
