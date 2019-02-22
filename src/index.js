const log = require("./logging");
const listGames = require("./listGames");

async function indexFolder(path) {
  const [games, gamesStats] = await listGames(path);
  const len = games.length;
  const logInterval = Math.min(len / 100, 0.04 * len);
  const hrstart = process.hrtime();
  log.gamesStats(gamesStats);
  /* for (let i = 0; i < len; i++) {
    const [game, gameStats] = await indexGame(games[i]);
    if (i % logInterval === 0) log.progress(game, i, len, hrstart);
  }
  log.report(gamesStats, hrstart); */
}
