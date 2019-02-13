module.exports = async function packInfo(file) {
  file.data.packInfo = {
    packPos: await file.szUInt64(),
    numPackStreams: await file.szUInt64(),
    sizeMarker: await file.byte(), // or kCRC
    packSize: await file.szUInt64(),
    endMarker: await file.byte()
  };
  if (file.data.packInfo.sizeMarker !== 0x09) throw new Error("Not implemented");
};
