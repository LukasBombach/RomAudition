const readDirRec = require("recursive-readdir");
const Queue = require("p-queue");
const Store = require("./models/store");
const Game = require("./models/game");

class IndexGames {
  constructor(dir) {
    this.dir = dir;
    this.files = [];
    this.games = [];
  }

  async run() {
    this.files = await this.getFiles();
    this.games = await this.getGames();
    await this.writeGamesToDatabase();
    return games;
  }

  async getFiles() {
    const absPaths = await readDirRec(this.dir, [f => f.match(/\/\.[^\/]/)]);
    const paths = absPaths.map(absPath => absPath.slice(this.dir.length));
    return paths;
  }

  async getGames() {
    const queue = new Queue({ concurrency: 1 });
    const loadGames = this.files.map(file => () =>
      Game.fromDisk(this.dir, file)
    );
    const games = await queue.addAll(loadGames);
    return games;
  }

  async writeGamesToDatabase(games) {
    const collection = await Store.getCollection("games", "files");
    const bulk = collection.initializeOrderedBulkOp();
    games.forEach(game => this.addGameToBulk(bulk, game));
    await bulk.execute();
  }

  addGameToBulk(bulk, $set) {
    const { dir, file } = $set;
    bulk
      .find({ dir, file })
      .upsert()
      .updateOne({ $set });
  }
}

module.exports = indexGames;
