module.exports = async function packInfo(file) {
  return {
    packPos: await file.uInt64(),
    numPackStreams: await file.uInt64(),
    sizeMarker: await file.byte(), // or kCRC
    packSize: await file.uInt64(),
    endMarker: await file.byte()
  };
};
