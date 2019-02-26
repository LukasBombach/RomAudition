const prettyHrtime = require("pretty-hrtime");
const chalk = require("chalk");

module.exports.gamesStats = ({ num, time }) => {
  console.log(chalk.dim(prettyHrtime(time)), `Found ${num} games`);
};

module.exports.progress = (game, i, len, hrstart) => {
  const time = process.hrtime(hrstart);
  const percent = ((i / len) * 100).toFixed(2);
  console.log(chalk.dim(prettyHrtime(time)), percent, `Game ${i} of ${len} - ${game.name}`);
};

module.exports.report = ({ num }, hrstart) => {
  const time = process.hrtime(hrstart);
  console.log(chalk.dim(prettyHrtime(time)), `Processed ${num} games in ${prettyHrtime(time)}`);
};
