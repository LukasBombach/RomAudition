const MongoClient = require("mongodb").MongoClient;

const mongoUrl = "mongodb://localhost:27017";
const dbName = "rom-audition";

class Store {
  static async setupDatabase() {
    const db = await Store.connectToDatabase();
    await db.createCollection("files", {});
    const collection = await db.collection("files");
    await collection.createIndex({ baseDir: "text", path: "text" });
    await Store.disconnect();
  }

  static async getCollection(name) {
    const db = await Store.connectToDatabase();
    return await db.collection(name);
  }

  static async connectToDatabase() {
    const options = { useNewUrlParser: true };
    Store.client = await MongoClient.connect(mongoUrl, options);
    return await Store.client.db(dbName);
  }

  static async disconnect() {
    await Store.client.close();
  }
}

module.exports = Store;
