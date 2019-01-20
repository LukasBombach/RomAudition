class Progress {
  constructor(max = 0) {
    this.start = process.hrtime();
    this.max = max;
  }

  lap(i) {
    const elapsedTime = process.hrtime(this.start);
    // const s = elapsedTime[0];
    // const ms = parseInt(elapsedTime[1] / 1000000, 10);
    const took = elapsedTime[0] + elapsedTime[1] / 10000000000;
    const remaining = (this.max / i) * took;
    return { took: took.toFixed(2), remaining: remaining.toFixed(2) };
  }
}

module.exports = Progress;
