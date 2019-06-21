const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect('mongodb://127.0.0.1:27017/NodeDB', { useNewUrlParser: true })
    .then(client => {
        console.log('Database Connected!');
        _db = client.db();
        // console.log(_db);
        callback();
    })
    .catch(err => {
        console.log(err);
        throw err;
    });
}

const getDb = () => {
    if(_db) {
        return _db;
    }
    throw 'No database found!';
}

module.exports = {
    mongoConnect: mongoConnect,
    getDb: getDb
}