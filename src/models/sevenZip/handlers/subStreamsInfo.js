const kNumUnPackStream = 0x0d;
const kSize = 0x09;
const kCRC = 0x0a;
const kEnd = 0x00;

const handlers = {
  [kNumUnPackStream.toString()]: numUnPackStream,
  [kSize.toString()]: size,
  [kCRC.toString()]: crc
};

module.exports = async function subStreamsInfo(file) {
  const firstByte = await file.byte();
  const handler = handlers[firstByte.toString()];
  if (firstByte === kEnd) return;
  if (!handler) return [`No handler for subStreamsInfo ${firstByte.toString(16)}`];
  const value = await handler(size);
  return [...value, ...(await subStreamsInfo(file))];
};

async function numUnPackStream(file) {}
