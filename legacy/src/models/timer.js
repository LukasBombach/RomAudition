class Timer {
  constructor() {
    this.start = process.hrtime();
  }

  lap() {
    const elapsedTime = process.hrtime(start);
    const s = elapsedTime[0];
    const ms = parseInt(elapsedTime[1] / 1000000, 10);
    return { s, ms };
  }
}

module.exports = Timer;
