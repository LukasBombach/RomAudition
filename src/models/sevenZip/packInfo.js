const kPackInfo = 0x06;

class PackInfo {
  async fromPosition(file, position) {
    await file.seek(position);
    return {
      packInfo: await file.byte(),
      packPos: await file.uInt64(),
      numPackStreams: await file.uInt64(),
      sizeMarker: await file.byte(), // or kCRC
      packSize: await file.uInt64(),
      endMarker: await file.byte()
    };
  }
}
