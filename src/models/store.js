const MongoClient = require("mongodb").MongoClient;

const mongoUrl = "mongodb://localhost:27017";
const dbName = "rom-audition";

class Store {
  static async getCollection(namespace, name, options = {}) {
    const db = await Store.connectToDatabase();
    const collections = await db.collections();
    const collectionName = `${namespace}.${name}`;
    if (!collections.includes(collectionName))
      await db.createCollection(collectionName, options);
    return await db.collection(collectionName);
  }

  static async connectToDatabase() {
    const options = { useNewUrlParser: true };
    const client = await MongoClient.connect(
      mongoUrl,
      options
    );
    return await client.db(dbName);
  }
}

module.exports = Store;
