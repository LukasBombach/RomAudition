const kNumUnPackStream = 0x0d;
const kSize = 0x09;
const kCRC = 0x0a;
const kEnd = 0x00;

const handlers = {
  [kNumUnPackStream.toString()]: undefined, //numUnPackStream,
  [kSize.toString()]: undefined, // size,
  [kCRC.toString()]: crc // crc  undefined
};

module.exports = async function subStreamsInfo(file) {
  const firstByte = await file.byte();
  const handler = handlers[firstByte.toString()];
  if (firstByte === kEnd) return [];
  if (!handler) throw new Error(`No handler for subStreamsInfo ${firstByte.toString(16).padStart(2, "0")}`);
  file.data.subStreamsInfo = file.data.subStreamsInfo || {};
  await handler(file);
  await subStreamsInfo(file);
};

async function crc(file) {
  const num = file.data.packInfo.numPackStreams;
  file.data.subStreamsInfo.crcs = [];
  for (let i = 0; i < num; i++) {
    const allAreDefined = await file.bool();
    if (!allAreDefined) throw new Error("Not Implemented");
    const crc = await file.hex(4);
    file.data.subStreamsInfo.crcs.push(crc);
  }
}
