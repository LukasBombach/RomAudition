module.exports = async function subStreamsInfo(file) {
  const allDefined = await file.int();
  return ["subStreamsInfo"];
};
