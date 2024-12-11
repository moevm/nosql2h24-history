const { Database } = require('arangojs');

const db = new Database({
    url: process.env.ARANGO_URL || 'http://db:8529',
    databaseName: process.env.ARANGO_DB || 'city_data',
    auth: {
        username: process.env.ARANGO_USER || 'root',
        password: process.env.ARANGO_PASSWORD || 'password'
    }
});

module.exports = db;