const { MongoClient } = require('mongodb');
const { MONGODB_URI, MONGODB_URI_TEST } = require('./server.config');
const { IS_DEVELOPMENT } = require('../utils/env.util');

const mongodb = new MongoClient(process.env.TESTING ? MONGODB_URI_TEST : MONGODB_URI);

async function setup() {
    try {
        var conn = await mongodb.connect();
        let db = conn.db();
        let collection;

        collection = db.collection("Customer");
        await collection.createIndex({ phone_number: 1 }, { unique: true, sparse: true });
        
        collection = db.collection("Registration");
        await collection.createIndex({ phone_number: 1 }, { unique: true, sparse: true });
        await collection.createIndex({ expire_at: 1 }, { expireAfterSeconds: 0 });

        collection = db.collection("Message");
        await collection.createIndex({ from: 1 });
        await collection.createIndex({ to: 1 });

    } catch(err) {
        if(IS_DEVELOPMENT) console.log(err);
    } finally {
        conn?.close();
    }
}

setup();

module.exports = mongodb;
